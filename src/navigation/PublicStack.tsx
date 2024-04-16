import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "../screens/SignInScreen";
import * as AppConstants from "../constants/constants";
import SignUpScreen from "../screens/SignUpScreen";
import ThemeToggle from "./ThemeToggle";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import { selectAuthState } from "../store/authSlice";
import { useAppSelector } from "../store/hook";
import PaymentRegistrationScreen from "../screens/PaymentRegistrationScreen";

const Stack = createNativeStackNavigator();

export default function PublicStack() {
  const authState = useAppSelector(selectAuthState);

  /* Conditional stack navigator rendering based on login state */
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="PaymentRegistration" component={PaymentRegistrationScreen} />
    </Stack.Navigator>
  );
}
