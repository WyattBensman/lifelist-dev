import { Collage, User } from "../../../../models/index.mjs";
import { isUser } from "../../../../utils/auth.mjs";
import createNotification from "../notifications/createNotification.mjs";

const updateCollage = async (
  _,
  { collageId, caption, images, taggedUsers, coverImage },
  { user }
) => {
  try {
    // Ensure the user is authenticated
    isUser(user);

    // Validate that the collage exists and belongs to the current user
    const collage = await Collage.findById(collageId);
    if (!collage) {
      throw new Error("Collage not found.");
    }

    // Validate the number of images (1 to 12 allowed)
    if (!images || images.length === 0) {
      throw new Error("At least one image is required to update a collage.");
    }
    if (images.length > 12) {
      throw new Error("A collage can have at most 12 images.");
    }

    // Determine the cover image
    const selectedCoverImage = coverImage || images[0];
    if (!selectedCoverImage) {
      throw new Error("A valid cover image must be provided.");
    }

    // Identify newly tagged users
    const previousTaggedUsers = collage.tagged.map(String);
    const updatedTaggedUserIds = taggedUsers.map((user) => user);

    const newlyTaggedUsers = updatedTaggedUserIds.filter(
      (userId) => !previousTaggedUsers.includes(userId)
    );

    // Send a notification to each newly tagged user
    for (const taggedUserId of newlyTaggedUsers) {
      await createNotification({
        recipientId: taggedUserId,
        senderId: user,
        type: "TAG",
        message: `tagged you in a collage.`,
      });
    }

    // Update the collage fields
    collage.caption = caption || collage.caption;
    collage.images = images;
    collage.coverImage = selectedCoverImage;
    collage.tagged = updatedTaggedUserIds;

    // Save the updated collage
    await collage.save();

    return {
      success: true,
      message: "Collage successfully updated.",
    };
  } catch (error) {
    throw new Error(
      `An error occurred while updating the collage: ${error.message}`
    );
  }
};

export default updateCollage;

// Update taggedCollages for users
/*       const currentTaggedUserIds = collage.tagged.map((user) =>
        user._id.toString()
      );

      const newlyTaggedUsers = updatedTaggedUserIds.filter(
        (id) => !currentTaggedUserIds.includes(id)
      );

      const untaggedUsers = currentTaggedUserIds.filter(
        (id) => !updatedTaggedUserIds.includes(id)
      );

      if (newlyTaggedUsers.length > 0) {
        await User.updateMany(
          { _id: { $in: newlyTaggedUsers } },
          { $addToSet: { taggedCollages: collage._id } }
        );
      }

      if (untaggedUsers.length > 0) {
        await User.updateMany(
          { _id: { $in: untaggedUsers } },
          { $pull: { taggedCollages: collage._id } }
        );
      } */

// Send notifications to newly tagged users
/* for (const taggedUserId of newlyTaggedUsers) {
        await createNotification({
          recipientId: taggedUserId,
          senderId: user,
          type: "TAG",
          message: `${user.fullName} tagged you in a collage.`,
        });
      } */
