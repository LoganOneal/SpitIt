import React, { useState } from "react";
import { useTheme, Snackbar, ActivityIndicator } from "react-native-paper";
import { Card, Button, Input, Text, Icon } from "@ui-kitten/components";
import {
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as Animatable from "react-native-animatable";
import { useAppDispatch } from "../store/hook";
import * as AppConstants from "../constants/constants";
import { ImageOverlay } from "../components/image-overlay";
import { useAuth } from "../hooks/useAuth";
import { IAuthState } from "../interfaces/IAuthentication";
import { userRegistered } from "../store/authSlice";
import { useValidation } from "../hooks/useValidation";
import PasswordRequirements from "../components/PasswordRequirements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type SignUpFormData = {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpScreen({ navigation }) {
  const theme = useTheme();
  const [showSnack, setShowSnack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [emailRegistered, setEmailRegistered] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const dispatch = useAppDispatch();
  const { signupUser, getProfile } = useAuth();
  const { validateEmail, validatePassword } = useValidation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>();

  const onSubmit = (data: SignUpFormData) => {
    navigation.navigate("PaymentRegistration", { data: data });
  };

  const onDismissSnackBar = () => setShowSnack(false);
  const handlePasswordChange = (text: string) => {
    const isValid = validatePassword(text);
    setPassword(text);
    setIsPasswordValid(isValid);
  };

  const dynamicContainerHeightMultiplier = isPasswordValid ? 0.7 : 0.85;
  const dynamicContainerHeight = height * dynamicContainerHeightMultiplier;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <Animatable.View
          style={[styles.contentContainer, { height: dynamicContainerHeight }]}
          animation="fadeInUpBig"
        >
          <Card style={styles.card}>
            <Text category="h3" style={styles.title}>
              {AppConstants.TITLE_Register}
            </Text>
            <Controller
              control={control}
              rules={{
                required: {
                  message: AppConstants.ERROR_FirstNameIsRequired,
                  value: true,
                },
                pattern: {
                  value: /^[A-Za-z]+$/i,
                  message: AppConstants.ERROR_InvalidName,
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={AppConstants.PLACEHOLDER_FirstName}
                  textContentType="name"
                  style={styles.textInput}
                />
              )}
              name="firstName"
            />
            {errors.firstName?.message && (
              <Text style={{ color: theme.colors.error }}>
                {errors.firstName?.message}
              </Text>
            )}

            <Controller
              control={control}
              rules={{
                required: {
                  message: AppConstants.ERROR_LastNameIsRequired,
                  value: true,
                },
                pattern: {
                  value: /^[A-Za-z]+$/i,
                  message: AppConstants.ERROR_InvalidName,
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder={AppConstants.PLACEHOLDER_LastName}
                  textContentType="name"
                  style={styles.textInput}
                />
              )}
              name="lastName"
            />
            {errors.lastName?.message && (
              <Text style={{ color: theme.colors.error }}>
                {errors.lastName?.message}
              </Text>
            )}
            <View>
              <Controller
                control={control}
                rules={{
                  required: {
                    message: AppConstants.ERROR_EmailIsRequired,
                    value: true,
                  },
                  validate: {
                    invalidEmail: (value) => {
                      return validateEmail(value);
                    },
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <Input
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Email Address"
                      textContentType="emailAddress"
                      style={styles.textInput}
                    />
                    {watch("emailAddress") &&
                      (validateEmail(value) ? (
                        <View style={styles.iconContainer}>
                          <Icon
                            name="checkmark-circle-2-outline"
                            fill="green"
                            style={styles.icon}
                          />
                        </View>
                      ) : (
                        <View style={styles.iconContainer}>
                          <Icon
                            name="close-circle-outline"
                            fill="red"
                            style={styles.icon}
                          />
                        </View>
                      ))}
                  </>
                )}
                name="emailAddress"
              />
            </View>
            {errors.emailAddress && errors.emailAddress.type === "required" && (
              <Text style={{ color: theme.colors.error }}>
                {AppConstants.ERROR_EmailIsRequired}
              </Text>
            )}
            {errors.emailAddress &&
              errors.emailAddress.type === "invalidEmail" && (
                <Text style={{ color: theme.colors.error }}>
                  {AppConstants.ERROR_InvalidEmail}
                </Text>
              )}
            {emailRegistered && (
              <Text style={{ color: theme.colors.error }}>
                {AppConstants.ERROR_EmailIsAlreadyRegistered}
              </Text>
            )}
            <View>
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
                  <>
                    <Input
                      placeholder="Password"
                      onBlur={onBlur}
                      onChangeText={(text) => {
                        onChange(text);
                        handlePasswordChange(text);
                      }}
                      value={value}
                      secureTextEntry
                      textContentType="password"
                      style={styles.textInput}
                    />
                    {watch("password") && watch("password").length > 0 && (
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
                    <PasswordRequirements
                      password={password}
                      show={isPasswordValid}
                    />
                  </>
                )}
                name="password"
              />
            </View>
            {errors.password && errors.password.type === "required" && (
              <Text style={{ color: theme.colors.error }}>
                {AppConstants.ERROR_PasswordIsRequired}
              </Text>
            )}
            {errors.password && errors.password.type === "validate" && (
              <Text style={{ color: theme.colors.error }}>
                {AppConstants.ERROR_InvalidPassword}
              </Text>
            )}
            <View>
              <Controller
                control={control}
                rules={{
                  maxLength: 16,
                  required: true,
                  validate: (val) => {
                    if (watch("password") != val) {
                      return AppConstants.ERROR_ConfirmPassword;
                    }
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <Input
                      placeholder={AppConstants.PLACEHOLDER_ConfirmPassword}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      secureTextEntry
                      textContentType="password"
                      style={styles.textInput}
                    />
                    {watch("password") &&
                    watch("password").length > 0 &&
                    watch("password") === value ? (
                      <View style={styles.iconContainer}>
                        <Icon
                          name="checkmark-circle-2-outline"
                          fill="green"
                          style={styles.icon}
                        />
                      </View>
                    ) : (
                      <>
                        {value?.length > 0 && (
                          <View style={styles.iconContainer}>
                            <Icon
                              name="close-circle-outline"
                              fill="red"
                              style={styles.icon}
                            />
                          </View>
                        )}
                      </>
                    )}
                  </>
                )}
                name="confirmPassword"
              />
            </View>
            {errors.confirmPassword &&
              errors.confirmPassword.type === "required" && (
                <Text style={{ color: theme.colors.error }}>
                  {AppConstants.ERROR_PasswordIsRequired}
                </Text>
              )}
            {errors.confirmPassword &&
              errors.confirmPassword.type === "validate" && (
                <Text style={{ color: theme.colors.error }}>
                  {AppConstants.ERROR_ConfirmPassword}
                </Text>
              )}

            <Button onPress={handleSubmit(onSubmit)} style={styles.button}>
              Sign Up
            </Button>
            <Button
              appearance="outline"
              onPress={() => navigation.navigate("SignIn")}
              style={styles.button}
            >
              {AppConstants.LABEL_AlreadyAUser}
            </Button>
            <ActivityIndicator
              animating={loading}
              color={theme.colors.onPrimaryContainer}
              size="small"
              style={styles.spinner}
            />
          </Card>
        </Animatable.View>
        <Snackbar
          visible={showSnack}
          onDismiss={onDismissSnackBar}
          action={{
            label: "Close",
            onPress: () => {
              onDismissSnackBar();
            },
          }}
        >
          {snackMessage}
        </Snackbar>
      </SafeAreaView>
    </View>
  );
}

const { height } = Dimensions.get("screen");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  contentContainer: {
    marginHorizontal: 20,
    marginVertical: 0,
  },
  card: {
    paddingTop: 25,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    borderRadius: 35,
  },
  button: {
    marginVertical: 10,
  },
  textInput: {
    marginVertical: 8,
  },
  title: {
    textAlign: "center",
    marginBottom: 35,
  },
  spinner: {
    marginTop: 5,
  },

  iconContainer: {
    position: "absolute",
    right: 8,
  },
  icon: {
    width: 24,
    height: 24,
    top: 15,
  },
});
