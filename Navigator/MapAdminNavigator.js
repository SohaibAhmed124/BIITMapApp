import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GetLocationScreen from '../screens/MapAdminSide/getLocation';
import CreateRouteScreen from '../screens/MapAdminSide/createRoute';
import AddLocationScreen from '../screens/MapAdminSide/AddLocation';
import FindRouteScreen from '../screens/MapAdminSide/getRouteGH';
import EmployeeMovementSimulatorScreen from '../screens/MapAdminSide/UserLocationSimulation';
import MapAdminDashboard from '../screens/MapAdminSide/MapAdminDashboard';
import LayerCreation from '../screens/MapAdminSide/PolylineLayerCreation';
import ThreatLayerScreen from '../screens/MapAdminSide/ThreatLayerCreation';
import LayerManagementScreen from '../screens/MapAdminSide/CreateLayerType';

const MapStack = createNativeStackNavigator();

const MapNavigator = () => {
  return(
    <MapStack.Navigator initialRouteName="MapAdminDashboard" screenOptions={{headerShown:false}}>
        <MapStack.Screen name="MapAdminDashboard" component={MapAdminDashboard} />
        <MapStack.Screen name="GetLocation" component={GetLocationScreen} />
        <MapStack.Screen name="AddLocation" component={AddLocationScreen} />
        <MapStack.Screen name="FindRoute" component={FindRouteScreen} />
        <MapStack.Screen name="CreateRoute" component={CreateRouteScreen} />
        <MapStack.Screen name="CreateLayer" component={LayerManagementScreen} />
        <MapStack.Screen name="PolylineLayer" component={LayerCreation} />
        <MapStack.Screen name="ThreatLayer" component={ThreatLayerScreen} />
        <MapStack.Screen name="EmpMovSimulator" component={EmployeeMovementSimulatorScreen} />
    </MapStack.Navigator>
  );
}

export default MapNavigator;