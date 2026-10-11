import "dotenv/config";
import mongoose from "mongoose";

import User from "../models/user.model.js";
import Note from "../models/note.model.js";
import Post from "../models/post.model.js";

async function checkIndexes():Promise<void>{
    try {
        await mongoose.connect(process.env.MONGODB_URI!);

        await Promise.all([
            User.createIndexes(),
            Note.createIndexes(),
            Post.createIndexes()
        ])

        console.log("User indexes:",await User.collection.indexes());
        console.log("Note indexes:",await Note.collection.indexes());
        console.log("Post indexes:",await Post.collection.indexes());
    } finally {
        await mongoose.disconnect();
    }
}

checkIndexes().catch((error)=>{
    console.error("Index verification failed:",error);
    process.exit(1)
});