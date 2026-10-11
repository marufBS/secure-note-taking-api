import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"

const JWT_SECRET = process.env.JWT_SECRET || "someting";

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured")
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authentication required" })
        return
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
        res.status(401).json({ message: "Authentication required" })
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);

        if (typeof payload === "string" || typeof payload.sub !== "string") {
            res.status(401).json({ message: "Invalid token" });
            return;
        }

        const user = await User.findById(payload.sub).select("_id role");

        if (!user) {
            res.status(401).json({ message: "Invalid or expired session" })
            return;
        }

        if (user.role !== "user" && user.role !== "admin") {
            res.status(401).json({ message: "Invalid account role" })
            return;
        }

        req.auth = {
            userId: user.id,
            role: user.role
        }

        next()
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError
        ) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }

        console.error("Authentication error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export function requireRole(...roles: Array<"user" | "admin">) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.auth) {
            res.status(401).json({ message: "Authentication required" })
            return;
        }

        if(!roles.includes(req.auth.role)){
            res.status(403).json({message:"Forbidden"})
            return;
        }

        next()
    }
}