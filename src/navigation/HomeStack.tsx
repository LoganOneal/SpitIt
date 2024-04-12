import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CustomNavBar from "./CustomNavBar";
import Scanner from "../screens/shared/Scanner";
import QRCodeScreen from "../screens/host/QRCodeScreen";
import GuestsScreen from "../screens/host/GuestsScreen";
import AddGuestBySMSScreen from "../screens/host/AddGuestBySMSScreen";
import AddGuestBySearchScreen from "../screens/host/AddGuestBySearchScreen";
import CreateReceipt from "../screens/host/CreateReceipt";
import JoinReceiptScreen from "../screens/guest/JoinReceiptScreen";
import SelectItemsScreen from "../screens/shared/SelectItemsScreen";
import SettingsScreen from "../screens/shared/SettingsScreen";
import EditProfileScreen from "../screens/shared/EditProfileScreen";
import EditProfilePasswordScreen from "../screens/shared/EditProfilePasswordScreen";
import EditPaymentSettingsScreen from "../screens/shared/EditPaymentSettingsScreen";
import {useNavigation} from '@react-navigation/native';
import CheckoutScreen from "../screens/guest/CheckoutScreen";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  const navigation = useNavigation();

  return (
    <React.Fragment>

      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          header: (props) => <CustomNavBar {...props} />,
        }}
      >
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="EditProfilePassword" component={EditProfilePasswordScreen} />
        <Stack.Screen name="EditPaymentSettings" component={EditPaymentSettingsScreen} />
        <Stack.Screen name="Upload Receipt" component={ScanReceipt} />
        <Stack.Screen name="GuestCheckout" component={CheckoutScreen} />
        <Stack.Screen name="Create Receipt" component={CreateReceipt} />
        <Stack.Screen name="Join Receipt" component={JoinReceiptScreen} />
        <Stack.Screen name="Select Items" component={SelectItemsScreen} />
        <Stack.Screen name="Share Receipt" component={QRCodeScreen} />
        <Stack.Screen name="Guests" component={GuestsScreen} />
        <Stack.Screen name="Text Guest" component={AddGuestBySMSScreen} />
        <Stack.Screen name="Search Guest" component={AddGuestBySearchScreen} />
      </Stack.Navigator>
    </React.Fragment>
  );
}
