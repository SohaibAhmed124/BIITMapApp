// context/EmployeeContext.js
import React, { createContext, useContext, useState } from 'react';

// Create Context
const EmployeeContext = createContext();

// Create a provider component
export const EmployeeProvider = ({ children }) => {
  const [employeeId, setEmployeeId] = useState(null);

  return (
    <EmployeeContext.Provider value={{ employeeId, setEmployeeId }}>
      {children}
    </EmployeeContext.Provider>
  );
};

// Custom hook to use the context
export const useEmployeeContext = () => {
  return useContext(EmployeeContext);
};
