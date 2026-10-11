import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import {
    createNote,
    getUserNotes,
    getNoteById,
    updateNote,
    deleteNote,
} from "../services/note.service.js";

const createNoteSchema = z.object({
    title: z.string().trim().min(1).max(200),
    content: z.string().trim().min(1).max(10000),
});

const updateNoteSchema = z.object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().trim().min(1).max(10000).optional(),
}).refine(
    (data) => data.title !== undefined || data.content !== undefined,
    { message: "At least one field must be provided" }
);

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export async function createNoteHandler(req: Request, res: Response): Promise<void> {
    const parsed = createNoteSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid note data",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const note = await createNote(req.auth!.userId, parsed.data);

        res.status(201).json({ note });
    } catch (error) {
        console.error("Create note error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function listNotesHandler(req: Request, res: Response): Promise<void> {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid pagination parameters",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const result = await getUserNotes(
            req.auth!.userId,
            parsed.data
        );

        res.status(200).json(result);
    } catch (error) {
        console.error("List notes error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getNoteHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid note ID" });
        return;
    }

    try {
        const note = await getNoteById(req.auth!.userId, id as string);

        if (!note) {
            res.status(404).json({ message: "Note not found" });
            return;
        }

        res.status(200).json({ note });
    } catch (error) {
        console.error("Get note error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateNoteHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid note ID" });
        return;
    }

    const parsed = updateNoteSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid note data",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const note = await updateNote(req.auth!.userId, id as string, parsed.data);

        if (!note) {
            res.status(404).json({ message: "Note not found" });
            return;
        }

        res.status(200).json({ note });
    } catch (error) {
        console.error("Update note error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteNoteHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid note ID" });
        return;
    }

    try {
        const note = await deleteNote(req.auth!.userId, id as string);

        if (!note) {
            res.status(404).json({ message: "Note not found" });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error("Delete note error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}