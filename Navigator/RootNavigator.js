import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmpNavigator from './EmpNavigator.js';
import ManagerNavigator from './ManagerNavigator.js';
import AdminNavigator from './AdminNavigator.js';
import MapNavigator from './MapAdminNavigator.js';
import LoginScreen from "../screens/LoginScreen.js";


const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator initialRouteName='Login' screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AdminSide" component={AdminNavigator} />
      <Stack.Screen name="ManagerSide" component={ManagerNavigator} />
      <Stack.Screen name="EmpSide" component={EmpNavigator}/>
      <Stack.Screen name="MapAdminSide" component={MapNavigator}/>
    </Stack.Navigator>
  );
}

export default RootNavigator;