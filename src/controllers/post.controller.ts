import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import {createPost,getUserPosts } from "../services/post.service.js";

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

const createPostSchema = z.object({
    title: z.string().trim().min(1).max(200),
    content: z.string().trim().min(1).max(10000),
});


export async function createPostHandler(req: Request, res: Response, next: NextFunction) {
    try {
        const parsed = createPostSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid post data",
                errors: parsed.error.flatten(),
            });
        }

        const post = await createPost(
            req.auth!.userId,
            parsed.data
        );

        return res.status(201).json({ post });
    } catch (error) {
        next(error);
    }
}

// export async function getUserPostsHandler(req: Request, res: Response): Promise<void> {
//     const { userId } = req.params;

//     if (!mongoose.isValidObjectId(userId)) {
//         res.status(400).json({ message: "Invalid user ID" });
//         return;
//     }

//     const parsed = paginationSchema.safeParse(req.query);

//     if (!parsed.success) {
//         res.status(400).json({
//             message: "Invalid pagination parameters",
//             errors: parsed.error.flatten(),
//         });
//         return;
//     }

//     try {
//         const result = await getUserPosts(userId as string, parsed.data);

//         if (!result) {
//             res.status(404).json({ message: "User not found" });
//             return;
//         }

//         res.status(200).json(result);
//     } catch (error) {
//         console.error("Get user posts error:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// }


export async function getAllPostsHandler(req: Request, res: Response): Promise<void> {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid pagination parameters",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const result = await getUserPosts(parsed.data);
        res.status(200).json(result);
    } catch (error) {
        console.error("Get all posts error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}