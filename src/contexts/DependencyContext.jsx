import React, { createContext, useState, useContext } from 'react';

const DependencyContext = createContext();

export const useDependencyContext = () => {
  return useContext(DependencyContext);
};

export const DependencyProvider = ({ children }) => {
  const [dependencies, setDependencies] = useState([]);

  return (
    <DependencyContext.Provider value={{ dependencies, setDependencies }}>
      {children}
    </DependencyContext.Provider>
  );
};
