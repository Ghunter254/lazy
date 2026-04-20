import { studentRepo } from "./student.repo.js";

export const studentService = {
  async createProfile(userId: string, data: any) {
    const existing = await studentRepo.getByUserId(userId);
    if (existing) {
      throw new Error("User already has an associated profile.");
    }

    return await studentRepo.create({
      id: crypto.randomUUID(),
      userId,
      ...data,
    });
  },

  async getProfile(userId: string) {
    return await studentRepo.getByUserId(userId);
  },

  async listAll() {
    return await studentRepo.list();
  },
};
