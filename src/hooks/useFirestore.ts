import { initializeApp } from "firebase/app";
import {
  IFirebaseUser,
  IFirebaseResponse,
} from "../interfaces/IAuthentication";
import {
  getFirestore,
  query,
  orderBy,
  onSnapshot,
  collection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  where,
  QuerySnapshot,
  DocumentData,
  DocumentSnapshot,
} from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { IReceipt } from "../interfaces/IReceipt";
import { useAuth } from "./useAuth";
import {
  EmailAuthProvider,
  User,
  UserCredential,
  UserInfo,
  reauthenticateWithCredential,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import { FirebaseFirestore } from "firebase/firestore";


export const useFirestore = () => {
  const userRef = (uid: string) => doc(db, "users", uid);

  const createReceipt = async (receipt: IReceipt) => {
    const receiptsColRef = collection(db, "receipts");

    const receiptRef = await addDoc(receiptsColRef, {
      created: serverTimestamp(),
      host: auth.currentUser?.uid,
      guests: [],
      ...receipt,
    });

    // create 8 character from receipt id
    const joinCode = receiptRef.id.substring(0, 8).toUpperCase();

    // add join code to receipt
    await updateDoc(receiptRef, {
      joinCode: joinCode,
    });

    // add receipt to user's hostReceipts
    await updateDoc(userRef(auth.currentUser?.uid!), {
      hostReceipts: arrayUnion(receiptRef.id),
    });
    return receiptRef.id;
  };

  const getUserReceipts = async (): Promise<{hostReceipts: IReceipt[], requestedReceipts: IReceipt[]}> => {
    try {
      console.log("firebase user", auth.currentUser)
      const receiptsColRef = collection(db, 'receipts');

      const userDoc = await getDoc(userRef(auth.currentUser?.uid!));
      if (!userDoc.exists()) {
        throw new Error('User document does not exist');
      }
  
      const hostReceiptsIds = userDoc.data()?.hostReceipts || [];
      const requestedReceiptsIds = userDoc.data()?.requestedReceipts || [];
  
      const hostReceipts: IReceipt[] = [];
      const requestedReceipts: IReceipt[] = [];

      for (const receiptId of hostReceiptsIds) {
        const receiptDocRef = doc(receiptsColRef, receiptId);

        const receiptDocSnapshot = await getDoc(receiptDocRef);
        
        if (receiptDocSnapshot.exists()) {
          let receiptData = receiptDocSnapshot.data() as IReceipt;
          receiptData.firebaseId = receiptId;
          hostReceipts.push(receiptData);
        }
      }

      for (const receiptId of requestedReceiptsIds) {
        const receiptDocRef = doc(receiptsColRef, receiptId);
        const receiptDocSnapshot = await getDoc(receiptDocRef);
        if (receiptDocSnapshot.exists() && receiptDocSnapshot.data()?.host !== auth.currentUser?.uid){
          let receiptData = receiptDocSnapshot.data() as IReceipt;
          receiptData.firebaseId = receiptId;
          requestedReceipts.push(receiptData);
        }
      }
  
      return { hostReceipts, requestedReceipts };
    } catch (error) {

      console.error('Error fetching receipts:', error);

      throw error;
    }
  };

  
  const getReceiptById = async (receiptId: string): Promise<IReceipt> => {
    try {
      const receiptsColRef = collection(db, "receipts");
      const receiptDocRef = doc(receiptsColRef, receiptId);
      const receiptDocSnapshot: DocumentSnapshot<DocumentData> = await getDoc(
        receiptDocRef
      );

      if (receiptDocSnapshot.exists()) {
        const receiptData = receiptDocSnapshot.data() as IReceipt;

        // set receipt item ids to be the same as the receipt item index
        receiptData.items = receiptData?.items?.map((item, index) => {
          return {
            ...item,
            id: index,
          };
        });

        return receiptData;
      } else {
        throw new Error("Receipt not found");
      }
    } catch (error) {
      console.error("Error fetching receipt:", error);
      throw error;
    }
  };

  const joinReceipt = async (joinCode: string) => {
    try {
      const receiptsColRef = collection(db, "receipts");

      // get receipt by join code
      const receipts = await getDocs(
        query(receiptsColRef, where("joinCode", "==", joinCode))
      );

      // add receipt to user's requestedReceipts
      await updateDoc(userRef(auth.currentUser?.uid!), {
        requestedReceipts: arrayUnion(receipts.docs[0].id)
      })

      // add user to receipt's guests
      await updateDoc(doc(receiptsColRef, receipts.docs[0].id), {
        guests: arrayUnion(auth.currentUser?.uid),
      });

      return receipts.docs[0].id;
    } catch (error) {
      console.error("Error joining receipt:", error);
      throw error;
    }
  };

  const addNewUserToReceipt = async (
    receiptId: string,
    name: string,
    phoneNumber: string
  ) => {
    try {
      // create new user and add receipt to the user
      const usersColRef = collection(db, "users");
      const userRef = await addDoc(usersColRef, {
        name: name,
        email: "",
        created: serverTimestamp(),
        hostReceipts: [],
        requestedReceipts: [receiptId],
        hasAccount: false,
        phoneNumber: phoneNumber,
      });

      // add user to the receipt
      const receiptsColRef = collection(db, "receipts");
      const receiptDocRef = doc(receiptsColRef, receiptId);
      await updateDoc(receiptDocRef, {
        guests: arrayUnion(userRef.id),
      });
    } catch (error) {
      console.error("Error creating and adding new user to receipt:", error);
      throw error;
    }
  };
  const RemoveItem = async (receiptId: string, itemName: string, itemPrice: number) => {
    try {
        const receiptRef = doc(db, 'receipts', receiptId);
        const receiptSnapshot = await getDoc(receiptRef);

        if (receiptSnapshot.exists()) {
          console.log('Receipt found');
            const receiptData = receiptSnapshot.data() as IReceipt;

            const updatedItems = receiptData.items?.filter(item => item.name !== itemName) || [];
            const newSubTotal = ((receiptData.subtotal || 0) - itemPrice).toFixed(2);
            const newTax = (receiptData.tax || 0) - parseFloat((itemPrice * 0.07).toFixed(2));
            const newTotal = (receiptData.total || 0) - parseFloat((itemPrice * 1.07).toFixed(2));
            console.log(newSubTotal, newTax, newTotal);
            await updateDoc(receiptRef, {
                items: updatedItems,
                subtotal: newSubTotal,
                tax: newTax,
                total: newTotal,
            });
            console.log('Item removed successfully');
        } else {
            console.error('Receipt not found');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        throw error;
    }
};

  const addNewItemToReceipt = async (receiptId: string, itemName: string, itemPrice: number, itemId: number ) => {
    try {
        const receiptRef = doc(db, 'receipts', receiptId);
        const receiptSnapshot = await getDoc(receiptRef);
        if (receiptSnapshot.exists()) {
          console.log('Receipt found');
          const receiptData = receiptSnapshot.data() as IReceipt;
          const newItem = {
              id: itemId, 
              name: itemName,
              price: itemPrice,
              paid: false, 
              purchasers: [],
          };
          const newSubTotal = ((receiptData.subtotal || 0) + itemPrice).toFixed(2);
          const newTax = ((receiptData.tax || 0) +  (itemPrice * 0.07)).toFixed(2);
          const newTotal = ((receiptData.total || 0) + (itemPrice * 1.07)).toFixed(2);
          console.log(newSubTotal, newTax, newTotal);
          await updateDoc(receiptRef, {
              items: arrayUnion(newItem),
              subtotal: newSubTotal,
              tax: newTax,
              total: newTotal,
          });
        } else {
          console.error('Receipt not found');
        }
        console.log("Item added successfully to receipt.");
    } catch (error) {
        console.error("Error adding new item to receipt:", error);
        throw error;
    }
};

  const updateItemsPaidStatus = async (receiptId: string, itemIds: number[], isPaid: boolean) => {
    const userUid = auth.currentUser?.uid;

    try {
        const receiptRef = doc(db, 'receipts', receiptId);
        const receiptSnapshot = await getDoc(receiptRef);

        if (receiptSnapshot.exists()) {
          const receiptData = receiptSnapshot.data() as IReceipt;

          // add user to purchasers array if not already in it 
          const updatedItems = receiptData.items?.map(item => {
            if (itemIds.includes(item.id as number)) {
              if (item.purchasers && !item.purchasers.includes(userUid)) {
                const updatedPurchasers = [...item.purchasers, userUid];
                return { ...item, purchasers: updatedPurchasers, paid: isPaid};
              }
            }
            return item;
          }) || [];

          await updateDoc(receiptRef, {
            items: updatedItems,
          });
        } else {
          console.error('Receipt not found');
        }
    } catch (error) {
        console.error('Error updating items paid status:', error);
        throw error;
    }
};

  const addExistingUserToReceipt = async (receiptId: string, uid: string) => {
    try {
      // add user to receipt
      const receiptsColRef = collection(db, "receipts");
      const receiptDocRef = doc(receiptsColRef, receiptId);
      await updateDoc(receiptDocRef, {
        guests: arrayUnion(uid),
      });

      // add the receipt to the user
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {

        requestedReceipts: arrayUnion(receiptId)
      })
    } catch (error) {
      console.error("Error adding existing user to receipt:", error);
      throw error;
    }
  };

  // Function to get user data from firestore
  const getFirestoreUser = async (
    uid: string
  ): Promise<IFirebaseUser | null> => {
    try {
      const userDoc = await getDoc(userRef(uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as IFirebaseUser;

        return {
          email: userData.email,
          displayName: userDoc.data()?.name,
          phoneNumber: userData.phoneNumber,
          photoURL: userData.photoURL,
          firebaseUID: userDoc.id,
          providerId: "",
          uid: userData.uid,
          cashAppName: userData.cashAppName || "",
          venmoName: userData.venmoName || "",
          paypalEmail: userData.paypalEmail || "",
        };
      } else {
        console.log("Firestore User Document does not exist");
        return null;
      }
    } catch (error) {
      console.error("Error fetching Firestore User Data:", error);
      throw(error);
    }
  };

  //TODO: Add function to reauthenticate, similar to the password shit
  const reauthenticateUser = async (password: string) => {
    const user = auth.currentUser
    try {
      if (user) {
        const credential = EmailAuthProvider.credential(user.email ?? "", password)
        await reauthenticateWithCredential(user, credential).then(() => {
          console.log("Reauthenticated user successfully")
        })
      }
    } catch (error) {
      console.log("Error reauthenticating the user..", error)
      throw (error)
    }
  }

  // Function to update the display name in both auth and firestore.
  const updateDisplayName = async (displayName: string) => {
    const user = auth.currentUser;
    try {
      if (user) {
        await updateProfile(user, {
          displayName: displayName,
        }).then(() => {
          console.log("Display name updated in Auth successfully");
        });
        await updateDoc(userRef(auth.currentUser?.uid!), {
          name: displayName,
        }).then(() => {
          console.log("Display name updated in Firestore successfully");
        });
      }
    } catch (error) {
      console.error("Error updating display name:", error);
      throw error;
    }
  };

  // Function to update email address in both auth and firestore
  const updateEmailAddress = async (email: string) => {
    const user = auth.currentUser;
    try {
      if (user) {
        await updateEmail(user, email).then(() => {
          console.log("Email updated in Auth successfully");
        });
        await updateDoc(userRef(auth.currentUser?.uid!), {
          email: email,
        }).then(() => {
          console.log("Email updated in Firestore successfully");
        });
      }
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  };

  // Function to update the account phone number in firestore
  const updatePhoneNumber = async (newPhoneNumber: string) => {
    const user = auth.currentUser;
    try {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          phoneNumber: newPhoneNumber,
        }).then(() => {
          console.log("Phone Number updated successfully");
        });
      }
    } catch (error) {
      console.error("Error updating phone number:", error);
      throw error;
    }
  };

  // Function to update venmo account name in firestore
  const updateVenmoName = async (venmoName: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          venmoName: venmoName,
        });
        console.log("Venmo name updated successfully");
      }
    } catch (error) {
      console.error("Error updating venmo name:", error);
      throw error;
    }
  };

  // Function to update venmo account name in firestore
  const updateCashAppName = async (cashAppName: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          cashAppName: cashAppName,
        });
        console.log("Cash App name updated successfully");
      }
    } catch (error) {
      console.error("Error updating cash app name:", error);
      throw error;
    }
  };

  const updatePaypalEmail = async (paypalEmail: string) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          paypalEmail: paypalEmail,
        });
        console.log("Paypal email updated successfully");
      }
    } catch (error) {
      console.error("Error updating paypal email:", error);
      throw error;
    }
  }



  return {
    createReceipt,
    addNewUserToReceipt,
    addExistingUserToReceipt,
    joinReceipt, 
    getReceiptById,
    updateItemsPaidStatus,
    getUserReceipts,
    getFirestoreUser,
    reauthenticateUser,
    updateDisplayName,
    updateEmailAddress,
    updatePhoneNumber,
    updateVenmoName,
    updateCashAppName,
    updatePaypalEmail,
    RemoveItem,
    addNewItemToReceipt
  };
};
