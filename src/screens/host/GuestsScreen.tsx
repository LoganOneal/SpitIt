import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Button, Icon, IconElement, Text } from '@ui-kitten/components';

import Guest from '../../components/Guest';
import { db } from '../../services/firebase'
import { IGuest } from '../../constants/types';
import { useAppSelector } from '../../store/hook';
import { selectAuthState } from '../../store/authSlice';

export default function GuestsScreen({ route, navigation }) {
  const { receiptId } = route.params;
  const usersInit: IGuest[] = []
  const [users, setUsers] = useState(usersInit);
  const authState = useAppSelector(selectAuthState);
  const userRef = (userId: string) => doc(db, "users", userId);

  const PlusIcon = (props): IconElement => (
    <Icon
      {...props}
      name='plus'
    />
  );

  useEffect(() => {
    console.log(authState)
    try {
      const receiptsColRef = collection(db, 'receipts');
      const receiptDocRef = doc(receiptsColRef, receiptId);

      /* Fetch each users name in the receipt group */
      onSnapshot(receiptDocRef, async (doc) => {
        if (doc.data()) {
          const userIds = doc.data()?.guests;
          const nonHostUsers: IGuest[] = [];

          for (const userId of userIds) {
            const userDoc = await getDoc(userRef(userId));
            if (userDoc.data()) {
              nonHostUsers.push({
                name: userDoc.data()?.name
              })
            }
          }
          setUsers([
            {
              name: authState?.userName + " (Host)"
            },
            ...nonHostUsers
          ])
        }
      });

    } catch (error) {
      console.error('Error retrieving users in the receipt group:', error);
      throw error;
    }
  }, []);

  return (
    <View
      style={styles.container}>
      <Text category='h4'>
        Guests
      </Text>
      <FlatList
        data={users}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <Guest  {...item} />}
        style={styles.flatList}
      />
      <View style={styles.bottomButtons}>
        <Button
          appearance="outline"
          style={styles.button}
          accessoryLeft={PlusIcon}
          onPress={() => navigation.navigate("Search Guest", {receiptId: receiptId})}>
          ADD GUEST VIA SEARCH
        </Button>
        <Button
          appearance="outline"
          style={styles.button}
          accessoryLeft={PlusIcon}
          onPress={() => navigation.navigate("Text Guest", {receiptId: receiptId})}>
          ADD GUEST VIA TEXT
        </Button>
        <Button
          style={styles.button}
          onPress={() => navigation.pop(3)}>
          DONE
        </Button>
      </View>
    </View>
  )
}

const { width } = Dimensions.get("screen");

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
  flatList: {
    width: width * 0.85,
    marginTop: 35,
  }
});