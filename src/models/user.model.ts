import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user", required: true },
    interest: { type: [String], default: [] },
}, {
    timestamps: true
});

// Need for email lookup and unique mail
userSchema.index(
    { email: 1 },
    { unique: true }
);

// Needs for paginated admin user lists sorted by cretion timestamp
userSchema.index({ createdAt: -1 })

export type UserDocument = InferSchemaType<typeof userSchema>;

const User = mongoose.models.User || mongoose.model("User",userSchema)

export default User;