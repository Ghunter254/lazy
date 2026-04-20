import express from "express";
import { toNodeHandler } from "better-auth/node";
import studentRoutes from "./modules/student/student.routes.js";
import { createServer } from "http";
import { initSocket } from "./core/socket/socket.js";
import { auth } from "./core/auth/auth.js";

const app = express();

const httpServer = createServer(app);
const io = initSocket(httpServer);

app.use(express.json());

app.all("/api/auth/*path", toNodeHandler(auth));
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.send("Health check...");
});

httpServer.listen(3000, () => {
  console.log("Server listening on port 3000");
});
