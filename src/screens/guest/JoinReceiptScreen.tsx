import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Button, Card, Input, Text, Icon } from '@ui-kitten/components';
import { useFirestore } from '../../hooks/useFirestore';

const CameraIcon = (props): IconElement => (
  <Icon
    {...props}
    name='camera-outline'
  />
);

const Header = (props: ViewProps): React.ReactElement => (
  <View {...props} style={styles.header}>
    <Text category='h4'>
      Join a Receipt
    </Text>
  </View>
);

const JoinReceiptScreen = ({ navigation }): React.ReactElement => {
  const { joinReceipt } = useFirestore();

  const [joinCode, setJoinCode] = React.useState('');

  const handleInputChange = (nextValue: string) => {
    const formattedValue = nextValue
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8)
      .replace(/([A-Z0-9]{4})([A-Z0-9]{0,4})/, '$1-$2');
    setJoinCode(formattedValue);
  };

  const handleJoinReceipt = async () => {
    // remove dash from join code 
    const formattedJoinCode = joinCode.replace(/-/g, '');

    console.log('Joining receipt with code:', formattedJoinCode);

    try {
      const receiptId = await joinReceipt(formattedJoinCode);
      navigation.navigate('Select Items', {
        receiptId: receiptId,
      });
    } catch (error) {
      console.error('Error joining receipt:', error);
    }
  }

  return (
    <View style={styles.container}>
      <Card
        style={styles.card}
        header={Header}
      >
        <Input
          label='Invite Code'
          style={styles.input}
          placeholder='####-####'
          value={joinCode}
          onChangeText={handleInputChange}
        />
        <Button
          style={styles.joinButton}
          appearance='outline'
          onPress={handleJoinReceipt}
        >
          JOIN RECEIPT
        </Button>
        <Button
          style={styles.qrButton}
          onPress={() => navigation.navigate('Join Receipt')}
          accessoryLeft={CameraIcon}
        >
          SCAN QR CODE
        </Button>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginBottom: 35,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 40
  },
  card: {
    alignItems: 'center'
  },
  input: {
    margin: 2,
    width: "100%"
  },
  joinButton: {
    marginTop: 20,
  },
  qrButton: {
    marginTop: 100,
  }
});

export default JoinReceiptScreen;