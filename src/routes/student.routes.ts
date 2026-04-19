import { Router } from "express";
import { studentController } from "../controllers/student.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// Apply protection to all routes in this module
router.use(protect);

router.post("/", studentController.create);
router.get("/me", studentController.me);

export default router;
