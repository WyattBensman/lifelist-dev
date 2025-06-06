import { Collage } from "../../../../models/index.mjs";
import { isUser } from "../../../../utils/auth.mjs";

export const getComments = async (_, { collageId }, { user }) => {
  try {
    isUser(user);
    console.log(`Fetching comments for collageId: ${collageId}`);
    const collage = await Collage.findById(collageId)
      .populate({
        path: "comments",
        populate: [
          {
            path: "author",
            select: "_id username fullName profilePicture",
          },
          {
            path: "likedBy",
            select: "_id",
          },
        ],
      })
      .exec();

    if (!collage) {
      console.error(`Collage not found for ID: ${collageId}`);
      throw new Error("Collage not found.");
    }

    console.log(`Comments fetched successfully for collageId: ${collageId}`);
    return collage.comments || [];
  } catch (error) {
    console.error(
      `Error fetching comments for collageId: ${collageId} - ${error.message}`
    );
    throw new Error(error.message);
  }
};

export const getTaggedUsers = async (_, { collageId }, { user }) => {
  isUser(user);
  const collage = await Collage.findById(collageId)
    .populate({
      path: "tagged",
      select: "_id username fullName profilePicture",
    })
    .exec();
  if (!collage) throw new Error("Collage not found.");
  return collage.tagged;
};

export const getInteractions = async (_, { collageId }, { user }) => {
  isUser(user);
  const collage = await Collage.findById(collageId)
    .populate("likes reposts saves comments")
    .exec();

  if (!collage) throw new Error("Collage not found.");

  // Assuming likes, reposts, saves, and comments are arrays of user IDs
  const likesCount = collage.likes.length;
  const repostsCount = collage.reposts.length;
  const savesCount = collage.saves.length;
  const commentsCount = collage.comments.length;

  return {
    likes: likesCount,
    reposts: repostsCount,
    saves: savesCount,
    comments: commentsCount,
  };
};
