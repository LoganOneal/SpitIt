/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  updateEmail,
} from "firebase/auth";
import {
  IFirebaseUser,
  IFirebaseResponse,
} from "../interfaces/IAuthentication";
import { auth } from "../services/firebase";
import { useFirestore } from "./useFirestore";
import {
  getFirestore,
  query,
  orderBy,
  onSnapshot,
  collection,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../services/firebase";

export const useAuth = () => {
  const initResponse = () => {
    const fbResponse: IFirebaseResponse = {
      result: null,
      error: {
        code: "",
        message: "",
      },
    };
    return fbResponse;
  };

  // Sign out user
  const signoutUser = async () => {
    console.log("BEGIN SignOut");
    const fbResponse = initResponse();
    await signOut(auth).catch((error) => {
      fbResponse.error.code = error.errorCode;
      fbResponse.error.message = error.errorMessage;
      console.log("SignOut ERROR");
    });
    console.log("END SignOut");
  };

  // Register user
  const signupUser = async (
    userFullName: string,
    userEmail: string,
    userPassword: string
  ) => {
    console.log("BEGIN SignUp");
    const fbResponse = initResponse();
    await createUserWithEmailAndPassword(auth, userEmail, userPassword)
      .then((userCredential) => {
        fbResponse.result = userCredential;

        // create user in firestore
        const userRef = doc(db, "users", userCredential.user.uid);
        const userDoc = getDoc(userRef);
        setDoc(userRef, {
          name: userFullName,
          email: userEmail,
          created: serverTimestamp(),
          hostReceipts: [],
          memberReceipts: [],
          hasAccount: true,
          phoneNumber: ""
        })

        // Update profile
        if (auth.currentUser) {
          updateProfile(auth.currentUser, {
            displayName: userFullName,
          });
        }
        console.log("SignUp success");
      })
      .catch((error) => {
        console.log(error);
        fbResponse.error.code = error.code;
        fbResponse.error.message = error.message;
        console.log("SignUp ERROR");
      });

    const formattedResponse = JSON.stringify(fbResponse);
    console.log("END SignUp");
    return formattedResponse;
  };

  // Login user
  const signinUser = async (userEmailAddress: string, userPassword: string) => {
    console.log("BEGIN SignIn");
    const fbResponse = initResponse();
    await signInWithEmailAndPassword(auth, userEmailAddress, userPassword)
      .then((userCredential) => {
        fbResponse.result = userCredential;
        console.log("SignIn success");
      })
      .catch((error) => {
        fbResponse.error.code = error.code;
        fbResponse.error.message = error.message;
        console.log("SignIn ERROR");
      });
    const formattedResponse = JSON.stringify(fbResponse);
    console.log("END SignIn");
    return formattedResponse;
  };

  // Send password reset email
  const sendUserResetPasswordEmail = async (email: string) => {
    console.log("BEGIN SendUserResetPasswordEmail");
    const fbResponse = initResponse();
    await sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log("Reset Password Email Sent SUCCESS");
      })
      .catch((error) => {
        fbResponse.error.code = error.code;
        fbResponse.error.message = error.message;
        console.log("Reset Password Email Sent ERROR");
      });
    const formattedResponse = JSON.stringify(fbResponse);
    console.log("END SendUserResetPasswordEmail");
    return formattedResponse;
  };

  // Verify password reset oobCode from email link
  const verifyResetPasswordCode = async (code: string) => {
    console.log("BEGIN VerifyResetPasswordCode");
    const fbResponse = initResponse();
    await verifyPasswordResetCode(auth, code).then((email) => {
      console.log("Verify Password Reset Code SUCCESS  ", email);
    })
    .catch((error: any) => {
      fbResponse.error.code = error.code;
      fbResponse.error.message = error.message;
      console.log("Verify Password Reset Code Sent ERROR");
    });
    const formattedResponse = JSON.stringify(fbResponse);
    console.log("END VerifyResetPasswordCode");
    return formattedResponse;
  }

  // Confirm password reset
  const confirmUserResetPassword = async (code: string, newPassword: string) => {
    console.log("BEGIN ConfirmUserResetPassword");
    const fbResponse = initResponse();
    await confirmPasswordReset(auth, code, newPassword).then(() => {
      console.log("Confirm Password Reset SUCCESS");
    })
    .catch((error) => {
      fbResponse.error.code = error.code;
      fbResponse.error.message = error.message;
      console.log("Confirm Password Reset ERROR");
    });
    const formattedResponse = JSON.stringify(fbResponse);
    console.log("END ConfirmUserResetPassword");
    return formattedResponse;
  };


  // Get firebase user details
  const getProfile = (): IFirebaseUser | void => {
    const user = auth.currentUser;
    user?.providerData.forEach((profile) => {
      const fbProfile: IFirebaseUser = {
        ...profile, firebaseUID: user.uid,
        cashAppName: null,
        venmoName: null,
        paypalEmail: null,
      };
      console.log("getProfile SUCCESS");
      return fbProfile;
    });
  };

  return {
    signupUser,
    signinUser,
    signoutUser,
    sendUserResetPasswordEmail,
    verifyResetPasswordCode,
    confirmUserResetPassword,
    getProfile,
  };
};
