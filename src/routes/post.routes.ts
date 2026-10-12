import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createPostHandler, getAllPostsHandler } from "../controllers/post.controller.js";

const router = Router();

router.post("/posts", authenticate, createPostHandler)
router.get("/posts", getAllPostsHandler);

export default router;