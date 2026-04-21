import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  schoolEmail: z.email(), // in newer zod versions.
  course: z.string().min(1),
  yearOfStudy: z.int(), // could use z.number()
});
