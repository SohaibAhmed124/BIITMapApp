import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeeProfileScreen from '../screens/EmployeeSide/EmpProfile';
import EmpAssignedVehicleScreen from '../screens/EmployeeSide/EmpAssignedVehicle';
import EmpAssignedGeofenceScreen from '../screens/EmployeeSide/EmpAssignedGeofence';
import EmpViolation from '../screens/EmployeeSide/EmpViolation';
import EmpDashboardScreen from '../screens/EmployeeSide/EmpDashboard';
import EmpMapLayersScreen from '../screens/EmployeeSide/EmpMapLayer';

const EmpStack = createNativeStackNavigator();

const EmpNavigator = () => {
  return(
    <EmpStack.Navigator initialRouteName="EmpDashboard" screenOptions={{headerShown:false}}>
        <EmpStack.Screen name="EmpDashboard" component={EmpDashboardScreen} />
        <EmpStack.Screen name="EmpMapLayers" component={EmpMapLayersScreen} />
        <EmpStack.Screen name="EmpAssignedVehicle" component={EmpAssignedVehicleScreen} />
        <EmpStack.Screen name="EmpAssignedGeofence" component={EmpAssignedGeofenceScreen} />
        <EmpStack.Screen name="EmpViolation" component={EmpViolation} />
    </EmpStack.Navigator>
  );
}

export default EmpNavigator;