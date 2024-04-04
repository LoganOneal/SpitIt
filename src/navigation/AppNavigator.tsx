import * as React from "react";
import { NavigationContainer, Theme } from "@react-navigation/native";
import HomeStack from "./HomeStack";
import PublicStack from "./PublicStack";
import { useAppSelector } from "../store/hook";
import { selectAuthState } from "../store/authSlice";
import * as Linking from 'expo-linking';
import DrawerNavigator from "./DrawerNavigator";

interface AppNavigatorProps {
  theme: Theme;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ theme }) => {
  const authState = useAppSelector(selectAuthState);

  const linking = {
    prefixes: [Linking.createURL('/'), 'https://app.example.com'],
    config: {
      screens: {
        ResetPassword: "NewPassword"
      }
    }
  };
  
  return (
    <NavigationContainer linking={linking} theme={theme}>
      {authState?.isLoggedIn ? <DrawerNavigator /> : <PublicStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;