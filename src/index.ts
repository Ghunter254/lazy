import express from "express";
import { toNodeHandler } from "better-auth/node";
import studentRoutes from "./modules/student/student.routes.js";
import { createServer } from "http";
import { initSocket } from "./core/socket/socket.js";
import { auth } from "./core/auth/auth.js";
import { sendEmail } from "./core/mailer/mailer.service.js";

const app = express();

const httpServer = createServer(app);
const io = initSocket(httpServer);

app.use(express.json());

// This gives you a lot of auth routes out of the box.
// refer to better auth docs to see what you can and cannot do
// https://better-auth.com/docs/authentication/email-password
app.all("/api/auth/*path", toNodeHandler(auth));
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.send("Health check...");
});

app.post("/test/email", async (req, res) => {
  try {
    await sendEmail({
      to: "otsyula6764@gmail.com",
      subject: "Lazy mailer test",
      text: "If you are reading this, the mailer works.",
    });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

httpServer.listen(3000, () => {
  console.log("Server listening on port 3000");
});
