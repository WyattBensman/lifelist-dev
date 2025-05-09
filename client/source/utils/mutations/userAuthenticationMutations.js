import { gql } from "@apollo/client";

// === Mutation: Create a Profile === //

export const CREATE_PROFILE = gql`
  mutation CreateProfile($input: CreateProfileInput!) {
    createProfile(input: $input) {
      token
      user {
        _id
        fullName
        username
        email
        phoneNumber
        profilePicture
        birthday
        gender
        accessCode
      }
    }
  }
`;

// === Mutation: Validate Phone Number === //

export const VALIDATE_PHONE_NUMBER = gql`
  mutation ValidatePhoneNumber($phoneNumber: String!) {
    validatePhoneNumber(phoneNumber: $phoneNumber) {
      success
      message
    }
  }
`;

// === Mutation: Validate Username and Password === //

export const VALIDATE_USERNAME_AND_PASSWORD = gql`
  mutation ValidateUsernameAndPassword($username: String!, $password: String!) {
    validateUsernameAndPassword(username: $username, password: $password) {
      success
      message
    }
  }
`;

// === Mutation: Login === //

export const LOGIN = gql`
  mutation Login($usernameOrEmailOrPhone: String!, $password: String!) {
    login(
      usernameOrEmailOrPhone: $usernameOrEmailOrPhone
      password: $password
    ) {
      token
      user {
        _id
        username
        email
        phoneNumber
      }
    }
  }
`;

// === Mutation: Invite a Friend === //

export const INVITE_FRIEND = gql`
  mutation InviteFriend($name: String!, $phoneNumber: String!) {
    inviteFriend(name: $name, phoneNumber: $phoneNumber) {
      success
      message
    }
  }
`;

// === Mutation: Update Invite Status === //

export const UPDATE_INVITE_STATUS = gql`
  mutation UpdateInviteStatus($inviteCode: String!) {
    updateInviteStatus(inviteCode: $inviteCode) {
      success
      message
    }
  }
`;

// === Mutation: Send the Phone Verification Code === //

export const SEND_PHONE_VERIFICATION_CODE = gql`
  mutation SendPhoneVerificationCode($phoneNumber: String!) {
    sendPhoneVerificationCode(phoneNumber: $phoneNumber) {
      success
      sessionInfo
    }
  }
`;

// === Mutation: Verify Phone Code === //

export const VERIFY_PHONE_CODE = gql`
  mutation VerifyPhoneCode($sessionInfo: String!, $code: String!) {
    verifyPhoneCode(sessionInfo: $sessionInfo, code: $code) {
      success
      token
    }
  }
`;
