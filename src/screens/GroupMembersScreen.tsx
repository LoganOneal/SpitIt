import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import {
  Button,
  useTheme
} from 'react-native-paper';

import GroupMember from '../components/GroupMember';
import * as AppConstants from '../constants/constants';
import { useReceipts } from '../hooks/useReceipts';
import { MEMBERS } from '../constants/mocks';
import { IGroupMember } from '../constants/types';
import { onSnapshot } from 'firebase/firestore';

type AddMemberFormData = {
  name: string;
  phoneNumber: string;
};

export default function GroupMembersScreen({ route, navigation }) {
  const theme = useTheme();
  const { receipt } = route.params;
  const {  } = useReceipts();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    onSnapshot(receipt, (doc) => {
      if (doc.data()) {
        const users = doc.data().users.map((user: any, index: any) => ({
          id: index,
          ...user
        }));
        setUsers(users);
      }
    })
  }, []);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.primaryContainer },
      ]}>
      <FlatList
        data={users}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => `${item?.id}`}
        renderItem={({ item }) => <GroupMember  {...item} />}
        style={styles.flatList}
      />
      <View style={styles.bottomButtons}>
        <Button
          mode="contained"
          buttonColor="white"
          textColor="black"
          contentStyle={styles.button}
          style={styles.buttonContainer}
          onPress={() => navigation.navigate("Add Member", {receipt: receipt})}>
          {AppConstants.LABEL_AddMember}
        </Button>
        <Button
          mode="contained"
          buttonColor="black"
          contentStyle={styles.button}
          style={styles.buttonContainer}
          onPress={() => {}}>
          {AppConstants.LABEL_CreateGroup}
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
  },
  bottomButtons: {
    marginBottom: 50
  },
  buttonContainer: {
    borderRadius: 0,
    marginTop: 20
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 1,
  },
  flatList: {
    width: width * 0.85,
    marginTop: width * 0.075,
  },
  surface: {
    width: width * 0.85,
    marginTop: width * 0.075
  },
});