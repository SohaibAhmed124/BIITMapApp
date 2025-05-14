import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import EmployeeProfileScreen from '../EmployeeSide/EmpProfile';
import EmpAssignedVehicleScreen from '../EmployeeSide/EmpAssignedVehicle';
import EmpAssignedGeofenceScreen from '../EmployeeSide/EmpAssignedGeofence';
import EmpDashboardScreen from '../EmployeeSide/EmpDashboard';

const EmployeeDrawer = createDrawerNavigator();

const EmpNavigator = () => {
  return(
    <EmployeeDrawer.Navigator initialRouteName="Dashboard" screenOptions={{headerShown:false}}>
        <EmployeeDrawer.Screen name="Dashboard" component={EmpDashboardScreen} />
        <EmployeeDrawer.Screen name="EmpAssignedVehicle" component={EmpAssignedVehicleScreen} />
        <EmployeeDrawer.Screen name="EmployeeProfile" component={EmployeeProfileScreen} />
    </EmployeeDrawer.Navigator>
  );
}

export default EmpNavigator;