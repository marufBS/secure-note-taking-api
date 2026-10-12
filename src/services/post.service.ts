import mongoose from "mongoose";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";

interface PaginationPayload {
    page: number;
    limit: number;
}

interface CreatePostPayload {
    title: string;
    content: string;
}


export async function createPost(userId: string, payload: CreatePostPayload) {
    const post = await Post.create({
        title: payload.title,
        content: payload.content,
        userId,
    });

    return post;
}



export async function getUserPosts(pagination: PaginationPayload) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [result] = await Post.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "author",
            },
        },
        {
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $facet: {
                posts: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            title: 1,
                            content: 1,
                            userId: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            author: {
                                _id: "$author._id",
                                name: "$author.name",
                                email: "$author.email",
                            },
                        },
                    },
                ],
                metadata: [{ $count: "total" }],
            },
        },
    ]);

    const total = result?.metadata[0]?.total ?? 0;

    return {
        posts: result?.posts ?? [],
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

