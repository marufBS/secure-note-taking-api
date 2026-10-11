import express from "express";
import cors from "cors"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js";
import noteRoutes from "./routes/note.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import postRoutes from "./routes/post.routes.js";

const app = express();


app.use(express.json());
app.use(cors())

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok.",
        message: "Secure Note-Taking API is running"
    })
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", postRoutes);

export default app