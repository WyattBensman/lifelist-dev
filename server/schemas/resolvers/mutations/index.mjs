import * as userActionsMutations from "./userActions/index.mjs";
import * as userAuthenticationMutations from "./userAuthentication/index.mjs";
import * as userRelationsMutations from "./userRelations/index.mjs";
import * as cameraMutations from "./camera/index.mjs";
import * as collageActionsMutations from "./collageActions/index.mjs";
import * as collageCreationMutations from "./collageCreation/index.mjs";
import * as lifeListMutations from "./lifelist/index.mjs";
import * as messagingMutations from "./messaging/index.mjs";
import * as notificationsMutations from "./notifications/index.mjs";
import * as privacyGroupsMutations from "./privacyGroups/index.mjs";
import * as earlyAccessMutations from "./earlyAccess/index.mjs";
import * as momentMutations from "./moments/index.mjs";
import * as onboardingMutations from "./onboarding/completeOnboarding.mjs";

const mutations = {
  ...userActionsMutations,
  ...userAuthenticationMutations,
  ...userRelationsMutations,
  ...cameraMutations,
  ...collageActionsMutations,
  ...collageCreationMutations,
  ...lifeListMutations,
  ...messagingMutations,
  ...notificationsMutations,
  ...privacyGroupsMutations,
  ...earlyAccessMutations,
  ...momentMutations,
  ...onboardingMutations,
};

export default mutations;
