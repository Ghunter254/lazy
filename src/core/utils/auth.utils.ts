import type { Request } from "express";
import { auth } from "../auth/auth.js";

export const getSession = async (req: Request) => {
  return await auth.api.getSession({
    headers: req.headers,
  });
};

export const getAuthUser = async (req: Request) => {
  const session = await getSession(req);
  return session?.user ?? null;
};
