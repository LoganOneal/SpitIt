import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View, ViewProps } from "react-native";
import { Button, Card, Icon, IconElement, Text , Divider } from '@ui-kitten/components';

import * as AppConstants from "../../constants/constants";
import { useFirestore } from "../../hooks/useFirestore";

export default function QRCodeScreen({ route, navigation }) {
  const { receiptId } = route.params;
  const { getReceiptById } = useFirestore();
  const [joinCode, setJoinCode] = useState("");
  
  useEffect(() => {
    const fetchJoinCode = async () => {
      try {
        const receipt = await getReceiptById(receiptId);
        if (receipt && receipt?.joinCode) {
          setJoinCode(receipt.joinCode.slice(0, 4) + "-" + receipt.joinCode.slice(4))
        }
      } catch (error) {
        console.error("Error fetching join code:", error);
      }
    };
    fetchJoinCode();
  }, []);

  const PlusIcon = (props): IconElement => (
    <Icon
      {...props}
      name='plus'
    />
  );

  const Footer = (props: ViewProps) : React.ReactElement => (
    <View>
        <Text category="h6" style={styles.joinCode}>
          Join Code: {joinCode}
        </Text>
    </View>
  );

  return (
    <View
      style={styles.container}>
      <Text category='h4'>
        Share Receipt
      </Text>
      <Card style={styles.card} footer={Footer}>
        <Text>*Insert QR Code*</Text>
      </Card>
      <View style={styles.bottomButtons}>
        <Button
          appearance="outline"
          style={styles.button}
          accessoryLeft={PlusIcon}
          onPress={() => navigation.navigate("Guests", {receiptId: receiptId})}>
          ADD GUEST MAUNALLY
        </Button>
        <Button
          style={styles.button}
          onPress={() => navigation.pop(2)}>
          DONE
        </Button>
      </View>
    </View>
  )
}

const { width } = Dimensions.get("screen");
const qrcode_side_length = width * 0.85;

const styles = StyleSheet.create({
  button: {
    width: width * 0.85,
    height: 50,
    marginTop: 20
  },
  bottomButtons: {
    marginBottom: 50
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 40,
  },
  card: {
    width: qrcode_side_length,
    height: qrcode_side_length + 40,
  },
  joinCode: {
    textAlign: "center",
    marginVertical: 15
  }
});