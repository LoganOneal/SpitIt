import React, { useEffect, useState } from 'react';
import { ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { useFirestore } from '../../hooks/useFirestore';
import { Linking } from 'react-native';
import { Button, Icon, IconElement, Layout, Card } from '@ui-kitten/components';
import { useAppDispatch } from "../../store/hook";
import { IReceipt } from '../../interfaces/IReceipt';
import ItemCard from '../../components/ItemCard';
import { useAppSelector } from "../../store/hook";
import { selectAuthState } from "../../store/authSlice";
import { IPaymentMethod } from '../../constants/types';
import { useData } from '../../hooks/useData';
import { getFirestore } from 'firebase/firestore';


const MyReceiptsScreen = ({ route, navigation }: { route: any, navigation: any }): React.ReactElement => {
  const { receiptId, total } = route.params;

  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [receipt, setReceipt] = useState<IReceipt | undefined>(undefined);
  const authState = useAppSelector(selectAuthState);

  const { getReceiptById, updateItemsPaidStatus, getFirestoreUser } = useFirestore();

  const handleOpenExternalLink = async (link: string) => {
    const supported = await Linking.canOpenURL(link);
    if (supported) {
      await Linking.openURL(link);
    } else {
      console.log("Don't know how to open URI: " + link);
    }
  };
  const handleCheckout = async () => {
    const receipt = await getReceiptById(receiptId);
    if (receipt.host) {
      const host = await getFirestoreUser(receipt.host.toString())

      if (paymentMethod == "venmo") {
        console.log("checkout with vddeffffnmo");
        Linking.openURL('venmo://incomplete/requests?recipients=loganofneal&amount=1&note=TESfTTT')
      }
      else if (paymentMethod == "cash app") {
        console.log("checkout with cash app")
        const payment = total + total * .11
        Linking.openURL('https://cash.app/$' + host?.cashAppName + '/' + payment)
      }
      else if (paymentMethod == "paypal") {
        console.log("checkout with paypal")
        const payment = total + total * .11
        Linking.openURL('https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=' + host?.paypalEmail + '&amount=' + payment + '&currency_code=USD')  
      }
    }
    else {
      console.log("Error: Could not obtain host's payment information")
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.upperRow}>
        <Card
          style={styles.card}
        >
          <View style={styles.header}>
            <Text category='h5'>
              Select payment method
            </Text>

          </View>
        </Card>
        <View
          style={styles.card}
        >
          <View style={styles.header}>
            <Button
              style={styles.button}
              appearance='outline'
              status='info'
              size='giant'
              onPress={() => setPaymentMethod("venmo")}
            >
              Venmo
            </Button>
            <Button
              style={styles.button}
              appearance='outline'
              status='info'
              size='giant'
              onPress={() => setPaymentMethod("cash app")}
            >
              Cash App
            </Button>
            <Button
              style={styles.button}
              appearance='outline'
              status='info'
              size='giant'
              onPress={() => setPaymentMethod("paypal")}
            >
              PayPal
            </Button>
            <Button
              style={styles.button}
              appearance='outline'
              status='info'
              size='giant'
            >
              Plaid
            </Button>
          </View>
        </View>

      </View>
      <View style={styles.lowerRow}>
        <Card
          style={styles.card}
        >
          <View >
            <View style={styles.rowContainer}>
              <View style={styles.columnContainer}>
                <Text category='s1'>
                  Subtotal:
                </Text>
                <Text category='s1'>
                  Tax + Tip:
                </Text>
                <Text category='s1'>
                  Total:
                </Text>
              </View>
              <View style={styles.columnContainer}>
                <Text category='s1' appearance='hint'>${total}</Text>
                <Text category='s1' appearance='hint'>${total * .11}</Text>
                <Text category='s1' appearance='hint'>${total + total * .11}</Text>
              </View>
            </View>
            <Button
              style={styles.button}
              status='info'
              size='giant'
              onPress={handleCheckout}
            >
              Checkout
            </Button>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  columnContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginRight: 10,
    marginVertical: 10
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    alignItems: 'center',
  },
  card: {
    width: 300,
    marginVertical: 25,
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowRadius: 6,
    justifyContent: 'center',
    alignContent: 'center',
  },
  upperRow: {
    flex: 7,  // Takes up 80% of the screen
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  lowerRow: {
    flex: 3,  // Takes up 20% of the screen
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30
  },
  button: {
    width: "100%",
    marginTop: 15,
    margin: 2,
  },
});

export default MyReceiptsScreen;