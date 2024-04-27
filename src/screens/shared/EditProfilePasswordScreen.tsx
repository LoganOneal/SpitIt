import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View, ScrollView, Alert, StyleSheet } from "react-native";
import * as AppConstants from "../../constants/constants";
import { Text, Button, Input, Icon } from "@ui-kitten/components";
import PasswordRequirements from "../../components/PasswordRequirements";
import { useValidation } from "../../hooks/useValidation";
import { updatePassword } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useFirestore } from "../../hooks/useFirestore";

type EditProfilePasswordData = {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
};

const EditProfilePasswordScreen = ({ navigation }: { navigation: any }) => {
  const { control, watch } = useForm<EditProfilePasswordData>();
  const { reauthenticateUser } = useFirestore();
  const { validatePassword } = useValidation();
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleNewPasswordChange = (text: string) => {
    const isValid = validatePassword(text);
    setNewPassword(text);
    setIsPasswordValid(isValid);
    setPasswordsMatch(text === confirmNewPassword);
  };

  const handleConfirmNewPasswordChange = (text: string) => {
    setConfirmNewPassword(text);
    setPasswordsMatch(text === newPassword);
  };

  const handleSave = async () => {
    console.log("Current Password: ", password);
    console.log("New password: ", newPassword);
    const user = auth.currentUser;
    try {
      if (user) {
        await reauthenticateUser(password);
        await updatePassword(user, newPassword).then(() => {
          console.log("Password updated successfully");
        });
        setPasswordError("");
        Alert.alert("Success", "Password updated successfully.", [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error: any) {
      setPasswordError(error.message);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
        </View>
        <View style={styles.rowWrapper}>
          <View style={styles.row}>
            <View style={styles.rowValueContainer}>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <Input
                      label={AppConstants.LABEL_Password}
                      placeholder="Enter Current Password"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        onChange(text);
                        handlePasswordChange(text);
                      }}
                      value={value}
                      secureTextEntry
                      textContentType="password"
                      style={styles.rowValue}
                    />
                  </>
                )}
                name="password"
              />
            </View>
          </View>
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}
        </View>
        <View style={styles.rowWrapper}>
          <View style={styles.row}>
            <View style={styles.rowValueContainer}>
              <Controller
                control={control}
                rules={{
                  maxLength: 16,
                  required: true,
                  validate: (val) => {
                    const isValid = validatePassword(val);
                    setIsPasswordValid(isValid);
                    return isValid || AppConstants.ERROR_InvalidPassword;
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.rowValueNewPassContainer}>
                    <Input
                      label={AppConstants.LABEL_NewPassword}
                      placeholder="New Password"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        onChange(text);
                        handleNewPasswordChange(text);
                      }}
                      value={value}
                      secureTextEntry
                      textContentType="password"
                      style={styles.rowValue}
                    />
                    {watch("newPassword") &&
                      watch("newPassword").length > 0 && (
                        <View style={styles.iconContainer}>
                          <Icon
                            name={
                              isPasswordValid
                                ? "checkmark-circle-2-outline"
                                : "close-circle-outline"
                            }
                            fill={isPasswordValid ? "green" : "red"}
                            style={styles.icon}
                          />
                        </View>
                      )}
                  </View>
                )}
                name="newPassword"
              />
            </View>
          </View>
        </View>
        {!isPasswordValid && (
          <View style={styles.passwordRequirements}>
            <PasswordRequirements
              password={newPassword}
              show={isPasswordValid}
            />
          </View>
        )}
        <View style={styles.rowWrapper}>
          <View style={styles.row}>
            <View style={styles.rowValueContainer}>
              <Controller
                control={control}
                rules={{
                  maxLength: 16,
                  required: true,
                  validate: (val) => {
                    if (watch("newPassword") !== val) {
                      return AppConstants.ERROR_ConfirmPassword;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.rowValueNewPassContainer}>
                    <Input
                      label={AppConstants.LABEL_ConfirmPassword}
                      placeholder={AppConstants.PLACEHOLDER_ConfirmPassword}
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        onChange(text);
                        handleConfirmNewPasswordChange(text);
                      }}
                      value={value}
                      secureTextEntry
                      textContentType="password"
                      style={styles.rowValue}
                    />
                    {watch("confirmNewPassword") &&
                      watch("confirmNewPassword").length > 0 && (
                        <View style={styles.iconContainer}>
                          <Icon
                            name={
                              passwordsMatch
                                ? "checkmark-circle-2-outline"
                                : "close-circle-outline"
                            }
                            fill={passwordsMatch ? "green" : "red"}
                            style={styles.icon}
                          />
                        </View>
                      )}
                  </View>
                )}
                name="confirmNewPassword"
              />
            </View>
          </View>
        </View>
        <Button
          style={{ margin: 24 }}
          onPress={handleSave}
          disabled={!passwordsMatch}
          accessoryLeft={(props) => <Icon {...props} name="save-outline" />}
        >
          Save
        </Button>
      </View>
    </ScrollView>
  );
};

export default EditProfilePasswordScreen;

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
    paddingBottom: 24,
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
  rowValueNewPassContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  passwordRequirements: {
    marginLeft: 24,
    marginRight: 24,
    paddingBottom: 12,
  },
  iconContainer: {
    position: "absolute",
    right: 8,
  },
  icon: {
    width: 24,
    height: 24,
    top: 12,
  },
});
