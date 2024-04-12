import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { IReceipt } from '../../interfaces/IReceipt';
import { useFirestore } from '../../hooks/useFirestore';
import ReceiptCard from '../../components/ReceiptCard';
import { FlatList } from 'react-native';
import { Button, Spinner } from '@ui-kitten/components';
import { useAppDispatch } from "../../store/hook";
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { IFirebaseUser } from '../../interfaces/IAuthentication';

const MyReceiptsScreen = ({navigation}): React.ReactElement => {

  const { getUserReceipts, getFirestoreUser } = useFirestore();
  const [requestedReceipts, setRequestedReceipts] = useState<IReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleReceiptCardPressGuest = (receipt: IReceipt) => {
    console.log(receipt);
    navigation.navigate('Select Items', {
      receiptId: receipt.firebaseId,
    });
  };

  // fetch receipts
  useEffect(() => {
    console.log("is loading", isLoading)
    const fetchReceipts = async () => {
      try {
        setIsLoading(true);
        const { requestedReceipts } = await getUserReceipts();
        const receiptsWithAdditionalData = await Promise.all(requestedReceipts.map(async (receipt) => {
          // Fetch host name
          const hostData = await getFirestoreUser(receipt.host?.toString() || '');
          const hostName = hostData ? hostData.displayName : "Unknown Host";
          console.log("receipt", receipt);
          // Fetch member names
          const memberNames = await Promise.all((receipt.guests ?? []).map(async (memberId: string) => { // Explicitly specify the type of 'memberId' as a string
          const memberData = await getFirestoreUser(memberId);
          return memberData ? memberData.displayName : "Unknown Member";
          }));
          return {
            ...receipt,
            hostName,
            memberNames
          };
        }));
        setRequestedReceipts(receiptsWithAdditionalData.map(receipt => ({
          ...receipt,
          hostName: receipt.hostName || undefined,
          memberNames: receipt.memberNames.filter(name => name !== null) as string[]
        })));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching host receipts:', error);
      }
    }
    fetchReceipts();
    console.log("is loading", isLoading)
  }, []);

  return (
    <View style={styles.container}>
      <Text category='h4' style={styles.title}>
        Requested Receipts
      </Text>
      <View style={styles.content}>
        {isLoading && <View style={styles.loadingContainer}><Spinner size="giant" /></View>}
        <FlatList
            data={requestedReceipts}
            showsVerticalScrollIndicator={true}
            keyExtractor={(item, index) => String(item?.id || index)}
            style={styles.flatList}
            contentContainerStyle={{ paddingBottom: 10, paddingHorizontal: 45 }}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback onPress={() => handleReceiptCardPressGuest(item)}>
                <ReceiptCard {...item} members={item.memberNames} host={item.hostName as string | undefined}/>
              </TouchableWithoutFeedback>
            )}
          />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 20
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30
  },
  title: {
    paddingBottom: 10
  },
  flatList: {
    width: "100%",
    marginTop: 10
  }
});

export default MyReceiptsScreen;