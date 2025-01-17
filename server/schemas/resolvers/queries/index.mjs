import * as userQueries from "./user/userQueries.mjs";
import * as experienceQueries from "./experience/experienceQueries.mjs";
import * as collageMutations from "./collage/collageQueries.mjs";
import * as cameraQueries from "./camera/cameraQueries.mjs";
import * as lifeListQueries from "./lifelist/lifeListQueries.mjs";
import * as privacyGroupQueries from "./privacyGroup/privacyGroupQueries.mjs";
import * as inboxQueries from "./inbox/inboxQueries.mjs";
import * as mainFeedQueries from "./mainFeed/mainFeedQueries.mjs";
import { getPresignedUrl } from "./fileUploads/getPresignedUrl.mjs";
import * as exploreQueries from "./explore/exploreQueries.mjs";
import * as momentQueries from "./moment/momentQueries.mjs";
import * as onboardingQueries from "./onboarding/onboardingQueries.mjs";

const queries = {
  ...userQueries,
  ...experienceQueries,
  ...collageMutations,
  ...cameraQueries,
  ...lifeListQueries,
  ...privacyGroupQueries,
  ...inboxQueries,
  ...mainFeedQueries,
  getPresignedUrl,
  ...exploreQueries,
  ...momentQueries,
  ...onboardingQueries,
};

export default queries;
