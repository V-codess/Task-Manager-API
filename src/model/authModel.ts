import { model, Schema, HydratedDocument } from "mongoose";

export interface ITask extends Document {
  userId: number;
  name: string;
  email: string;
  password: string;
  id: string;
}

interface ICounter {
  id: string;
  seq: number;
}

const userCounterSchema = new Schema<ICounter>({
  id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = model<ICounter>("userCounter", userCounterSchema);

const authSchema = new Schema<ITask>(
  {
    userId: {
      type: Number,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    id: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

authSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

authSchema.pre("save", async function (next) {
  const doc = this as HydratedDocument<ITask>;

  if (!doc.isNew) return next(); // Only on new docs

  const counter = await Counter.findOneAndUpdate(
    { id: "userId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  doc.userId = counter.seq;
  next();
});
const users = model("users", authSchema);
export default users;
