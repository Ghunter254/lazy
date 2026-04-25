import { repo } from "../../infra/db/repo.js";
import { studentRepo } from "./student.repo.js";

export const studentService = {
  async createProfile(userId: string, data: any) {
    const existing = await repo.students.getByUserId(userId);
    if (existing) {
      throw new Error("User already has an associated profile.");
    }

    // repo  with realtime wrapper.
    return await studentRepo.create({
      id: crypto.randomUUID(),
      userId,
      ...data,
    });
  },

  async getProfile(userId: string) {
    return await repo.students.getByUserId(userId);
  },

  async listAll() {
    // Has realtime as well
    return await studentRepo.list();
  },
};
