import { model, Schema, HydratedDocument } from "mongoose";

export interface ITask extends Document {
  taskId: number;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed";
  id: string;
  userId: string;
}

interface ICounter {
  id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = model<ICounter>("Counter", counterSchema);

const tasksSchema = new Schema<ITask>(
  {
    taskId: {
      type: Number,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
    },
    userId: {
      type: String,
      ref: "users"
    },
    id: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

tasksSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

tasksSchema.pre("save", async function (next) {
  const doc = this as HydratedDocument<ITask>;

  if (!doc.isNew) return next(); // Only on new docs

  const counter = await Counter.findOneAndUpdate(
    { id: "taskId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  doc.taskId = counter.seq;
  next();
});
const tasks = model("tasks", tasksSchema);
export default tasks;
