import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EmpNavigator from './screens/Navigator/EmpNavigator';
import ManagerNavigator from './screens/Navigator/ManagerNavigator';

import EmpAssignedGeofenceScreen from './screens/EmployeeSide/EmpAssignedGeofence'

import { EmployeeProvider } from './screens/Context/EmployeeContext';

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
    <Stack.Navigator initialRouteName='ManagerSide' screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AdminView" component={AdminDashboard} />
      <Stack.Screen name="ManagerSide" component={ManagerNavigator} />
      <Stack.Screen name="EmpSide" component={EmpNavigator}/>
    </Stack.Navigator>
  );
}


export default function App() {
  return (
    <EmployeeProvider>
      <NavigationContainer>
        {/* <RootStack /> */}
        <ManagerNavigator/>
        {/* <EmpNavigator /> */}
      </NavigationContainer>
    
    </EmployeeProvider>
    // <EmpAssignedGeofenceScreen />

  );
}