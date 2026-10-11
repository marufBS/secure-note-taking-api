import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";

const router = Router();

router.get("/me", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.auth!.userId);

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                interests: user.interests,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;