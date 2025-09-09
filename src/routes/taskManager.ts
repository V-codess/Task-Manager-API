import { Router } from "express";
import {
  mainRoute,
  getAllTasks,
  createTask,
  editTask,
  markAsInProgress,
  markAsComplete,
  getTaskById,
  getPaginatedTasks,
  getFilteredTasks
} from "../controllers/taskManager";
import { register, login } from "../controllers/authentication";
import { authenticateJWT } from "../middlewares/middleware";

const router = Router();

router.get("/", mainRoute);
router.get("/tasks",authenticateJWT, getAllTasks);
router.post("/create-task", authenticateJWT,createTask);
router.patch("/update-task/:id",authenticateJWT, editTask);
router.patch("/status-inprogress/:id", authenticateJWT,markAsInProgress);
router.patch("/status-completed/:id", authenticateJWT,markAsComplete);
router.get("/task/:id",authenticateJWT, getTaskById);
router.get("/tasksPage", authenticateJWT, getPaginatedTasks); // ?page=1&limit=5
router.get("/tasksFilter", authenticateJWT, getFilteredTasks); // ?status=pending&search=meeting&page=1&limit=5

// auth
router.post("/register", register);
router.post("/login", login);

export default router;
