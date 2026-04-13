import { Router } from "express";
import * as userController from "../controllers/userController.js";

const router = Router();

// GET /api/users → Danh sách User
router.get("/", userController.getUsers);

export default router;
