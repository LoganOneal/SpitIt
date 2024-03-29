import * as React from 'react';
import { isRejected } from '@reduxjs/toolkit';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Button, Card, CheckBox, CheckBoxProps, Text } from '@ui-kitten/components';
import { StyleSheet, View, ViewProps } from 'react-native';
import { IReceiptItem } from "../interfaces/IReceipt";
import { useFirestore } from '../hooks/useFirestore';



const ReceiptCard = ({
  handleSelectItem,
  receiptItem,
}: {
  handleSelectItem: (item: IReceiptItem) => void;
  receiptItem: IReceiptItem;
}) => {
  const [memberNames, setMemberNames] = React.useState<string[]>([]);
  const useCheckboxState = (initialCheck = false): CheckBoxProps => {
    const [checked, setChecked] = React.useState(initialCheck);
    const onChange = (value: boolean) => {
      setChecked(value);
      handleSelectItem(receiptItem);
    };
    return { checked, onChange };
  };
  const { getFirestoreUser } = useFirestore();
  const paidCheckboxState = useCheckboxState(receiptItem.paid);

  React.useEffect(() => {
    const fetchMemberNames = async () => {
      const names = await Promise.all(
        (receiptItem.purchasers || []).map(async (uid) => {
          const user = await getFirestoreUser(uid);
          return user ? user.displayName || "Unknown Member" : "Unknown Member";
        })
      );
      setMemberNames(names);
    };

    fetchMemberNames();
  }, [receiptItem.purchasers]);

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Text category='s2'>
          {receiptItem.name || 'N/A'}
        </Text>
        <Text>
          ${receiptItem.price ? receiptItem.price.toFixed(2) : 'N/A'}
        </Text>
        <CheckBox
          {...paidCheckboxState}
          disabled={receiptItem.paid}
        />
      </View>
      <View style={styles.membersContainer}>
        <Text>Members: </Text>
        {memberNames.map((name, index) => (
          <View key={index} style={styles.memberTag}>
            <Text category='c1'>{name}</Text>
          </View>
        ))}
      </View>
    </Card>
  )
}



const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  info: {
    marginTop: 10,
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: 300,
    flex: 1,
    marginBottom: 25,
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowRadius: 6,
  },
  membersContainer: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap', // This allows member tags to wrap onto the next line if space runs out
  },
  memberTag: {
    backgroundColor: '#E8E8E8',
    marginRight: 4,
    marginBottom: 4,
    padding: 4,
    borderRadius: 4,
  },

});

export default ReceiptCard;