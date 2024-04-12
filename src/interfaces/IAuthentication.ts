import { User, UserCredential, UserInfo } from "firebase/auth";

export interface IFirebaseResponse {
  result: UserCredential | null;
  error: {
    code: string;
    message: string;
  };
}

// extend the firebase user object
export interface IFirebaseUser extends UserInfo {
  firebaseUID: string | null;
  paymentMethods: {
    Venmo: string | null;
    CashApp: string | null;
    PayPal: string | null;
  };
}

// Omit properties we don't use
// export type IFirebaseUserProfile = Omit<
//   IFirebaseUser,
//   | "metadata"
//   | "delete"
//   | "getIdToken"
//   | "getIdTokenResult"
//   | "reload"
//   | "toJSON"
//   | "emailVerified"
//   | "isAnonymous"
//   | "providerData"
//   | "refreshToken"
//   | "tenantId"
// >;
export interface IAuthState {
  firebaseUID?: string | null;
  userName: string | null;
  userToken: string | null;
  userEmail: string | null;
  sessionTimedOut: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;
  darkMode: boolean;
}
