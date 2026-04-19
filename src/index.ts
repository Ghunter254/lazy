import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();

app.all("/api/auth/*path", toNodeHandler(auth));

app.get("/", (req, res) => {
  res.send("Health check...");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
