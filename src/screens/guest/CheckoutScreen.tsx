import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { Linking } from 'react-native';
import { Button, Icon, IconElement, Layout, Card } from '@ui-kitten/components';
import PaymentButton from '../../components/PaymentButton';


const MyReceiptsScreen = ({ route, navigation }: { route: any, navigation: any }): React.ReactElement => {
  const { receiptId, total, host } = route.params;
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // const { getReceiptById, updateItemsPaidStatus, getFirestoreUser } = useFirestore();

  // const handleOpenExternalLink = async (link: string) => {
  //   const supported = await Linking.canOpenURL(link);
  //   if (supported) {
  //     await Linking.openURL(link);
  //   } else {
  //     console.log("Don't know how to open URI: " + link);
  //   }
  // };

  const handleCheckout = async () => {
    if (host) {  
      if (paymentMethod == "Venmo") {
        console.log("checkout with venmo");
        const payment = total + total * .11
        // Linking.openURL('venmo://incomplete/requests?recipients=loganofneal&amount=1&note=TESfTTT')
        Linking.openURL('venmo://paycharge?txn=pay&recipients=' + host?.paymentMethods.Venmo + '&amount=' + payment + '&note=SplitIt! -- Payment for receipt ' + receiptId)
      }
      else if (paymentMethod == "CashApp") {
        console.log("checkout with cash app")
        const payment = total + total * .11
        Linking.openURL('https://cash.app/$' + host?.paymentMethods.CashApp + '/' + payment)
      }
      else if (paymentMethod == "PayPal") {
        console.log("checkout with paypal")
        const payment = total + total * .11
        Linking.openURL('https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=' + host?.paymentMethods.PayPal + '&amount=' + payment + '&currency_code=USD')  
      }
    }
    else {
      console.log("Error: Could not obtain host's payment information")
    }
  };

  const displayPaymentMethods = () => {
    const hostMethods = host?.paymentMethods;
    if (host) {
    // Filter out the payment methods that are not available
    const availableMethods = Object.keys(hostMethods).filter((method) => {
      return hostMethods[method] !== null && hostMethods[method] !== "";
    });

    return availableMethods.map((method, index) => {
      return (
        <PaymentButton
          key={index}
          paymentMethod={method}
          onPress={() => setPaymentMethod(method)}
          isSelected={paymentMethod === method}
        />
      );
    });
  }
  }

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
            {displayPaymentMethods()}
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
  selectedButton: {
    width: "100%",
    marginTop: 15,
    margin: 2,
    backgroundColor: 'lightblue',
  }
});

export default MyReceiptsScreen;