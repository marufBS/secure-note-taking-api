import type { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import {
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    listAllNotes,
    groupUsersByInterests,
} from "../services/admin.service.js";

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});


const interestsSchema = z
    .array(z.string().trim().min(1).max(50))
    .max(20)
    .transform((interests) => [
        ...new Map(
            interests.map((interest) => [
                interest.toLowerCase(),
                interest,
            ]),
        ).values(),
    ]);

const createUserSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(72),
    role: z.enum(["user", "admin"]).default("user"),
    interest: interestsSchema.optional()
});

const updateUserSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().max(254).optional(),
    password: z.string().min(8).max(72).optional(),
    role: z.enum(["user", "admin"]).optional(),
    interest: interestsSchema.optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" }
);



export async function listUsersHandler(req: Request, res: Response): Promise<void> {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid pagination parameters",
        });
        return;
    }

    try {
        const result = await listUsers(parsed.data);
        res.status(200).json(result);
    } catch (error) {
        console.error("Admin list users error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function createUserHandler(req: Request, res: Response): Promise<void> {
    const parsed = createUserSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid user data",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const user = await createUser(parsed.data);
        res.status(201).json({ user });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "EMAIL_ALREADY_EXISTS"
        ) {
            res.status(409).json({
                message: "An account with this email already exists",
            });
            return;
        }

        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
            res.status(409).json({
                message: "An account with this email already exists",
            });
            return;
        }

        console.error("Admin create user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateUserHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid user data",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const user = await updateUser(id as string, parsed.data);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
            res.status(409).json({
                message: "An account with this email already exists",
            });
            return;
        }

        console.error("Admin update user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteUserHandler(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ message: "Invalid user ID" });
        return;
    }

    if (req.auth?.userId === id) {
        res.status(400).json({
            message: "You cannot delete your own account through this endpoint",
        });
        return;
    }

    try {
        const user = await deleteUser(id as string);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error("Admin delete user error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export async function getAllNotes(req: Request, res: Response,): Promise<void> {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid pagination parameters",
            errors: parsed.error.flatten(),
        });
        return;
    }

    const result = await listAllNotes(parsed.data);
    res.status(200).json(result);
}



export async function groupUsersByInterestsHandler(req: Request, res: Response): Promise<void> {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid pagination parameters",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const result = await groupUsersByInterests(parsed.data);

        res.status(200).json(result);
    } catch (error) {
        console.error("Group users by interests error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
}