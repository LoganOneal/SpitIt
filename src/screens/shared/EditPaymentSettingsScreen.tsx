import React, { useState } from "react";
import { View, ScrollView, Alert, StyleSheet } from "react-native";
import { Text,TextInput, Button } from "react-native-paper";
import { useFirestore } from "../../hooks/useFirestore";

const EditPaymentSettingsScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const { profile } = route.params;
  const [venmoName, setVenmoName] = useState("");
  const { updateVenmoName } = useFirestore();
  const [venmoNameError, setVenmoNameError] = useState("");
  const [cashAppName, setCashAppName] = useState("");
  const { updateCashAppName } = useFirestore();
  const [cashAppNameError, setCashAppNameError] = useState("");
  console.log("\nProfile")
  console.log(profile)
  console.log("\n")

  const handleSave = async () => {
    if (
      cashAppName !== profile?.cashAppName &&
      cashAppName !== "" &&
      cashAppName !== null
    ) {
      try {
        await updateCashAppName(cashAppName);
        setCashAppNameError("");
      } catch (error) {
        console.log("Error updating cash app name:", error);
        setCashAppNameError("Error updating Cash App Username.. Please try again");
        return;
      }
      
    } else if (
      venmoName !== profile?.venmoName &&
      venmoName !== "" &&
      venmoName !== null
    ) {
      try {
        await updateVenmoName(venmoName);
        setVenmoNameError("");
      } catch (error) {
        console.log("Error updating venmo name:", error);
        setVenmoNameError("Error updating Venmo Username.. Please try again");
        return;
      }
    }

    Alert.alert("Success", "Payment Settings updated successfully.", [
      {
        text: "OK",
        onPress: () => {
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment Settings</Text>
        </View>
        <View style={styles.rowWrapper}>
          <Text style={styles.rowLabel}>Cash App Username</Text>
          <View style={styles.row}>
            <View style={styles.rowValueContainer}>
              <TextInput
                style={styles.rowValue}
                mode="outlined"
                value={cashAppName}
                onChangeText={setCashAppName}
                placeholder={profile?.cashAppName || "Enter Cash App Username"}
              />
            </View>
          </View>
          <View>
            <Text style={styles.errorText}>{cashAppNameError}</Text>
          </View>
        </View>
        <View style={styles.rowWrapper}>
          <Text style={styles.rowLabel}>Venmo Username</Text>
          <View style={styles.row}>
            <View style={styles.rowValueContainer}>
              <TextInput
                style={styles.rowValue}
                mode="outlined"
                value={venmoName}
                onChangeText={setVenmoName}
                placeholder={profile?.venmoName || "Enter Venmo Username"}
              />
            </View>
          </View>
          <View>
            <Text style={styles.errorText}>{venmoNameError}</Text>
          </View>
        </View>
        <Button
          icon="content-save"
          mode="contained-tonal"
          style={{ margin: 24 }}
          onPress={handleSave}
        >
          Save
        </Button>
      </View>
    </ScrollView>
  );
};

export default EditPaymentSettingsScreen;

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
      marginBottom: 24,
      borderColor: "#e3e3e3",
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
      paddingBottom: 6,
      paddingTop: 6,
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
  