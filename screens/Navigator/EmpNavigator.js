import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployeeProfileScreen from '../EmployeeSide/EmpProfile';
import EmpAssignedVehicleScreen from '../EmployeeSide/EmpAssignedVehicle';
import EmpAssignedGeofenceScreen from '../EmployeeSide/EmpAssignedGeofence';
import EmpViolation from '../EmployeeSide/EmpViolation';
import EmpDashboardScreen from '../EmployeeSide/EmpDashboard';
const EmpStack = createNativeStackNavigator();

const EmpNavigator = () => {
  return(
    <EmpStack.Navigator initialRouteName="EmpDashboard" screenOptions={{headerShown:false}}>
        <EmpStack.Screen name="EmpDashboard" component={EmpDashboardScreen} />
        <EmpStack.Screen name="EmpAssignedVehicle" component={EmpAssignedVehicleScreen} />
        <EmpStack.Screen name="EmpAssignedGeofence" component={EmpAssignedGeofenceScreen} />
        <EmpStack.Screen name="EmpViolation" component={EmpViolation} />
    </EmpStack.Navigator>
  );
}

export default EmpNavigator;