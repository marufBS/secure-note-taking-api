import mongoose, { Schema, type InferSchemaType } from "mongoose";

const postSchema = new Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true
})


postSchema.index({userId:1,createdAt:-1});

export type PostDocument = InferSchemaType<typeof postSchema>

const Post = mongoose.models.Post || mongoose.model("Post",postSchema);

export default Post;