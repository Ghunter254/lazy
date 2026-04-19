import { auth } from "../lib/auth.js";
import type { Request } from "express";

export const getSession = async (req: Request) => {
  return await auth.api.getSession({
    headers: req.headers,
  });
};

export const getAuthUser = async (req: Request) => {
  const session = await getSession(req);
  return session?.user ?? null;
};
