import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { EmployeeProvider } from './Context/EmployeeContext';

import RootNavigator from './Navigator/RootNavigator';

import AdminTrackingScreen from './screens/AdminSide/AdminTrackingEmployee';
import FindRouteScreen from './screens/MapAdminSide/getRoute';
import GetRouteScreen from './screens/MapAdminSide/getRouteGH'
import CreateRouteScreen from './screens/MapAdminSide/createRoute';
import LayerManagementScreen from './screens/MapAdminSide/CreateLayerType';

import AssignLayerScreen from './screens/AdminSide/AssignLayerToEmployee';
import AssignedLayersScreen from './screens/AdminSide/AssignedLayer';

import AddLocationScreen from './screens/MapAdminSide/AddLocation';
import GetLocationScreen from './screens/MapAdminSide/getLocation';


import LeafletMap from './screens/MapAdminSide/CongestionSimulation';
import EmployeeMovementSimulatorScreen from './screens/MapAdminSide/UserLocationSimulation';
import LayerCreation from './screens/MapAdminSide/PolylineLayerCreation';
import ThreatLayerScreen from './screens/MapAdminSide/ThreatLayerCreation';






export default function App() {
  return (
    <EmployeeProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </EmployeeProvider>
    // <AdminTrackingScreen/>
  );
}