import { Router } from "express";
import { studentController } from "./student.controller.js";
import { protect } from "../../core/middleware/auth.middleware.js";
import { validate } from "../../core/middleware/validate.middleware.js";
import { createStudentSchema } from "./student.schema.js";

const router = Router();

// Apply protection to all routes in this module
router.use(protect);

router.post("/", validate(createStudentSchema), studentController.create);
router.get("/me", studentController.me);

export default router;
