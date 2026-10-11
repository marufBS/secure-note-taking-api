import mongoose, { Schema, type InferSchemaType } from "mongoose";

const noteSchema = new Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, {
    timestamps: true
})


// needs a user's notes sorted in descending order
noteSchema.index({
    userId: 1,
    createdAt: -1
})

// needs admin lists of all notes sorted descending order
noteSchema.index({createdAt:-1});

export type NoteDocuemnt = InferSchemaType<typeof noteSchema>;

const Note = mongoose.models.Note ||mongoose.model("Note",noteSchema);

export default Note;