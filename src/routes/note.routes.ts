import { Router } from "express";

import {
    createNoteHandler,
    listNotesHandler,
    getNoteHandler,
    updateNoteHandler,
    deleteNoteHandler,
} from "../controllers/note.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", createNoteHandler);
router.get("/", listNotesHandler);
router.get("/:id", getNoteHandler);
router.patch("/:id", updateNoteHandler);
router.delete("/:id", deleteNoteHandler);

export default router;