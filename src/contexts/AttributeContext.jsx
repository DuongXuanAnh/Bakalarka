import React, { createContext, useState, useContext } from 'react';

const AttributeContext = createContext();

export const useAttributeContext = () => {
  return useContext(AttributeContext);
};

export const AttributeProvider = ({ children }) => {
  const [attributes, setAttributes] = useState([]);

  return (
    <AttributeContext.Provider value={{ attributes, setAttributes }}>
      {children}
    </AttributeContext.Provider>
  );
};
