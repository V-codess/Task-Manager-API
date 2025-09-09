import mongoose from "mongoose";

const database = async (url: string) => {
  mongoose.set("strictQuery", false);
  return await mongoose
    .connect(url)
    .then(() => console.log("server connected to the database"))
    .catch((error) => console.log("error connecting DB:", error));
};

export default database;
