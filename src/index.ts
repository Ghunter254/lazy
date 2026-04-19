import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import studentRoutes from "./routes/student.routes.js";

const app = express();
app.use(express.json());

app.all("/api/auth/*path", toNodeHandler(auth));
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.send("Health check...");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
