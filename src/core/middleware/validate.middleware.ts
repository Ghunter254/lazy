import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    // refer to zod docs for result structure.
    // https://zod.dev/error-customization

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed",
        issues: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
};
