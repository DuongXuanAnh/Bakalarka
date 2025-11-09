import React, { createContext, useState, useContext } from "react";

const DependencyContext = createContext();

export const useDependencyContext = () => {
  return useContext(DependencyContext);
};

export const DependencyProvider = ({ children }) => {
  const loadInitialDependencies = () => {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }

    try {
      const storedValue = window.localStorage.getItem("prefillDependencies");
      if (!storedValue) {
        return [];
      }

      const parsedValue = JSON.parse(storedValue);
      if (Array.isArray(parsedValue)) {
        window.localStorage.removeItem("prefillDependencies");
        return parsedValue;
      }
    } catch (error) {
      console.error("Failed to load prefill dependencies", error);
      window.localStorage.removeItem("prefillDependencies");
    }

    return [];
  };

  const [dependencies, setDependencies] = useState(loadInitialDependencies);

  return (
    <DependencyContext.Provider value={{ dependencies, setDependencies }}>
      {children}
    </DependencyContext.Provider>
  );
};
