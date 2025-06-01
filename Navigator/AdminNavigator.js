import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import AdminDashboard from '../AdminSide/AdminDashboard';

import AddEmployee from '../screens/AdminSide/EmployeeModule/AddEmployee';
import EmployeeDetail from '../screens/AdminSide/EmployeeModule/EmployeeDetail'
import UpdateEmployee from '../screens/AdminSide/EmployeeModule/UpdateEmployee';
import EmployeeList from '../screens/AdminSide/EmployeeModule/EmployeeList';

import VehicleDetail from '../screens/AdminSide/VehicleModule/VehicleDetail';
import VehicleList from '../screens/AdminSide/VehicleModule/VehicleList';
import AddVehicle from '../screens/AdminSide/VehicleModule/AddVehicle';
import UpdateVehicle from '../screens/AdminSide/VehicleModule/UpdateVehicle';

import AddBranch from '../screens/AdminSide/BranchModule/AddBranch';
import UpdateBranch from '../screens/AdminSide/BranchModule/UpdateBranch';
import BranchDetail from '../screens/AdminSide/BranchModule/BranchDetail';
import BranchList from '../screens/AdminSide/BranchModule/BranchList';

import CreateGeofence from '../screens/AdminSide/GeofenceModule/CreateGeofence';
import GeofenceList from '../screens/AdminSide/GeofenceModule/GeofenceList';
import GeofenceDetail from '../screens/AdminSide/GeofenceModule/GeofenceDetail';
import AllGeofences from '../screens/AdminSide/GeofenceModule/AllGeofence';


const Stack = createNativeStackNavigator();
const EmployeeStack = createNativeStackNavigator();
const BranchStack = createNativeStackNavigator();
const VehicleStack = createNativeStackNavigator();
const GeofenceStack = createNativeStackNavigator();



const EmployeeNavigator = () => {
  return(
    <EmployeeStack.Navigator initialRouteName='EmployeeList' screenOptions={{headerShown:false}}>
      <EmployeeStack.Screen name="EmployeeList" component={EmployeeList} />
      <EmployeeStack.Screen name="AddEmployee" component={AddEmployee}/>
      <EmployeeStack.Screen name="EmployeeDetail" component={EmployeeDetail}/>
      <EmployeeStack.Screen name="UpdateEmployee" component={UpdateEmployee}/>
    </EmployeeStack.Navigator>
  );
}

const BranchNavigator = () => {
  return(
    <BranchStack.Navigator initialRouteName='BranchList' screenOptions={{headerShown:false}}>
      <BranchStack.Screen name="BranchList" component={BranchList} />
      <BranchStack.Screen name="AddBranch" component={AddBranch}/>
      <BranchStack.Screen name="BranchDetail" component={BranchDetail}/>
      <BranchStack.Screen name="UpdateBranch" component={UpdateBranch}/>
    </BranchStack.Navigator>
  );
}

const VehicleNavigator = () => {
  return(
    <VehicleStack.Navigator initialRouteName='VehicleList' screenOptions={{headerShown:false}}>
      <VehicleStack.Screen name="VehicleList" component={VehicleList} />
      <VehicleStack.Screen name="AddVehicle" component={AddVehicle}/>
      <VehicleStack.Screen name="VehicleDetail" component={VehicleDetail}/>
      <VehicleStack.Screen name="UpdateVehicle" component={UpdateVehicle}/>
    </VehicleStack.Navigator>
  );
}

const GeofenceNavigator = () => {
  return(
    <GeofenceStack.Navigator initialRouteName='GeofenceList' screenOptions={{headerShown:false}}>
      <GeofenceStack.Screen name="CreateGeofence" component={CreateGeofence} />
      <GeofenceStack.Screen name="GeofenceList" component={GeofenceList}/>
      <GeofenceStack.Screen name="GeofenceDetail" component={GeofenceDetail}/>
      <GeofenceStack.Screen name="AllGeofences" component={AllGeofences}/>
    </GeofenceStack.Navigator>
  );
}





function AdminNavigator() {
  return (
    <Stack.Navigator initialRouteName='ManagerSide' screenOptions={{headerShown:false}}>
      <Stack.Screen name="AdminView" component={AdminDashboard}/>
      <Stack.Screen name="EmployeeModule" component={EmployeeNavigator} />
      <Stack.Screen name="BranchModule" component={BranchNavigator} />
      <Stack.Screen name="VehicleModule" component={VehicleNavigator} />
      <Stack.Screen name="GeofenceModule" component={GeofenceNavigator} />
    </Stack.Navigator>
  );
}


export default AdminNavigator;