import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import * as React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, Button, Divider, Icon } from "@ui-kitten/components";
import ThemeToggle from "./ThemeToggle";
import { useAppDispatch, useAppSelector } from "../store/hook";
import { selectAuthState, userLoggedOut } from "../store/authSlice";

const DrawerContent = (props) => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuthState);
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerContainer}>
        <View style={styles.drawerHeader}>
          <Text category="h5">Welcome {authState?.userName ?? "N/A"}</Text>
        </View>
        <Divider style={{ alignSelf: "stretch" }} />
        <View style={styles.drawerItem}>
          <DrawerItem
            label="Home"
            onPress={() => props.navigation.navigate("Home")}
          />
          <DrawerItem
            label="Settings"
            onPress={() => props.navigation.navigate("Settings")}
          />
        </View>
        <Divider style={{ alignSelf: "stretch" }} />
        <View style={styles.drawerFooter}>
          <View style={styles.drawerItem}>
            <ThemeToggle />
          </View>
          <View style={styles.drawerItem}>
            <Button
              onPress={() => dispatch(userLoggedOut())}
              accessoryLeft={(props) => (
                <Icon {...props} name="log-out-outline" />
              )}
              style={{ justifyContent: "center" }}
            >
              Log Out
            </Button>
          </View>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

export default DrawerContent;

const { height } = Dimensions.get("screen");
const container_height = height * 0.2;
const header_height = height * 0.04;

const styles = StyleSheet.create({
  drawerContainer: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerHeader: {
    paddingHorizontal: 10,
    height: header_height,
    marginTop: 2,
  },
  drawerFooter: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 10,
    height: container_height,
    width: "100%",
  },
  drawerItem: {
    paddingHorizontal: 1,
    paddingVertical: 10,
    width: "100%",
  },
});
