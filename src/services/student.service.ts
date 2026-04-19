import { repo } from "../db/repo.js";

export const studentService = {
  async createProfile(userId: string, data: any) {
    const existing = await repo.students.getByUserId(userId);
    if (existing) {
      throw new Error("User already has an associated profile.");
    }

    return await repo.students.create({
      id: crypto.randomUUID(),
      userId,
      ...data,
    });
  },

  async getProfile(userId: string) {
    return await repo.students.getByUserId(userId);
  },

  async listAll() {
    return await repo.students.list();
  },
};
