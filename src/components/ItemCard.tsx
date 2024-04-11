import * as React from 'react';
import { isRejected } from '@reduxjs/toolkit';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Button, Card, CheckBox, CheckBoxProps, Text, Icon } from '@ui-kitten/components';
import { StyleSheet, View, ViewProps, TouchableOpacity } from 'react-native';
import { IReceiptItem } from "../interfaces/IReceipt";


const MinusIcon = (props) => (
  <Icon {...props} name="minus-outline" width={16} height={16}/>
);
const ReceiptCard = ({
  handleSelectItem,
  receiptItem, 
  onRemoveItem,
}: {
  handleSelectItem: (item: IReceiptItem) => void;
  receiptItem: IReceiptItem;
  onRemoveItem: (item: IReceiptItem) => void;
}) => {
  const useCheckboxState = (initialCheck = false): CheckBoxProps => {
    const [checked, setChecked] = React.useState(initialCheck);
    const onChange = (value: boolean) => {
      setChecked(value);
      handleSelectItem(receiptItem);
    };
    return { checked, onChange };
  };

  const paidCheckboxState = useCheckboxState();

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.row}>
        <TouchableOpacity
          style={styles.minusButton}
          onPress={() => onRemoveItem(receiptItem)}
        >
          <MinusIcon fill="#fff" />
        </TouchableOpacity>
          <View style={styles.itemDetails}>
          <Text category='s2' style={styles.itemText}>
            {receiptItem.name}
          </Text>
          <Text>
            ${receiptItem.price}
          </Text>
          </View>
          <CheckBox style={styles.checkbox}
            {...paidCheckboxState}
            disabled={receiptItem.paid}
          >
          </CheckBox>
        </View>
      </Card>
    </>
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
  minusButton: {
    width: 20,
    height: 20,
    borderRadius: 30,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  itemDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  itemText: {
    flexShrink: 1,
    marginRight: 10, 
  },
  checkbox: {
    marginLeft: 8,
  },

});

export default ReceiptCard;