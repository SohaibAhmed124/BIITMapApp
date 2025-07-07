import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssignGeofenceScreen from '../screens/BranchManagerSide/AssignGeofence';
import AssignedGeofenceListScreen from '../screens/BranchManagerSide/AssignedGeofences';
import AssignedGeofenceDetailsScreen from '../screens/BranchManagerSide/AssignedGeofenceDetails';
import AssignVehicleScreen from '../screens/BranchManagerSide/AssignVehicle';
import AssignedVehicleListScreen from '../screens/BranchManagerSide/AssignedVehicles';
import AssignedVehicleDetailsScreen from '../screens/BranchManagerSide/AssignedVehicleDetails';
import TrackingScreen from '../screens/BranchManagerSide/TrackingEmployee';
import ViolationsScreen from '../screens/BranchManagerSide/ViewViolation';
import ManagerDashboard from '../screens/BranchManagerSide/ManagerDashboard';
import BranchMapLayersScreen from '../screens/BranchManagerSide/BranchMgrMapLayer';


const ManagerStack = createNativeStackNavigator();

const ManagerNavigator = () => {
  return(
    <ManagerStack.Navigator initialRouteName='ManagerDashboard' screenOptions={{headerShown:false}}>
      <ManagerStack.Screen name="ManagerDashboard" component={ManagerDashboard} />
      <ManagerStack.Screen name="BranchMapLayers" component={BranchMapLayersScreen} />
      <ManagerStack.Screen name="AssignedGeofenceDetails" component={AssignedGeofenceDetailsScreen} />
      <ManagerStack.Screen name="AssignedGeofences" component={AssignedGeofenceListScreen}/>
      <ManagerStack.Screen name="AssignedVehicles" component={AssignedVehicleListScreen}/>
      <ManagerStack.Screen name="AssignedVehicleDetails" component={AssignedVehicleDetailsScreen}/>
      <ManagerStack.Screen name="AssignGeofence" component={AssignGeofenceScreen}/>
      <ManagerStack.Screen name="AssignVehicle" component={AssignVehicleScreen}/>
      <ManagerStack.Screen name="EmployeeTracking" component={TrackingScreen}/>
      <ManagerStack.Screen name="ViewViolation" component={ViolationsScreen}/>
    </ManagerStack.Navigator>
  );
}

export default ManagerNavigator;