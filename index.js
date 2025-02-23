import express, { json } from "express";
import { connect } from "mongoose";
import User from "./user.model.js";
import Task from "./task.model.js";
import { hash, compare } from "bcryptjs";
import pkg from "jsonwebtoken"
import cors from "cors";
import 'dotenv/config'

const {sign}=pkg
const app = express();
app.use(cors());
app.use(json());

app.listen(3000, () => {
  console.log("[server] : Running on port 3000");
  connectDB();
});

async function connectDB() {
  try {
    await connect(
        process.env.MONGO_CONNECTION
    );
    console.log("[server] : MongoDB Atlas connected");
  } catch (err) {
    console.log("[server] : Error connecting to MongoDB Atlas", err);
  }
}

app.get("/", (req, res) => {
  res.send("Welcome to my ExpressJS server");
});

app.post("/tasks", async (req, res) => {
  const { title, desc, status } = req.body;
  const tasks = await Task.create({
    title,
    desc,
    status,
  });

  res.send({
    message: "Task is created",
    tasks,
  });
});

app.get("/read", async (req, res) => {
  const tasks = await Task.find({});
  res.send({
    message: "The following are the tasks",
    tasks,
  });
});

app.delete("/tasks/:id", async (req, res) => {
  const tasks = await Task.findByIdAndDelete(req.params.id);
  res.send({
    message: "Task removed",
    tasks,
  });
});

app.patch("/tasks/:id", async (req, res) => {
  const tasks = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.send({
    message: "Task modified",
    tasks,
  });
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await hash(password, 10);
  const users = new User({ username, email, password: hashedPassword });
  await users.save();
  res.json({ message: "Registration successful" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = await User.findOne({ email });
  if (!users) return res.status(400).json({ message: "Cannot find user" });

  const isValid = await compare(password, users.password);
  if (!isValid) return res.status(400).json({ message: "Faulty credentials" });

  const token = sign({ userId: users._id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  res.json({ message: "Login successful", token });
});