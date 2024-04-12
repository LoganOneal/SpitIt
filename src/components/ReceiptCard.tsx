import * as React from 'react';
import { isRejected } from '@reduxjs/toolkit';
import { IReceipt } from '../interfaces/IReceipt';
import { Button, Card, Layout, Text } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import { Icon, IconElement } from '@ui-kitten/components';
import { ProgressBar } from '@ui-kitten/components';

const Header = ({
  location:{ city, state, country, street },
  host,
  members,
  items,
  image,
  total,
  received,
  tax,
  tip,
  timestamp,
  vendor,
  ...props
}: IReceipt): React.ReactElement => (
  <View {...props}>
    <Text category='h6'>
      {vendor}
    </Text>
    <Text category='s1'>
      Host: {host}
    </Text>
    <Text category='s1'>
      Location: {`${street}, ${city}, ${state}, ${country}`}
    </Text> 
  </View>
);

const ReceiptCard = ({
  location,
  host,
  members,
  items,
  image,
  total,
  received,
  tax,
  tip,
  timestamp,
  vendor
}: IReceipt) => (
  <>
    <Card
      status='basic'
      style={styles.card}
      header={<Header vendor={vendor} host={host} location={location} />}
    >
      <Text>
        Members: {members && members.length > 0 ? members.join(', ') : 'No guests'}
      </Text>
      <Text style={styles.info}>
        Received: ${received} Total: ${total}
      </Text>
      <ProgressBar progress={received / total} />
    </Card>
  </>
);



const styles = StyleSheet.create({
  info: {
    marginTop: 10,
  }, 
  card: {
    width: 300,
    flex: 1,
    marginBottom: 25,
    shadowColor: 'black',
    shadowOffset: { width: 4, height: 2 },
    shadowRadius: 6,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerControl: {
    marginHorizontal: 2,
  },
  icon: {
    width: 32,
    height: 32,
  },
});

export default ReceiptCard;