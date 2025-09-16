
export const normalFormColor = {
    "1NF" : "#f44336",
    "2NF" : "#ff9800",
    "3NF" : "#2c8f30",
    "BCNF" : "#b0feB0",
    "practice" : "#ffffff"
};

export const applicationSkins = {
    "CurrentSkin" : "Default", // MKOP 2025/09/16 temporary key used in HelperColorFunctions.js
    
    "Default" : {
      "Background":             "#3f3b6a",      // purple
      "NavbarColor":            "#f2f2f2",      // very light gray  
      "NavbarBackground":       "#575757",      // dark gray  
      "NavbarHoverColor":       "black",        // black  
      "NavbarHoverBackground":  "#dddddd",      // light gray #ddd  
      "NavbarActiveColor":      "white",        // white #ffffff
      "NavbarActiveBackground": "=>Background", // purple -> Background
      "ReactFlowVariant":       "dots",         // Background pattern: dots/lines/cross 
      "ReactFlowColor":         "white",        // Background pattern color
      "ReactFlowGap":           14,             // Background pattern gaps
      },
      
    "Grayscale" : {
      "Background":             "white",        // blue 
      "NavbarColor":            "white",
      "NavbarBackground":       "#a0a0a0",  
      "NavbarHoverColor":       "black",  
      "NavbarHoverBackground":  "#c0c0c0",
      "NavbarActiveColor":      "white",
      "NavbarActiveBackground": "#808080",
      "ReactFlowVariant":       "dots",         // Background pattern: dots/lines/cross 
      "ReactFlowColor":         "=>Background", // Background pattern color
      "ReactFlowGap":           0,              // Background pattern gaps
      },
      
    "Test" : {
      "Background":             "#8080ff",      // blue 
      "NavbarColor":            "#f0f0ff",      // very light blue  
      "NavbarBackground":       "#4040ff",      // dark blue  
      "NavbarHoverColor":       "#000080",      // very dark blue  
      "NavbarHoverBackground":  "#aaaaff",      // dark blue  
      "NavbarActiveColor":      "#ffff00",      // yellow
      "NavbarActiveBackground": "=>Background", // blue -> Background
      "ReactFlowVariant":       "dots",         // Background pattern: dots/lines/cross 
      "ReactFlowColor":         "=>Background", // Background pattern color
      "ReactFlowGap":           0,              // Background pattern gaps
      },
};

export const password = process.env.REACT_APP_ADMIN_PASSWORD;

export const colectionName = process.env.REACT_APP_COLECTION_NAME; // Name of the collection in the FireStore database

export const configInfo =  {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID
}

