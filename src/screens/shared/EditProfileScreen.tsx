import React, { useEffect, useState } from "react";
import { View, ScrollView, Alert, StyleSheet } from "react-native";
import { Text, Button, Input, Icon } from "@ui-kitten/components";
import { IFirebaseUser } from "../../interfaces/IAuthentication";
import { useFirestore } from "../../hooks/useFirestore";
import { useValidation } from "../../hooks/useValidation";
import { selectAuthState, userProfileUpdated } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hook";
import ReauthenticateModal from "../../components/ReauthenticationModal";

const EditProfileScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { profile } = route.params;
  const { updateDisplayName, updateEmailAddress, updatePhoneNumber } =
    useFirestore();
  const { validateName, validateEmail, validatePhoneNumber } = useValidation();
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuthState);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || "");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [reauthModalVisible, setReauthModalVisible] = useState(false);

  const handleSave = async (profile: IFirebaseUser) => {
    let updatedUserInfo = {
      userName: profile.displayName,
      userEmail: profile.email,
      phoneNumber: profile.phoneNumber,
      sessionTimedOut: false,
      isLoading: false,
      firebaseUID: profile.firebaseUID,
      isLoggedIn: true,
      darkMode: false,
      userToken: authState.userToken,
    };
    setReauthModalVisible(false);

    // Update Display Name
    if (
      displayName != profile.displayName &&
      displayName != "" &&
      displayName != null
    ) {
      if (validateName(displayName)) {
        console.log("Updating Display Name");

        try {
          await updateDisplayName(displayName);
          updatedUserInfo.userName = displayName;
          setNameError("");
        } catch (error) {
          console.error("Error updating display name:", error);
          setNameError("Error updating display name.. Please try again");
          return;
        }
      } else {
        setNameError("Invalid Display Name");
        return;
      }
    }

    // Update Email
    if (email != profile.email && email != "" && email != null) {
        
      if (validateEmail(email)) {
        console.log("Updating Email Address");

        try {
          await updateEmailAddress(email);
          updatedUserInfo.userEmail = email;
          setEmailError("");
        } catch (error) {
          console.error("Error updating email:", error);
          if (error == "auth/requires-recent-login") {
            setEmailError("Please reauthenticate to update email");
            setReauthModalVisible(true);
            return;
          }
          return;
        }
      } else {
        setEmailError("Invalid Email Address");
        return;
      }
    }

    // Update phone number
    if (
      phoneNumber != profile.phoneNumber &&
      phoneNumber != "" &&
      phoneNumber != null
    ) {
      if (validatePhoneNumber(phoneNumber)) {
        console.log("Updating Phone Number");

        try {
          await updatePhoneNumber(phoneNumber);
          updatedUserInfo.phoneNumber = phoneNumber;
          setPhoneError("");
        } catch (error) {
          console.error("Error updating phone number:", error);
          setPhoneError("Error updating phone number.. Please try again");
          return;
        }
      } else {
        setPhoneError("Invalid Phone Number");
        return;
      }
    }
    // Update state, show success message
    dispatch(userProfileUpdated(updatedUserInfo));
    Alert.alert("Success", "Profile updated successfully.", [
      {
        text: "OK",
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
          </View>
          <View style={styles.rowWrapper}>
            <View style={styles.row}>
              <View style={styles.rowValueContainer}>
                <Input
                  label={"Display Name"}
                  style={styles.rowValue}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder={profile?.displayName || "Enter Display Name"}
                />
              </View>
            </View>
            <View>
              <Text style={styles.errorText}>{nameError}</Text>
            </View>
          </View>
          <View style={styles.rowWrapper}>
            <View style={styles.row}>
              <View style={styles.rowValueContainer}>
                <Input
                  label={"Email Address"}
                  style={styles.rowValue}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={profile?.email || "Enter Email Address"}
                />
              </View>
            </View>
            <View>
              <Text style={styles.errorText}>{emailError}</Text>
            </View>
          </View>
          <View style={styles.rowWrapper}>
            <View style={styles.row}>
              <View style={styles.rowValueContainer}>
                <Input
                  label={"Phone Number"}
                  style={styles.rowValue}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder={profile?.phoneNumber || "Enter Phone Number"}
                />
              </View>
            </View>
            <View>
              <Text style={styles.errorText}>{phoneError}</Text>
            </View>
          </View>

          <View>
            <Button
              style={{ margin: 24 , marginTop: 5}}
              onPress={() => handleSave(profile)}
              accessoryLeft={(props) => ( <Icon {...props} name="save-outline" />)}
            >
              Save
            </Button>
            <ReauthenticateModal
              isVisible={reauthModalVisible}
              closeModal={() => setReauthModalVisible(false)}
              onSuccess={() => {
                setReauthModalVisible(false);
              }} />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  header: {
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1d1d1d",
    marginBottom: 6,
  },
  row: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 50,
  },
  rowWrapper: {
    borderTopWidth: 1,
    borderColor: "#e3e3e3",
    paddingBottom: 12,
    paddingTop: 12,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "500",
    paddingBottom: 10,
    paddingLeft: 24,
    paddingRight: 24,
    color: "#000",
  },
  rowValue: {
    fontSize: 17,
    fontWeight: "500",
    borderColor: "#cccccc",
    flex: 1,
    height: 50,
    marginVertical: 2,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
    color: "red",
    marginLeft: 24,
    marginRight: 24,
  },

  rowValueContainer: {
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingRight: 24,
    paddingLeft: 24,
  },
});
