import React, { createContext, useState, useContext } from "react";

const AttributeContext = createContext();

export const useAttributeContext = () => {
  return useContext(AttributeContext);
};

export const AttributeProvider = ({ children }) => {
  const loadInitialAttributes = () => {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }

    try {
      const storedValue = window.localStorage.getItem("prefillAttributes");
      if (!storedValue) {
        return [];
      }

      const parsedValue = JSON.parse(storedValue);
      if (Array.isArray(parsedValue)) {
        window.localStorage.removeItem("prefillAttributes");
        return parsedValue;
      }
    } catch (error) {
      console.error("Failed to load prefill attributes", error);
      window.localStorage.removeItem("prefillAttributes");
    }

    return [];
  };

  const [attributes, setAttributes] = useState(loadInitialAttributes);

  return (
    <AttributeContext.Provider value={{ attributes, setAttributes }}>
      {children}
    </AttributeContext.Provider>
  );
};
