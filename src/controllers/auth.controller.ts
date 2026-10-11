import type { Request, Response } from "express";
import { z } from "zod";
import {
    loginUser,
    registerUser,
} from "../services/auth.service.js";

const registerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(72),
});


const loginSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1).max(72),
});


export async function register(req: Request, res: Response): Promise<void> {
    console.log("first")
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid registration data",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const user = await registerUser(parsed.data);

        res.status(201).json({
            message: "Registration successful",
            user,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
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

        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid login data",
            errors: parsed.error.flatten(),
        });
        return;
    }

    try {
        const result = await loginUser(parsed.data);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }

        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}