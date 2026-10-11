import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { getUserPostsHandler,createPostHandler } from "../controllers/post.controller.js";

const router = Router();

router.get("/users/:userId/posts", getUserPostsHandler);
router.post("/posts",authenticate,createPostHandler)

export default router;