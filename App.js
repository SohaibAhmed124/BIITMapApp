import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EmpNavigator from './Navigator/EmpNavigator';
import ManagerNavigator from './Navigator/ManagerNavigator';
import AdminNavigator from './Navigator/AdminNavigator';
import MapNavigator from './Navigator/MapAdminNavigator.js';
import LoginScreen from "./screens/LoginScreen.js";

import { EmployeeProvider } from './Context/EmployeeContext';

import FindRouteScreen from './screens/MapAdminSide/getRoute';
import GetRouteScreen from './screens/MapAdminSide/getRouteGH'
import CreateRouteScreen from './screens/MapAdminSide/createRoute';
import MapMatchingScreen from './screens/MapAdminSide/MapMatch';

import AddLocationScreen from './screens/MapAdminSide/AddLocation';
import GetLocationScreen from './screens/MapAdminSide/getLocation';

import LeafletMap from './screens/MapAdminSide/CongestionSimulation';
import EmployeeMovementSimulatorScreen from './screens/MapAdminSide/UserLocationSimulation';



const Stack = createNativeStackNavigator();

function RootStack() {
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


export default function App() {
  return (
    <EmployeeProvider>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </EmployeeProvider>
    // <EmployeeMovementSimulatorScreen/>
    // <GetRouteScreen/>
  );
}