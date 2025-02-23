import { Schema, model } from "mongoose";

const taskSchema = Schema({
  title: { type: String, required: true },
  desc: { type: String },
  status: { type: Boolean, default: false },
});

const Task = model("tasks", taskSchema);

export default Task;