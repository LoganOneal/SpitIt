import * as React from "react";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomNavigation, BottomNavigationTab, Icon, IconElement } from '@ui-kitten/components';
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused } from '@react-navigation/native';

import MyReceiptsScreen from "../screens/shared/MyReceiptsScreen";
import RequestedReceiptsScreen from "../screens/shared/RequestedReceiptsScreen";
import Scanner from "../screens/shared/Scanner";
import CreateReceipt from "../screens/host/CreateReceipt";
import JoinReceiptScreen from "../screens/guest/JoinReceiptScreen";

const TabNavigator = () => {
  const navigation = useNavigation()
  const { Navigator, Screen } = createBottomTabNavigator();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const isFocused = useIsFocused();

  React.useEffect((state) => {
    console.log(isFocused);
    if (isFocused) {
      setSelectedIndex(0);
      navigation.navigate("My Receipts");
    }
  }, [isFocused]);

  const ReceiptIcon = (props): IconElement => (
    <Icon
      {...props}
      name={selectedIndex == 0 ? "file-text" : "file-text-outline"}
    />
  );

  const RequestIcon = (props): IconElement => (
    <Icon
      {...props}
      name={selectedIndex == 1 ? "people" : "people-outline"}
    />
  );

  const ScanIcon = (props): IconElement => (
    <Icon
      {...props}
      name={selectedIndex == 2 ? "camera" : "camera-outline"}
    />
  );

  const JoinIcon = (props): IconElement => (
    <Icon
      {...props}
      name={selectedIndex == 3 ? "person-add" : "person-add-outline"}
    />
  );

  const AddIcon = (props): IconElement => (
    <Icon
      {...props}
      name={selectedIndex == 4 ? "file-add" : "file-add-outline"}
    />
  );

  const BottomTabBar = ({ navigation, state }) => (
    <BottomNavigation
      appearance="noIndicator"
      style={styles.bottomNav}
      selectedIndex={selectedIndex}
      onSelect={(index) => {
        setSelectedIndex(index);
        navigation.navigate(state.routeNames[index]);
      }}
    >
      <BottomNavigationTab 
        title='Receipts' 
        icon={ReceiptIcon}
      />
      <BottomNavigationTab 
        title='Requests' 
        icon={RequestIcon}
      />      
      <BottomNavigationTab 
        title='Scan' 
        icon={ScanIcon}
      />
      <BottomNavigationTab 
        title='Join' 
        icon={JoinIcon}
      />
      <BottomNavigationTab 
        title='Add' 
        icon={AddIcon}
      />
    </BottomNavigation>
  );
  
  return (
    <Navigator tabBar={state => <BottomTabBar {...state} /> }>
        <Screen name="My Receipts" component={MyReceiptsScreen} options={{headerShown: false}} />
        <Screen name="Requested Receipts" component={RequestedReceiptsScreen} options={{headerShown: false}} />
        <Screen name="Upload Receipt" component={Scanner} options={{headerShown: false}} />
        <Screen name="Join Receipt" component={JoinReceiptScreen} options={{headerShown: false}} />
        <Screen name="Create Receipt" component={CreateReceipt} options={{headerShown: false}} />
    </Navigator>
  )
}

const styles = StyleSheet.create({
  bottomNav: {
    paddingBottom: 25
  }
})

export default TabNavigator;
