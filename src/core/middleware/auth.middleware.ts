import type { Request, Response, NextFunction } from "express";
import { getSession } from "../utils/auth.utils.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const sessionData = await getSession(req);

  if (!sessionData) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "You must be logged in to access this resource.",
    });
  }

  req.user = sessionData.user;
  req.session = sessionData.session;

  next();
};
