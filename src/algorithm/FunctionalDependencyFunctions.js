import { HelperSetFunctions } from "./HelperSetFunctions";
import { AttributeFunctions } from "./AttributeFunctions";

const helperSetFunctionsInstance = new HelperSetFunctions();
const attributeFunctionsInstance = new AttributeFunctions();

export class FunctionalDependencyFunctions {
  constructor() {
    // FD algorithm
    this.isDependencyInClosure = this.isDependencyInClosure.bind(this);
    this.lostDependencies = this.lostDependencies.bind(this);
    this.getReducedAttributes = this.getReducedAttributes.bind(this);
    this.rewriteFDSingleRHS = this.rewriteFDSingleRHS.bind(this);
    this.removeTrivialFDs = this.removeTrivialFDs.bind(this);
    this.minimizeLHS = this.minimizeLHS.bind(this);
    this.removeDependency = this.removeDependency.bind(this);
    this.removeRedundantFDs = this.removeRedundantFDs.bind(this);
    this.mergeSingleRHSFDs = this.mergeSingleRHSFDs.bind(this);
    this.mergeDependenciesWithTheSameLHS =
      this.mergeDependenciesWithTheSameLHS.bind(this);
    this.isAttributeRedundant = this.isAttributeRedundant.bind(this);
  }

  // Algorithm to determine if an attribute is redundant or not.
  isAttributeRedundant(FDs, X, Y, a) {
    const newX = X.filter((attr) => attr !== a); // X – {a}
    return this.isDependencyInClosure(FDs, newX, Y);
  }

  // Algorithm to determine if the right-hand side is a subset of X+
  isDependencyInClosure(F, X, Y) {
    return helperSetFunctionsInstance.subset(
      Y,
      attributeFunctionsInstance.attributeClosure(F, X)
    );
  }

  // Find and return dependencies from originalFDs
  // that cannot be derived from newFDs   
  lostDependencies(
    originalFDs, // set of original FDs, supposedly in canonical form
    newFDs // some dependencies in originalFDs can be underivable from these FDs
    ) {
    let lostFDs = [];
    
      originalFDs.map((fd, index) => {
        // MKOP 2025/09/24 works even for non-canonical FDs fd.left->fd.right
        if (!this.isDependencyInClosure(
               newFDs,
               fd.left,
               fd.right
               )) {
          lostFDs.push(fd);
        }
      });
    return lostFDs; 
  }
  
  getReducedAttributes(FDs, X, Y) {
    let XPrime = [...X]; // X’ := X;
    for (let a of X) {
      if (this.isAttributeRedundant(FDs, XPrime, Y, a)) {
        XPrime = XPrime.filter((attr) => attr !== a); // X’ := X’ – {a};
      }
    }
    return XPrime;
  }

  // Split functional dependencies so that each dependency on the right-hand side (RHS) has only one attribute
  rewriteFDSingleRHS(FDs) {
    let result = [];
    const leftAttributes = FDs.map((dep) => dep.left);
    const rightAttributes = FDs.map((dep) => dep.right);

    for (let i = 0; i < leftAttributes.length; i++) {
      let left = leftAttributes[i];
      for (let j = 0; j < rightAttributes[i].length; j++) {
        let right = rightAttributes[i][j];
        result.push({ left: left, right: [right] });
      }
    }

    return result;
  }

  // Remove trivial FDs (those where the RHS is also in the LHS).
  removeTrivialFDs(fds) {
    return fds.filter(
      (fd) => !helperSetFunctionsInstance.subset(fd.right, fd.left)
    );
  }

  // Minimize the left-hand side, including removal of trivial FDs
  minimizeLHS(FDs) {
    let minimizedFDs = [];

    for (let fd of FDs) {
      let currentLHS = [...fd.left];
      let currentRHS = fd.right;

      if (!helperSetFunctionsInstance.subset(currentRHS, currentLHS)) {
        let j = 0;
        while (j < currentLHS.length) {
          let tempLHS = [...currentLHS];
          tempLHS.splice(j, 1);

          let closure = attributeFunctionsInstance.attributeClosure(
            FDs,
            tempLHS
          );

          if (helperSetFunctionsInstance.subset(currentRHS, closure)) {
            currentLHS = tempLHS; // The removed attribute is redundant
          } else {
            j++;
          }
        }
      }

      minimizedFDs.push({ left: currentLHS, right: currentRHS });
    }

    return minimizedFDs;
  }

