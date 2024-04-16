import React, { useState } from "react";
import {
  useTheme,
  Snackbar,
  ActivityIndicator,
} from "react-native-paper";
import {
  Card,
  Button,
  Input,
  Text
} from "@ui-kitten/components";
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
import { useAuth } from "../hooks/useAuth";
import { IAuthState } from "../interfaces/IAuthentication";
import { userRegistered } from "../store/authSlice";
import { useValidation } from "../hooks/useValidation";

type PaymentData = {
  venmo: string;
  cashApp: string;
  payPal: string;
};

export default function SignUpScreen({ route, navigation }) {
  const theme = useTheme();
  const [showSnack, setShowSnack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const dispatch = useAppDispatch();
  const { signupUser, getProfile } = useAuth();
  const [ clickedSubmit, setClickedSubmit ] = useState(false);
  const [emailRegistered, setEmailRegistered] = useState(false);
  const signUpFormData = route.params.data;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentData>();

  const onSubmit = (paymentData: PaymentData) => {
    setClickedSubmit(true);
    if (paymentData.venmo || paymentData.cashApp || paymentData.payPal) {
      handleSignUp(
        signUpFormData.firstName,
        signUpFormData.lastName,
        signUpFormData.emailAddress,
        signUpFormData.password,
        paymentData.venmo,
        paymentData.cashApp,
        paymentData.payPal
      );
    }
  };

  const onDismissSnackBar = () => setShowSnack(false);

  const handleSignUp = async (
    fname: string,
    lname: string,
    email: string,
    password: string,
    venmo: string,
    cashApp: string,
    payPal: string
  ) => {
    let parsedResponse = null;
    let firebaseToken = null;
    const fullName = fname + " " + lname;
    setLoading(true);

    await signupUser(fullName, email, password, venmo, cashApp, payPal).then((fbResponse) => {
      parsedResponse = JSON.parse(fbResponse);

      // error response
      if (parsedResponse.error.code) {
        if (parsedResponse.error.code === "auth/email-already-in-use") {
          setEmailRegistered(true);
        }
        setSnackMessage(parsedResponse.error.message);
        setShowSnack(true);
        setLoading(false);
        return;
      }

      // response
      if (parsedResponse.result) {
        firebaseToken = parsedResponse.result.user.stsTokenManager.accessToken;
        const firebaseUserName = parsedResponse.result.user.displayName;
        if (firebaseToken != null) {
          // Get firebase profile
          const profile = getProfile();
          const user: IAuthState = {
            firebaseUID: profile?.firebaseUID,
            userName: profile?.displayName ?? firebaseUserName,
            userToken: firebaseToken,
            userEmail: profile?.email ?? email,
            sessionTimedOut: false,
            isLoading: false,
            isLoggedIn: true,
            darkMode: false,
          };
          // Redux action
          dispatch(userRegistered(user));
          setLoading(false);
          // React navigation will handle Redirect to home, if login worked
        }
      }
    });
  };

  return (
    <View
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <Animatable.View
          style={[
            styles.contentContainer,
          ]}
          animation="fadeInUpBig"
        >
          <Card style={styles.card}>
            <Text category="h3" style={styles.title}>
              Payment Platforms
            </Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Venmo"
                  textContentType="name"
                  style={styles.textInput}
                />
              )}
              name="venmo"
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Cash App"
                  textContentType="name"
                  style={styles.textInput}
                />
              )}
              name="cashApp"
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="PayPal"
                  textContentType="name"
                  style={styles.textInput}
                />
              )}
              name="payPal"
            />
            {!watch("venmo") && !watch("cashApp") && !watch("payPal") && clickedSubmit &&
              <Text style={{ color: theme.colors.error }}>
                Please enter at least one payment method.
              </Text>
            }

            <Button
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
            >
              Continue
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
    paddingVertical: 100
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
    marginBottom: 35
  },
  spinner: {
    marginTop: 5
  }
});
