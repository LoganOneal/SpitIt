import React, { useEffect, useState } from "react";
import {
    TouchableOpacity,
    StyleSheet,
    View,
    Alert,
    FlatList,
    Modal,
    TextInput,
} from "react-native";
import { Text } from "@ui-kitten/components";
import { useFirestore } from "../../hooks/useFirestore";
import {
    Button,
    Icon,
    IconElement,
    Layout,
    Card,
    Input,
} from "@ui-kitten/components";
import { IReceipt, IReceiptItem } from "../../interfaces/IReceipt";
import { useForm, Controller, set } from "react-hook-form";
import ItemCard from "../../components/ItemCard";
import { useAppSelector } from "../../store/hook";
import { selectAuthState } from "../../store/authSlice";
import { auth } from "../../services/firebase";
import { IFirebaseUser } from '../../interfaces/IAuthentication';

const PlusCircleIcon = (props: any) => <Icon {...props} name="plus-outline" />;

const MyReceiptsScreen = ({
    route,
    navigation,
}: {
    route: any;
    navigation: any;
}): React.ReactElement => {
    const { receiptId } = route.params;
    const authState = useAppSelector(selectAuthState);
    const { getReceiptById, updateItemsPaidStatus, getFirestoreUser, RemoveItem, addNewItemToReceipt } = useFirestore();
    const [items, setItems] = useState<IReceiptItem[] | undefined>([]);
    const [receipt, setReceipt] = useState<IReceipt | undefined>(undefined);
    const [selectedItems, setSelectedItems] = useState<IReceiptItem[]>([]);
    const [individualTotal, setIndividualTotal] = useState<number>(0);
    const [memberNames, setMemberNames] = useState<Record<string, string>>({});
    const [modalVisible, setModalVisible] = useState(false);
    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            itemName: "",
            itemPrice: "",
        },
    });

    useEffect(() => {
        const fetchReceipts = async () => {
            try {
                const receipt = await getReceiptById(receiptId);
                setReceipt(receipt);
                if (receipt && receipt?.host) {
                    const host = await getFirestoreUser(receipt.host.toString())
                    // setHost(host);
                }
                setItems(receipt?.items ?? []);
            } catch (error) {
                console.error("Error setting receipt items:", error);
            }
        };
        fetchReceipts();
    }, []);

  
      
      
    // update total price on item select change
    useEffect(() => {
        const total = selectedItems.reduce(
            (acc, item) => acc + (item.price ?? 0),
            0
        );
        setIndividualTotal(total);
    }, [selectedItems]);

    const handleSelectItem = (item: IReceiptItem) => {
        if (selectedItems.some((selectedItem) => selectedItem.id === item.id)) {
            setSelectedItems(
                selectedItems.filter((selectedItem) => selectedItem.id !== item.id)
            );
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleHostCheckout = async () => {
        if (authState.userName) {
            const itemIds = selectedItems.map((item) => item.id);
            try {
                const filteredItemIds = itemIds.filter(
                    (id) => typeof id === "number"
                ) as number[];
                await updateItemsPaidStatus(receiptId, filteredItemIds, true);

                const updatedItems = items?.map((item) => {
                    if (filteredItemIds.includes(item.id as number)) {
                        return { ...item, paid: true };
                    }
                    return item;
                });
                setItems(updatedItems);
                setSelectedItems([]);

                console.log("Checkout successful");
                navigation.navigate("Receipts");
            } catch (error) {
                console.error("Checkout failed:", error);
            }
        } else {
            console.log("No items selected or user not authenticated");
        }
    };

    const handleGuestCheckout = async () => {
        navigation.navigate('GuestCheckout', { receiptId: receiptId, total: individualTotal, host: host });        
    }

    const handleCheckout = async () => {
        /* Host Checkout */
        if (receipt && receipt.host === auth.currentUser?.uid) {
            handleHostCheckout();
        } else {
            /* Guest Checkout */
            handleGuestCheckout();
        }
    };

    const onSubmit = (data) => {
        addNewItemToReceipt(receiptId, data.itemName, parseFloat(data.itemPrice), items?.length ?? 0);
        setModalVisible(false);
        reset(); // Reset form fields
        setItems([...items ?? [], { name: data.itemName, price: parseFloat(data.itemPrice) }]);
    };
    const renderFooter = () => (
        <View style={styles.footerContainer}>
            <Button
                accessoryLeft={PlusCircleIcon}
                style={styles.circleButton}
                onPress={() => setModalVisible(true)}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Controller
                            control={control}
                            name="itemName"
                            rules={{ required: 'Item name is required' }}
                            render={({ field: { onChange, value },fieldState: { error } }) => (
                                <Input
                                    placeholder="Item Name"
                                    value={value}
                                    onChangeText={onChange}
                                    status={error ? 'danger' : 'basic'}
                                    caption={error ? error.message : ''}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="itemPrice"
                            rules={{ 
                                required: 'Item price is required', 
                                pattern: {
                                    value: /^\d+(\.\d+)?$/, 
                                    message: 'Item price must be a number and can include a decimal point'
                                }
                            }}
                            render={({ field: { onChange, value },  fieldState: { error } }) => (
                                <Input
                                    placeholder="Item Price"
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="numeric"
                                    status={error ? 'danger' : 'basic'}
                                    caption={error ? error.message : ''}
                                />
                            )}
                        />
                        <Button style={styles.button} onPress={handleSubmit(onSubmit)}>
                            Add Item
                        </Button>
                        <Button
                            style={styles.button}
                            onPress={() => {
                                setModalVisible(false);
                                reset();
                            }}
                        >
                            Cancel
                        </Button>
                    </View>
                </View>
            </Modal>
        </View>
    );
    const handleRemoveItem = (itemToRemove: IReceiptItem) => {
        if (authState.userName) {
            Alert.alert(
                "Remove Item",
                "Are you sure you want to remove this item?",
                [
                    {
                        text: "Cancel",
                        onPress: () => console.log("Cancel Pressed"),
                        style: "cancel",
                    },
                    {
                        text: "Yes",
                        onPress: async () => {
                            try {
                                console.log("Receipt ID: ", receiptId);
                                if (itemToRemove.name) {
                                    console.log("Removing item: ", itemToRemove.name);
                                    RemoveItem(receiptId, itemToRemove.name, itemToRemove.price as number);
                                }
                                const updatedItems = items?.filter(
                                    (item) => item.name !== itemToRemove.name
                                );
                                setItems(updatedItems);
                                console.log("Item removed");
                            } catch (error) {
                                console.error("Item cannot be removed:", error);
                            }
                        },
                    },
                ],
                { cancelable: false }
            );
        } else {
            console.log("No items selected or user not authenticated");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.upperRow}>
                <Card style={styles.card}>
                    <View style={styles.header}>
                        <Text category="h5">Select your items</Text>
                        <Text category="label" style={{ marginTop: 10 }}>
                            {receipt?.vendor}
                        </Text>
                    </View>
                </Card>
                <FlatList
                    data={items?.filter((item) => !item.paid) ?? []}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => `${item?.id}`}
                    style={{ paddingHorizontal: 12 }}
                    contentContainerStyle={{ paddingBottom: 30 }}
                    renderItem={({ item }) => (
                        <ItemCard
                            handleSelectItem={handleSelectItem}
                            receiptItem={item}
                            onRemoveItem={handleRemoveItem}
                        />
                    )}
                    ListFooterComponent={renderFooter}
                />
            </View>
            <View style={styles.lowerRow}>
                <Card style={styles.card}>
                    <View>
                        <View style={styles.rowContainer}>
                            <View style={styles.columnContainer}>
                                <Text category="s1">Subtotal:</Text>
                                <Text category="s1">Tax + Tip:</Text>
                                <Text category="s1">Total:</Text>
                            </View>
                            <View style={styles.columnContainer}>
                                <Text category="s1" appearance="hint">
                                    ${individualTotal}
                                </Text>
                                <Text category="s1" appearance="hint">
                                    ${individualTotal * 0.11}
                                </Text>
                                <Text category="s1" appearance="hint">
                                    ${individualTotal + individualTotal * 0.11}
                                </Text>
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    columnContainer: {
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginRight: 10,
        marginVertical: 10,
    },
    container: {
        flex: 1,
        flexDirection: "column",
    },
    header: {
        alignItems: "center",
    },
    card: {
        width: 300,
        marginVertical: 25,
        shadowColor: "black",
        shadowOffset: { width: 4, height: 2 },
        shadowRadius: 6,
        justifyContent: "center",
        alignContent: "center",
    },
    upperRow: {
        flex: 7, // Takes up 80% of the screen
        justifyContent: "center",
        alignItems: "center",
    },
    lowerRow: {
        flex: 3, // Takes up 20% of the screen
        justifyContent: "center",
        alignItems: "center",
    },
    button: {
        marginTop: 15,
        margin: 2,
    },
    circleButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
    },
    footerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "80%",
    },
});

export default MyReceiptsScreen;