  removeDependency(FDs, currentLHS, currentRHS) {
    const leftAttributes = FDs.map((dep) => dep.left);
    const rightAttributes = FDs.map((dep) => dep.right);

    // Find the index of the FD to be removed based on its LHS and RHS.
    const index = leftAttributes.findIndex(
      (attr, idx) =>
        JSON.stringify(attr) === JSON.stringify(currentLHS) &&
        rightAttributes[idx] === currentRHS
    );

    // If FD is not found, return the original arrays without modification.
    if (index === -1) return [leftAttributes, rightAttributes];

    // Remove the FD from both left and right attributes arrays.
    leftAttributes.splice(index, 1);
    rightAttributes.splice(index, 1);

    return [leftAttributes, rightAttributes];
  }

  removeRedundantFDs(fds) {
    // Step 1: Remove duplicates
    const uniqueFDs = Array.from(
      new Set(fds.map((fd) => JSON.stringify(fd)))
    ).map(JSON.parse);

    // Step 2: Filter out redundant FDs
    let index = 0;
    while (index < uniqueFDs.length) {
      const fd = uniqueFDs[index];
      const lhs = fd.left;
      const rhs = fd.right;

      // Step 2.1: Create a temporary list of FDs without the current FD
      const tempFDs = [
        ...uniqueFDs.slice(0, index),
        ...uniqueFDs.slice(index + 1),
      ];

      // Step 2.2: Compute the attribute closure of the LHS
      const closure = attributeFunctionsInstance.attributeClosure(tempFDs, lhs);

      // Step 2.3: Check if RHS is a subset of the closure
      const isRedundant = helperSetFunctionsInstance.subset(rhs, closure);

      // Step 2.4: If redundant, remove from the list
      if (isRedundant) {
        uniqueFDs.splice(index, 1); // Remove the redundant FD
      } else {
        index++; // Move to the next FD
      }
    }

    // Step 3: Return the final result
    return uniqueFDs;
  }

  mergeSingleRHSFDs(FDs) {
    let mergedFDs = [];
    for (let fd of FDs) {
      let currentLHS = fd.left;
      let currentRHS = fd.right;
      let found = false;
      for (let mergedFD of mergedFDs) {
        if (JSON.stringify(mergedFD.left) === JSON.stringify(currentLHS)) {
          mergedFD.right.push(currentRHS[0]);
          found = true;
          break;
        }
      }
      if (!found) {
        mergedFDs.push({ left: currentLHS, right: [currentRHS[0]] });
      }
    }
    return mergedFDs;
  }

  mergeDependenciesWithTheSameLHS(FDs) {
    const merged = {};

    // Iterace přes všechny funkční závislosti
    FDs.forEach((fd) => {
      const leftKey = fd.left.join(","); // Převod levé strany na string pro použití jako klíč
      const rightSet = new Set(fd.right); // Převod pravé strany na Set pro unikátnost

      if (merged[leftKey]) {
        // Pokud již klíč existuje, sjednotíme pravé strany
        fd.right.forEach((attr) => merged[leftKey].add(attr));
      } else {
        // Jinak vytvoříme nový záznam s pravou stranou jako Set
        merged[leftKey] = rightSet;
      }
    });

    // Převod výsledku zpět na požadovaný formát
    return Object.entries(merged).map(([left, rightSet]) => ({
      left: left.split(","), // Rozdělení klíče zpět na pole
      right: Array.from(rightSet), // Převod Setu zpět na pole
    }));
  }
  
  // MKOP 2025/10/08 moved from Decomposition.jsx
  // fPlus is a set of (canonical, but works universally) FDs
  // function returns a subset that can be applied on given set of attributes
  getAllDependenciesDependsOnAttr = (attr, fPlus) => {
    let dependenciesDependsOnAttr = [];
    for (let i = 0; i < fPlus.length; i++) {
      // Zkontrolujeme, že všechny prvky na levé i pravé straně jsou obsaženy v `attr`
      let leftSideValid = fPlus[i].left.every((element) =>
        attr.includes(element)
      );
      let rightSideValid = fPlus[i].right.every((element) =>
        attr.includes(element)
      );

      if (leftSideValid && rightSideValid) {
        dependenciesDependsOnAttr.push(fPlus[i]);
      }
    }

    return dependenciesDependsOnAttr;
  };
  
}
