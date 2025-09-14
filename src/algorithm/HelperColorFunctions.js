// MKOP Coloring the application
// 2025/09/14 function nodeBackgroundColor

import { normalFormColor } from "../constantValues/constantValues";

export class HelperColorFunctions {
  constructor() {
    // Helper color functions
    this.nodeBackgroundColor = this.nodeBackgroundColor.bind(this);
  }

  // Assign background color according to NF of the relation 
  nodeBackgroundColor(type, practiceMode = false) {
    if (practiceMode) {
      return normalFormColor.practice; // White color when in practice mode
    }

    if (type === "BCNF") {
      return normalFormColor.BCNF;     // Light green for BCNF
    } else if (type === "3") {
      return normalFormColor["3NF"];   // Dark green for 3NF
    } else if (type === "2") {
      return normalFormColor["2NF"];   // Orange for 2NF
    } else if (type === "1") {
      return normalFormColor["1NF"];   // Red for 1NF
    }
  }
  
}
