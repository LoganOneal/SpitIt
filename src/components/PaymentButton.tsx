import { StyleSheet } from 'react-native';
import { Button } from '@ui-kitten/components';
import React from 'react';

interface PaymentButtonProps {
    paymentMethod: string;
    onPress: () => void;
    isSelected: boolean;
}

const PaymentButton = ({ paymentMethod, onPress, isSelected }: PaymentButtonProps) => {
    return (
        <Button
            style={[styles.button, isSelected && styles.selectedButton]}
            appearance='outline'
            status='info'
            size='giant'
            onPress={onPress}
        >
            {paymentMethod}
        </Button>
    );
}

export default PaymentButton;

const styles = StyleSheet.create({
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
