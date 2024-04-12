import React, { useEffect, useState } from 'react';
import { ListRenderItemInfo, StyleSheet, View } from 'react-native';
import { Text } from '@ui-kitten/components';
import { useFirestore } from '../../hooks/useFirestore';
import { FlatList } from 'react-native';
import { Button, Icon, IconElement, Layout, Card } from '@ui-kitten/components';
import { useAppDispatch } from "../../store/hook";
import { IReceipt, IReceiptItem } from '../../interfaces/IReceipt';

import ItemCard from '../../components/ItemCard';
import { useAppSelector } from "../../store/hook";
import { selectAuthState } from "../../store/authSlice";
import {auth} from "../../services/firebase";
import { set } from 'react-hook-form';
import { IFirebaseUser } from '../../interfaces/IAuthentication';

const PlusIcon = (props): IconElement => (
    <Icon
        {...props}
        name='plus'
    />
);

const MyReceiptsScreen = ({ route, navigation }: { route: any, navigation: any }): React.ReactElement => {
    const { receiptId } = route.params;
    const authState = useAppSelector(selectAuthState);
    const { getReceiptById, updateItemsPaidStatus, getFirestoreUser } = useFirestore();
    const [items, setItems] = useState<IReceiptItem[] | undefined>([]);
    const [receipt, setReceipt] = useState<IReceipt | undefined>(undefined);
    const [selectedItems, setSelectedItems] = useState<IReceiptItem[]>([]);
    const [individualTotal, setIndividualTotal] = useState<number>(0);
    const [memberNames, setMemberNames] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const receipt = await getReceiptById(receiptId);
                setReceipt(receipt);
                if (receipt && receipt?.host) {
                    const host = await getFirestoreUser(receipt.host.toString())
                    setHost(host);
                }
            } catch (error) {
                console.error('Error setting receipt items:', error);
            }
        }
        fetchReceipts();
    }, []);

  
      
      
    // update total price on item select change 
    useEffect(() => {
        const total = selectedItems.reduce((acc, item) => acc + (item.price ?? 0), 0);
        setIndividualTotal(total);
    }, [selectedItems]);

    const handleSelectItem = (item: IReceiptItem) => {
        if (selectedItems.some(selectedItem => selectedItem.id === item.id)) {
            setSelectedItems(selectedItems.filter(selectedItem => selectedItem.id !== item.id));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    }

    const handleHostCheckout = async () => {
        if (authState.userName && selectedItems.length > 0) {
            const itemIds = selectedItems.map(item => item.id); 
            try {
                const filteredItemIds = itemIds.filter(id => typeof id === 'number') as number[];
                await updateItemsPaidStatus(receiptId, filteredItemIds, true); 
                
                const updatedItems = items?.map(item => {
                    if (filteredItemIds.includes(item.id as number)) {
                        return { ...item, paid: true };
                    }
                    return item;
                });
                setItems(updatedItems);
                setSelectedItems([]); 

                console.log('Checkout successful');
                navigation.navigate('Receipts');
            } catch (error) {
                console.error('Checkout failed:', error);
            }
        } else {
            console.log('No items selected or user not authenticated');
        }
    }

    const handleGuestCheckout = async () => {
        navigation.navigate('GuestCheckout', { receiptId: receiptId, total: individualTotal, host: host });        
    }

    const handleCheckout = async () => {
        /* Host Checkout */
        if(receipt && receipt.host === auth.currentUser?.uid){
            handleHostCheckout();
        }
        /* Guest Checkout */
        else{
           handleGuestCheckout();
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
                            Select your items
                        </Text>
                        <Text category='label' style={{ marginTop: 10 }}>
                            {receipt?.vendor}
                        </Text>
                    </View>
                </Card>
                <FlatList
                    data={receipt?.items?.filter(item => !item.paid) ?? []}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => `${item?.id}`}
                    style={{ paddingHorizontal: 12 }}
                    contentContainerStyle={{ paddingBottom: 30 }}
                    renderItem={({ item }) => <ItemCard handleSelectItem={handleSelectItem} receiptItem={item} />}
                />
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
                                <Text category='s1' appearance='hint'>${individualTotal}</Text>
                                <Text category='s1' appearance='hint'>${individualTotal * .11}</Text>
                                <Text category='s1' appearance='hint'>${individualTotal + individualTotal * .11}</Text>
                            </View>
                        </View>
                        <Button
                            style={styles.button}
                            onPress={handleCheckout}
                            disabled={selectedItems.length === 0 && (receipt && receipt.host !== auth.currentUser?.uid)}
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    lowerRow: {
        flex: 3,  // Takes up 20% of the screen
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        marginTop: 15,
        margin: 2,
    },
});

export default MyReceiptsScreen;