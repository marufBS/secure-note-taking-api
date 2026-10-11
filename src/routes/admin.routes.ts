import { Router } from "express";

import {
    listUsersHandler,
    createUserHandler,
    updateUserHandler,
    deleteUserHandler,
    getAllNotes,
    groupUsersByInterestsHandler,
} from "../controllers/admin.controller.js";

import {
    authenticate,
    requireRole,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/users", listUsersHandler);
router.post("/users", createUserHandler);
router.patch("/users/:id", updateUserHandler);
router.delete("/users/:id", deleteUserHandler);

router.get("/notes", getAllNotes);

router.get("/users/by-interests", groupUsersByInterestsHandler);

export default router;