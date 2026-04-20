import type { Request, Response } from "express";
import { studentService } from "./student.service.js";

export const studentController = {
  async create(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const profile = await studentService.createProfile(userId, req.body);

      return res.status(201).json(profile);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  async me(req: Request, res: Response) {
    const profile = await studentService.getProfile(req.user!.id);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    return res.json(profile);
  },
};
