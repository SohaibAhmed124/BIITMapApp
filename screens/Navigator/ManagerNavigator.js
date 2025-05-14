import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AssignGeofenceScreen from '../BranchManagerSide/AssignGeofence';
import AssignedGeofenceListScreen from '../BranchManagerSide/AssignedGeofences';
import AssignedGeofenceDetailsScreen from '../BranchManagerSide/AssignedGeofenceDetails';
import AssignVehicleScreen from '../BranchManagerSide/AssignVehicle';
import AssignedVehicleListScreen from '../BranchManagerSide/AssignedVehicles';
import AssignedVehicleDetailsScreen from '../BranchManagerSide/AssignedVehicleDetails';
import TrackingScreen from '../BranchManagerSide/TrackingEmployee';
import ViolationsScreen from '../BranchManagerSide/ViewViolation';
import ManagerDashboard from '../BranchManagerSide/ManagerDashboard';


const ManagerStack = createNativeStackNavigator();

const ManagerNavigator = () => {
  return(
    <ManagerStack.Navigator initialRouteName='ManagerDashboard' screenOptions={{headerShown:false}}>
      <ManagerStack.Screen name="ManagerDashboard" component={ManagerDashboard} />
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