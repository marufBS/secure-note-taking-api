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
    interest?:string[];
}

interface UpdateUserPayload {
    name?: string;
    email?: string;
    password?: string;
    role?: "user" | "admin";
    interest?: string[];
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

export async function createUser(payload: CreateUserPayload) {
    const email = payload.email.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await bcrypt.hash(payload.password, 12);

    const user = await User.create({
        name: payload.name.trim(),
        email,
        passwordHash,
        role: payload.role,
        interest: payload.interest ?? []
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        interest:user.interest,
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

    if(payload.interest !== undefined){
        updates.interest = payload.interest;
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





// export async function groupUsersByInterests(
//     pagination: PaginationPayload
// ) {
//     const { page, limit } = pagination;
//     const skip = (page - 1) * limit;

//     const [result] = await User.aggregate([
//         {
//             $unwind: "$interests",
//         },
//         {
//             $group: {
//                 _id: "$interests",
//                 users: {
//                     $push: {
//                         id: "$_id",
//                         name: "$name",
//                     },
//                 },
//                 count: {
//                     $sum: 1,
//                 },
//             },
//         },
//         {
//             $sort: {
//                 _id: 1,
//             },
//         },
//         {
//             $facet: {
//                 data: [
//                     { $skip: skip },
//                     { $limit: limit },
//                 ],
//                 metadata: [
//                     { $count: "total" },
//                 ],
//             },
//         },
//     ]);

//     const groups = result?.data ?? [];
//     const total = result?.metadata?.[0]?.total ?? 0;

//     return {
//         groups,
//         pagination: {
//             page,
//             limit,
//             total,
//             totalPages: Math.ceil(total / limit),
//         },
//     };
// }


export async function groupUsersByInterests({ page, limit, }: { page: number; limit: number; }) {
    const skip = (page - 1) * limit;

    const [result] = await User.aggregate([
        // 1. Create one pipeline document per interest.
        { $unwind: "$interest", },

        // 2. Normalize interests: trim whitespace and lowercase.
        // Convert protects against unexpected legacy data.
        {
            $set: {
                normalizedInterest: {
                    $toLower: {
                        $trim: {
                            input: {
                                $convert: {
                                    input: "$interest",
                                    to: "string",
                                    onError: "",
                                    onNull: "",
                                },
                            },
                        },
                    },
                },
            },
        },

        // 3. Ignore empty or whitespace-only interests.
        {
            $match: {
                normalizedInterest: { $ne: "" },
            },
        },

        // 4. Deduplicate each user-interest pair.
        {
            $group: {
                _id: {
                    userId: "$_id",
                    interest: "$normalizedInterest",
                },
                user: {
                    $first: {
                        id: "$_id",
                        name: "$name",
                    },
                },
            },
        },

        // 5. Group users by their normalized interest.
        {
            $group: {
                _id: "$_id.interest",
                users: {
                    $push: "$user",
                },
                count: {
                    $sum: 1,
                },
            },
        },

        // 6. Alphabetical ordering.
        {
            $sort: {
                _id: 1,
            },
        },

        // 7. Paginate groups and count all groups in one operation.
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
