import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Note from "../models/note.model.js";

interface PaginationPayload {
    page: number;
    limit: number;
}

interface CreateUserPayload {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
}

interface UpdateUserPayload {
    name?: string;
    email?: string;
    password?: string;
    role?: "user" | "admin";
}

export async function listUsers(pagination: PaginationPayload) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(),
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function createUser(input: CreateUserPayload) {
    const email = input.email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await User.create({
        name: input.name.trim(),
        email,
        passwordHash,
        role: input.role,
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}

export async function updateUser(userId: string, payload: UpdateUserPayload) {
    const { password, ...fields } = payload;
    const updates: Record<string, unknown> = { ...fields };

    if (password !== undefined) {
        updates.passwordHash = await bcrypt.hash(password, 12);
    }

    if (updates.email !== undefined) {
        updates.email = String(updates.email).trim().toLowerCase();
    }

    if (updates.name !== undefined) {
        updates.name = String(updates.name).trim();
    }

    return User.findByIdAndUpdate(
        userId,
        { $set: updates },
        {
            new: true,
            runValidators: true,
        }
    ).select("-passwordHash");
}

export async function deleteUser(userId: string) {
    return User.findByIdAndDelete(userId);
}


export async function listAllNotes(pagination: PaginationPayload) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
        Note.find()
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Note.countDocuments(),
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





export async function groupUsersByInterests(
    pagination: PaginationPayload
) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [result] = await User.aggregate([
        {
            $unwind: "$interests",
        },
        {
            $group: {
                _id: "$interests",
                users: {
                    $push: {
                        id: "$_id",
                        name: "$name",
                    },
                },
                count: {
                    $sum: 1,
                },
            },
        },
        {
            $sort: {
                _id: 1,
            },
        },
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit },
                ],
                metadata: [
                    { $count: "total" },
                ],
            },
        },
    ]);

    const groups = result?.data ?? [];
    const total = result?.metadata?.[0]?.total ?? 0;

    return {
        groups,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}