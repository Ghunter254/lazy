import { auth } from "../core/auth/auth.ts";

type SessionData = typeof auth.$Infer.Session;
declare global {
  namespace Express {
    interface Request {
      user?: SessionData["user"];
      session?: SessionData["session"];
    }
  }
}
