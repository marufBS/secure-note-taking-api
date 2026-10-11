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


export async function createPost(  userId: string,  payload: CreatePostPayload) {
  const post = await Post.create({
    title: payload.title,
    content: payload.content,
    userId,
  });

  return post;
}

export async function getUserPosts(userId: string, pagination: PaginationPayload) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const results = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "userId",
                pipeline: [
                    {
                        $facet: {
                            data: [
                                { $sort: { createdAt: -1 } },
                                { $skip: skip },
                                { $limit: limit },
                            ],
                            metadata: [
                                { $count: "total" },
                            ],
                        },
                    },
                ],
                as: "postResults",
            },
        },
        {
            $unwind: "$postResults",
        },
        {
            $project: {
                _id: 0,
                user: {
                    id: "$_id",
                    name: "$name",
                },
                posts: "$postResults.data",
                total: {
                    $ifNull: [
                        {
                            $arrayElemAt: [
                                "$postResults.metadata.total",
                                0,
                            ],
                        },
                        0,
                    ],
                },
            },
        },
    ]);

    if (results.length === 0) {
        return null;
    }

    const result = results[0];

    return {
        user: result.user,
        posts: result.posts,
        pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
        },
    };
}

