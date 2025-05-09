import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { decode as atob } from "base-64";

global.atob = atob;

class AuthService {
  // Store the token upon login
  async saveToken(token) {
    await SecureStore.setItemAsync("authToken", token);
  }

  // Retrieve the token from storage
  async getToken() {
    const token = await SecureStore.getItemAsync("authToken");
    return token;
  }

  // Remove the token and handle logout
  async logout() {
    console.log("Logging out, clearing token...");
    await SecureStore.deleteItemAsync("authToken");
  }

  // Check if the user is logged in by checking the token existence and its expiration
  async loggedIn() {
    const token = await this.getToken();
    if (!token) return false;
    return !(await this.isTokenExpired(token));
  }

  // Decode the token to get user data
  async getUser() {
    const token = await this.getToken();
    const decoded = token ? jwtDecode(token) : null;
    return decoded ? decoded.id : null;
  }

  // Check if the token is expired
  async isTokenExpired(token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      console.error("Failed to decode token", error);
      return true;
    }
  }

  async saveRegistrationProgress(progress) {
    await SecureStore.setItemAsync("registrationProgress", progress);
  }

  async getRegistrationProgress() {
    return await SecureStore.getItemAsync("registrationProgress");
  }

  async setRegistrationComplete() {
    try {
      await SecureStore.setItemAsync("registrationProgress", "Complete");
    } catch (error) {
      console.error("Error setting registration as complete", error);
    }
  }

  async isRegistrationComplete() {
    try {
      const progress = await this.getRegistrationProgress();
      return progress === "Complete";
    } catch (error) {
      console.error("Error checking registration completion", error);
      return false;
    }
  }
}

export default new AuthService();

/* // Send phone verification code via AWS Cognito
  async sendVerificationCode(phoneNumber) {
    try {
      const result = await Auth.signUp({
        username: phoneNumber,
        password: "TemporaryPassword123!", // Cognito requires a password
        attributes: {
          phone_number: phoneNumber,
        },
      });
      console.log("Verification code sent:", result);
      return result;
    } catch (error) {
      console.error("Error sending verification code:", error);
      throw new Error(error.message);
    }
  }

  // Confirm the phone verification code via AWS Cognito
  async confirmVerificationCode(phoneNumber, code) {
    try {
      await Auth.confirmSignUp(phoneNumber, code);
      console.log("Phone number verified successfully!");
    } catch (error) {
      console.error("Error confirming verification code:", error);
      throw new Error(error.message);
    }
  } */
