import Note from "../models/note.model.js";

interface CreateNotePayload {
    title: string;
    content: string;
}

interface UpdateNotePayload {
    title?: string;
    content?: string;
}

interface PaginationPayload {
    page: number;
    limit: number;
}

export async function createNote(userId: string, payload: CreateNotePayload) {
    const note = await Note.create({
        title: payload.title,
        content: payload.content,
        userId,
    });

    return note;
}

export async function getUserNotes(userId: string, pagination: PaginationPayload) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
        Note.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Note.countDocuments({ userId }),
    ]);

    return {
        notes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getNoteById(userId: string, noteId: string) {
    return Note.findOne({
        _id: noteId,
        userId,
    });
}

export async function updateNote(userId: string, noteId: string, payload: UpdateNotePayload) {
    return Note.findOneAndUpdate({
        _id: noteId,
        userId,
    },
        { $set: payload, },
        {
            new: true,
            runValidators: true,
        });
}

export async function deleteNote(userId: string, noteId: string) {
    return Note.findOneAndDelete({
        _id: noteId,
        userId,
    });
}