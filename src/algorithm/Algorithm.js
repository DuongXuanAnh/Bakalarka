// import i18n from "../i18n";

// export class Algorithm {
//   constructor() {
//     // Helper set functions
//     this.subset = this.subset.bind(this);
//     this.onlyUnique = this.onlyUnique.bind(this);
//     this.intersection = this.intersection.bind(this);
//     this.difference = this.difference.bind(this);
//     this.intersectionOfArrays = this.intersectionOfArrays.bind(this);
//     this.existsInArray = this.existsInArray.bind(this);
//     this.powerSet = this.powerSet.bind(this);

//     // FD algorithm
//     this.isDependencyInClosure = this.isDependencyInClosure.bind(this);
//     this.getReducedAttributes = this.getReducedAttributes.bind(this);
//     this.rewriteFDSingleRHS = this.rewriteFDSingleRHS.bind(this);
//     this.removeTrivialFDs = this.removeTrivialFDs.bind(this);
//     this.minimizeLHS = this.minimizeLHS.bind(this);
//     this.removeDependency = this.removeDependency.bind(this);
//     this.removeRedundantFDs = this.removeRedundantFDs.bind(this);
//     this.mergeSingleRHSFDs = this.mergeSingleRHSFDs.bind(this);
//     this.mergeDependenciesWithTheSameLHS =
//       this.mergeDependenciesWithTheSameLHS.bind(this);
//     this.isAttributeRedundant = this.isAttributeRedundant.bind(this);

//     // Attribute closure algorithm
//     this.mixRandomlyAttributes = this.mixRandomlyAttributes.bind(this);
//     this.attributeClosure = this.attributeClosure.bind(this);
//     this.attributeClosureWithExplain =
//       this.attributeClosureWithExplain.bind(this);
//     this.nonTrivialClosure = this.nonTrivialClosure.bind(this);

//     // Minimal cover algorithm
//     this.minimalCover = this.minimalCover.bind(this);

//     // First key algorithm
//     this.findFirstKey = this.findFirstKey.bind(this);
//     this.findFirstKeyWithExplain = this.findFirstKeyWithExplain.bind(this);
//     this.getAllKeys = this.getAllKeys.bind(this);
//     this.getAllKeysWithExplain = this.getAllKeysWithExplain.bind(this);

//     // this.printClosurePowerSet = this.printClosurePowerSet.bind(this);

//     // F+ algorithm
//     this.FPlus = this.FPlus.bind(this);

//     // Show algorithms
//     this.showKeysAsText = this.showKeysAsText.bind(this);
//     this.showArrayWithBrackets = this.showArrayWithBrackets.bind(this);
//     this.showTextDependencyWithArrow =
//       this.showTextDependencyWithArrow.bind(this);
//     this.dependenciesArrayToText = this.dependenciesArrayToText.bind(this);
//   }

//   // A is a subset of B -> true
//   subset(setA, setB) {
//     if (!Array.isArray(setA)) {
//       setA = [setA];
//     }
//     if (!Array.isArray(setB)) {
//       setB = [setB];
//     }
//     return setA.every((val) => setB.includes(val));
//   }

//   // Removes duplicates in a set
//   onlyUnique(value, index, self) {
//     return self.indexOf(value) === index;
//   }

//   intersection(arr1, arr2) {
//     return arr1.filter((value) => arr2.includes(value));
//   }

//   // Typicky odecitani mnozin arr1 - arr2
//   difference(arr1, arr2) {
//     let difference = arr1.filter((x) => !arr2.includes(x));
//     return difference;
//   }

//   intersectionOfArrays(arr1, arr2) {
//     // Pomocná funkce pro převod podpole na seřazený string
//     const sortedArrayToString = (subArr) => JSON.stringify(subArr.sort());

//     // Převedení každého podpole prvního pole na seřazený string a uchování ve množině
//     const set1 = new Set(arr1.map(sortedArrayToString));

//     // Filtrace druhého pole: zahrnutí pouze těch podpolí, které se nachází v množině set1
//     return arr2.filter((subArr) => set1.has(sortedArrayToString(subArr)));
//   }

//   // Algorithm to determine if the right-hand side is a subset of X+
//   isDependencyInClosure(F, X, Y) {
//     return this.subset(Y, this.attributeClosure(F, X));
//   }

//   // Algorithm to determine if an attribute is redundant or not.
//   isAttributeRedundant(FDs, X, Y, a) {
//     const newX = X.filter((attr) => attr !== a); // X – {a}
//     return this.isDependencyInClosure(FDs, newX, Y);
//   }

//   getReducedAttributes(FDs, X, Y) {
//     let XPrime = [...X]; // X’ := X;
//     for (let a of X) {
//       if (this.isAttributeRedundant(FDs, XPrime, Y, a)) {
//         XPrime = XPrime.filter((attr) => attr !== a); // X’ := X’ – {a};
//       }
//     }
//     return XPrime;
//   }

//   // Split functional dependencies so that each dependency on the right-hand side (RHS) has only one attribute
//   rewriteFDSingleRHS(FDs) {
//     let result = [];
//     const leftAttributes = FDs.map((dep) => dep.left);
//     const rightAttributes = FDs.map((dep) => dep.right);

//     for (let i = 0; i < leftAttributes.length; i++) {
//       let left = leftAttributes[i];
//       for (let j = 0; j < rightAttributes[i].length; j++) {
//         let right = rightAttributes[i][j];
//         result.push({ left: left, right: [right] });
//       }
//     }

//     return result;
//   }

//   // Remove trivial FDs (those where the RHS is also in the LHS).
//   removeTrivialFDs(fds) {
//     return fds.filter((fd) => !this.subset(fd.right, fd.left));
//   }

//   attributeClosure(FDs, attributesPlus) {
//     const leftAttributes = FDs.map((dep) => dep.left);
//     const rightAttributes = FDs.map((dep) => dep.right);

//     let closureX = [...attributesPlus]; // Using spread to ensure we're working with a copy
//     let previousClosure;
//     do {
//       previousClosure = [...closureX];
//       for (let i = 0; i < leftAttributes.length; i++) {
//         if (
//           this.subset(leftAttributes[i], closureX) &&
//           !this.subset(rightAttributes[i], closureX)
//         ) {
//           closureX = [...new Set(closureX.concat(rightAttributes[i]))]; // Ensuring uniqueness using Set
//         }
//       }
//     } while (previousClosure.length !== closureX.length); // keep looping until no new attributes are added

//     return closureX;
//   }

//   attributeClosureWithExplain(FDs, A, attributesPlus) {
//     const leftAttributes = FDs.map((dep) => dep.left);
//     const rightAttributes = FDs.map((dep) => dep.right);

//     let closureX = [...attributesPlus]; // Using spread to ensure we're working with a copy
//     let previousClosure;
//     let explainMessages = []; // Pole pro uchování vysvětlujících zpráv

//     explainMessages.push(
//       i18n.t("attributeClosure.startWithAttributes", {
//         attributes: attributesPlus.join(","),
//       })
//     );

//     explainMessages.push(i18n.t("attributeClosure.aimToFindClosure"));

//     do {
//       previousClosure = [...closureX];

//       explainMessages.push(
//         i18n.t("attributeClosure.currentClosure", {
//           closure: closureX.join(","),
//         })
//       );

//       for (let i = 0; i < FDs.length; i++) {
//         explainMessages.push(
//           i18n.t("attributeClosure.examiningDependency", {
//             dependency: this.showTextDependencyWithArrow(FDs[i]),
//           })
//         );

//         if (
//           this.subset(leftAttributes[i], closureX) &&
//           !this.subset(rightAttributes[i], closureX)
//         ) {
//           explainMessages.push(i18n.t("attributeClosure.addingToClosure"));
//           closureX = [...new Set(closureX.concat(rightAttributes[i]))]; // Ensuring uniqueness using Set

//           if (closureX.length === A.length) {
//             explainMessages.push(i18n.t("attributeClosure.allAttrInClosure"));
//             explainMessages.push(
//               i18n.t("attributeClosure.finalClosure", {
//                 closure: closureX.join(","),
//               })
//             );

//             localStorage.setItem(
//               "algorithmExplainAttrClosure",
//               JSON.stringify(explainMessages)
//             );
//             return closureX;
//           }

//           explainMessages.push(
//             i18n.t("attributeClosure.newClosure", {
//               closure: closureX.join(","),
//             })
//           );
//         } else {
//           explainMessages.push(i18n.t("attributeClosure.noExtension"));
//         }
//       }
//     } while (previousClosure.length !== closureX.length); // keep looping until no new attributes are added

//     explainMessages.push(
//       i18n.t("attributeClosure.finalClosure", { closure: closureX.join(",") })
//     );

//     // Nakonec uložíme pole zpráv do localStorage
//     localStorage.setItem(
//       "algorithmExplainAttrClosure",
//       JSON.stringify(explainMessages)
//     );
//     return closureX;
//   }

//   nonTrivialClosure(FDs, attributes) {
//     // získáme pouze atributy, které nejsou triviálně odvozeny
//     let closure = this.attributeClosure(FDs, attributes);

//     let nonTrivialClosure = closure.filter(
//       (attr) => !attributes.includes(attr)
//     );

//     return nonTrivialClosure;
//   }

//   mergeSingleRHSFDs(FDs) {
//     let mergedFDs = [];
//     for (let fd of FDs) {
//       let currentLHS = fd.left;
//       let currentRHS = fd.right;
//       let found = false;
//       for (let mergedFD of mergedFDs) {
//         if (JSON.stringify(mergedFD.left) === JSON.stringify(currentLHS)) {
//           mergedFD.right.push(currentRHS[0]);
//           found = true;
//           break;
//         }
//       }
//       if (!found) {
//         mergedFDs.push({ left: currentLHS, right: [currentRHS[0]] });
//       }
//     }
//     return mergedFDs;
//   }

//   mergeDependenciesWithTheSameLHS(FDs) {
//     const merged = {};

//     // Iterace přes všechny funkční závislosti
//     FDs.forEach((fd) => {
//       const leftKey = fd.left.join(","); // Převod levé strany na string pro použití jako klíč
//       const rightSet = new Set(fd.right); // Převod pravé strany na Set pro unikátnost

//       if (merged[leftKey]) {
//         // Pokud již klíč existuje, sjednotíme pravé strany
//         fd.right.forEach((attr) => merged[leftKey].add(attr));
//       } else {
//         // Jinak vytvoříme nový záznam s pravou stranou jako Set
//         merged[leftKey] = rightSet;
//       }
//     });

//     // Převod výsledku zpět na požadovaný formát
//     return Object.entries(merged).map(([left, rightSet]) => ({
//       left: left.split(","), // Rozdělení klíče zpět na pole
//       right: Array.from(rightSet), // Převod Setu zpět na pole
//     }));
//   }

//   // Minimize the left-hand side, including removal of trivial FDs
//   minimizeLHS(FDs) {
//     let minimizedFDs = [];

//     for (let fd of FDs) {
//       let currentLHS = fd.left;
//       let currentRHS = fd.right;

//       // Check for trivial dependency before minimization
//       if (!this.subset(currentRHS, currentLHS)) {
//         // Only attempt to minimize if not a trivial FD

//         for (let j = 0; j < currentLHS.length; j++) {
//           // Temporarily remove the attribute
//           let tempLHS = [...currentLHS];
//           tempLHS.splice(j, 1);

//           // Compute the closure of the temporary LHS
//           let closure = this.attributeClosure(FDs, tempLHS);

//           // Check if the closure still contains the RHS
//           if (this.subset(currentRHS, closure)) {
//             currentLHS = tempLHS; // The removed attribute is redundant
//           }
//         }
//       }

//       minimizedFDs.push({ left: currentLHS, right: currentRHS });
//     }

//     return minimizedFDs;
//   }

//   removeDependency(FDs, currentLHS, currentRHS) {
//     const leftAttributes = FDs.map((dep) => dep.left);
//     const rightAttributes = FDs.map((dep) => dep.right);

//     // Find the index of the FD to be removed based on its LHS and RHS.
//     const index = leftAttributes.findIndex(
//       (attr, idx) =>
//         JSON.stringify(attr) === JSON.stringify(currentLHS) &&
//         rightAttributes[idx] === currentRHS
//     );

//     // If FD is not found, return the original arrays without modification.
//     if (index === -1) return [leftAttributes, rightAttributes];

//     // Remove the FD from both left and right attributes arrays.
//     leftAttributes.splice(index, 1);
//     rightAttributes.splice(index, 1);

//     return [leftAttributes, rightAttributes];
//   }

//   removeRedundantFDs(fds) {
//     // Step 1: Remove duplicates
//     const uniqueFDs = Array.from(
//       new Set(fds.map((fd) => JSON.stringify(fd)))
//     ).map(JSON.parse);

//     // Step 2: Filter out redundant FDs
//     let index = 0;
//     while (index < uniqueFDs.length) {
//       const fd = uniqueFDs[index];
//       const lhs = fd.left;
//       const rhs = fd.right;

//       // Step 2.1: Create a temporary list of FDs without the current FD
//       const tempFDs = [
//         ...uniqueFDs.slice(0, index),
//         ...uniqueFDs.slice(index + 1),
//       ];

//       // Step 2.2: Compute the attribute closure of the LHS
//       const closure = this.attributeClosure(tempFDs, lhs);

//       // Step 2.3: Check if RHS is a subset of the closure
//       const isRedundant = this.subset(rhs, closure);

//       // Step 2.4: If redundant, remove from the list
//       if (isRedundant) {
//         uniqueFDs.splice(index, 1); // Remove the redundant FD
//       } else {
//         index++; // Move to the next FD
//       }
//     }

//     // Step 3: Return the final result
//     return uniqueFDs;
//   }

//   existsInArray(array, searchedObject) {
//     return array.some((obj) => {
//       return Object.keys(searchedObject).every(
//         (key) =>
//           Array.isArray(obj[key]) &&
//           Array.isArray(searchedObject[key]) &&
//           obj[key].length === searchedObject[key].length &&
//           obj[key].every((val, index) => val === searchedObject[key][index])
//       );
//     });
//   }

//   minimalCover(FDs) {
//     const initialRewrittenFDs = this.rewriteFDSingleRHS(FDs);
//     const nonTrivial_FDs = this.removeTrivialFDs(initialRewrittenFDs);
//     const minimizeLHS_FDs = this.minimizeLHS(nonTrivial_FDs);
//     return this.removeRedundantFDs(minimizeLHS_FDs);
//   }

//   findFirstKey(F, schema) {
//     let candidateKey = [...schema];

//     for (let attr of schema) {
//       if (candidateKey.length === 1) {
//         break;
//       }
//       // Vytvoříme potenciální klíč bez aktuálního atributu
//       const potentialKey = candidateKey.filter((item) => item !== attr);

//       // Vypočítáme uzávěr potenciálního klíče
//       const closure = this.attributeClosure(F, potentialKey);

//       if (this.subset(schema, closure)) {
//         candidateKey = potentialKey;
//       }
//     }

//     return candidateKey;
//   }

//   findFirstKeyWithExplain(F, schema) {
//     let candidateKey = [...schema];
//     let explainMessages = []; // Pole pro ukládání vysvětlujících zpráv

//     explainMessages.push(i18n.t("firstKey.introduction"));
//     for (let attr of schema) {
//       explainMessages.push(
//         i18n.t("firstKey.initialKeyToSchema", {
//           candidateKey: candidateKey.join(", "),
//           schema: schema.join(", "),
//         })
//       );
//       if (candidateKey.length === 1) {
//         break;
//       }
//       explainMessages.push(
//         i18n.t("firstKey.tryToRemoveAttribute", { attr: attr })
//       );

//       // Vytvoříme potenciální klíč bez aktuálního atributu
//       const potentialKey = candidateKey.filter((item) => item !== attr);

//       // Vypočítáme uzávěr potenciálního klíče
//       const closure = this.attributeClosure(F, potentialKey);

//       explainMessages.push(i18n.t("firstKey.lookAtAttributeClosure"));
//       explainMessages.push(
//         i18n.t("firstKey.attributeClosureResult", {
//           potentialKey: potentialKey.join(","),
//           closure: closure.join(","),
//         })
//       );

//       if (this.subset(schema, closure)) {
//         explainMessages.push(
//           i18n.t("firstKey.attributeRedundant", { attr: attr })
//         );
//         candidateKey = potentialKey;
//       } else {
//         explainMessages.push(
//           i18n.t("firstKey.attributeNotRedundant", { attr: attr })
//         );
//       }
//     }

//     explainMessages.push(
//       i18n.t("firstKey.finalFirstKey", { candidateKey: candidateKey.join(",") })
//     );

//     // Uložíme pole zpráv do localStorage
//     localStorage.setItem(
//       "algorithmFindFirstKey",
//       JSON.stringify(explainMessages)
//     );
//     return candidateKey;
//   }

//   getAllKeys(FDs, A) {
//     const initialRewrittenFDs = this.rewriteFDSingleRHS(FDs);

//     const nonTrivial_FDs = this.mergeSingleRHSFDs(
//       this.removeTrivialFDs(initialRewrittenFDs)
//     );

//     const leftAttributes = nonTrivial_FDs.map((dep) => dep.left);
//     const rightAttributes = nonTrivial_FDs.map((dep) => dep.right);

//     let Q = [];
//     let N = this.findFirstKey(FDs, A);

//     let Keys = [N];
//     Q.push(N);

//     while (Q.length > 0) {
//       let K = Q.shift();
//       for (let i = 0; i < nonTrivial_FDs.length; i++) {
//         let X = leftAttributes[i];
//         let Y = rightAttributes[i];

//         if (this.intersection(Y, K).length > 0 && !this.subset(X, K)) {
//           let newPossibleKey = this.difference(
//             K.concat(X).filter(this.onlyUnique),
//             Y
//           );
//           let newKey = this.getReducedAttributes(FDs, newPossibleKey, A);
//           if (
//             !Keys.some(
//               (key) => this.subset(newKey, key) && this.subset(key, newKey)
//             )
//           ) {
//             Keys.push(newKey);
//             Q.push(newKey);
//           }
//         }
//       }
//     }
//     return Keys;
//   }

//   getAllKeysWithExplain(FDs, A, firstKey = null) {
//     const initialRewrittenFDs = this.rewriteFDSingleRHS(FDs);

//     const nonTrivial_FDs = this.mergeSingleRHSFDs(
//       this.removeTrivialFDs(initialRewrittenFDs)
//     );

//     const leftAttributes = nonTrivial_FDs.map((dep) => dep.left);
//     const rightAttributes = nonTrivial_FDs.map((dep) => dep.right);

//     let Q = [];

//     let N;
//     if (firstKey === null) {
//       N = this.findFirstKey(FDs, A);
//     } else {
//       N = firstKey;
//     }

//     let Keys = [N];

//     let explainMessages = [];

//     explainMessages.push(i18n.t("allKeys.removeTrivialAttributes"));
//     explainMessages.push(
//       i18n.t("allKeys.removeTrivialAttributesResult", {
//         dependencies: `{ ${this.dependenciesArrayToText(nonTrivial_FDs)} }`,
//       })
//     );
//     explainMessages.push(i18n.t("allKeys.findFirstKeyTitle"));
//     explainMessages.push(
//       i18n.t("allKeys.firstKey", { N: this.showArrayWithBrackets(N) })
//     );
//     explainMessages.push(
//       i18n.t("allKeys.initializeKeysArray", {
//         N: this.showArrayWithBrackets(N),
//       })
//     );
//     explainMessages.push(
//       i18n.t("allKeys.keysArray", { Keys: this.showArrayWithBrackets(Keys) })
//     );
//     Q.push(N);
//     explainMessages.push(
//       i18n.t("allKeys.initializeQueue", { N: this.showArrayWithBrackets(N) })
//     );
//     explainMessages.push(
//       i18n.t("allKeys.queueContent", { Q: this.showKeysAsText(Q) })
//     );

//     let foundLegitDependency = false;

//     while (Q.length > 0) {
//       let K = Q.shift();
//       foundLegitDependency = false;

//       explainMessages.push(
//         i18n.t("allKeys.checkDependencies", {
//           key: this.showArrayWithBrackets(K),
//           keysQueue: this.showKeysAsText(Q),
//         })
//       );

//       for (let i = 0; i < nonTrivial_FDs.length; i++) {
//         let X = leftAttributes[i];
//         let Y = rightAttributes[i];

//         if (this.intersection(Y, K).length > 0 && !this.subset(X, K)) {
//           foundLegitDependency = true;
//           explainMessages.push(
//             i18n.t("allKeys.dependencyOffer", {
//               dependency: this.showTextDependencyWithArrow(nonTrivial_FDs[i]),
//             })
//           );
//           explainMessages.push(
//             i18n.t("allKeys.reasonForNewKey", {
//               K: this.showArrayWithBrackets(K),
//               Y: this.showArrayWithBrackets(Y),
//               X: this.showArrayWithBrackets(X),
//               K2: this.showArrayWithBrackets(K),
//             })
//           );
//           let newPossibleKey = this.difference(
//             K.concat(X).filter(this.onlyUnique),
//             Y
//           );

//           explainMessages.push(
//             i18n.t("allKeys.potentialNewKey", {
//               newPossibleKey: this.showArrayWithBrackets(newPossibleKey),
//               K: this.showArrayWithBrackets(K),
//               Y: this.showArrayWithBrackets(Y),
//               X: this.showArrayWithBrackets(X),
//             })
//           );
//           let newKey = this.getReducedAttributes(FDs, newPossibleKey, A);

//           explainMessages.push(
//             i18n.t("allKeys.potentialNewKeyWhenDependency", {
//               newPossibleKey: this.showArrayWithBrackets(newPossibleKey),
//               newPossibleKey2: newPossibleKey.join(","),
//               A: A.join(","),
//             })
//           );

//           explainMessages.push(
//             i18n.t("allKeys.reducePotentialKey", {
//               newPossibleKey: this.showArrayWithBrackets(newPossibleKey),
//             })
//           );
//           explainMessages.push(
//             i18n.t("allKeys.finalNewKey", {
//               newKey: this.showArrayWithBrackets(newKey),
//             })
//           );
//           explainMessages.push(
//             i18n.t("allKeys.keyAlreadyExists", {
//               newKey: this.showArrayWithBrackets(newKey),
//             })
//           );

//           if (
//             !Keys.some(
//               (key) => this.subset(newKey, key) && this.subset(key, newKey)
//             )
//           ) {
//             Keys.push(newKey);
//             Q.push(newKey);

//             explainMessages.push(
//               i18n.t("allKeys.addNewKeyToArray", {
//                 newKey: this.showArrayWithBrackets(newKey),
//                 Keys: this.showKeysAsText(Keys),
//               })
//             );

//             explainMessages.push(
//               i18n.t("allKeys.addNewKeyToQueue", {
//                 newKey: this.showArrayWithBrackets(newKey),
//                 Q: this.showKeysAsText(Q),
//               })
//             );
//           } else {
//             explainMessages.push(
//               i18n.t("allKeys.keyAlreadyInArray", {
//                 newKey: this.showArrayWithBrackets(newKey),
//               })
//             );
//           }
//         }
//       }
//     }

//     if (!foundLegitDependency) {
//       explainMessages.push(i18n.t("allKeys.notFoundLegitDependency"));
//     } else {
//       explainMessages.push(i18n.t("allKeys.keysQueueEmpty"));
//     }

//     explainMessages.push(
//       i18n.t("allKeys.finalAllKeys", { Keys: this.showKeysAsText(Keys) })
//     );
//     localStorage.setItem(
//       "algorithmFindAllKey",
//       JSON.stringify(explainMessages)
//     );

//     return Keys;
//   }

//   // množina všech podmnožin
//   powerSet(array) {
//     const result = [];
//     const f = function (prefix, array) {
//       for (let i = 0; i < array.length; i++) {
//         result.push(prefix.concat(array[i]));
//         f(prefix.concat(array[i]), array.slice(i + 1));
//       }
//     };
//     f([], array);

//     // Uspořádání výsledků podle počtu atributů v každé podmnožině
//     result.sort((a, b) => a.length - b.length);
//     return result;
//   }

//   // printClosurePowerSet(F, powerSet){
//   //     const leftAttributes = F.map(dep => dep.left);
//   //     const rightAttributes = F.map(dep => dep.right);

//   //     for(let i = 0; i < powerSet.length; i++){
//   //         console.log(`{${powerSet[i]}}+ = {${this.attributeClosure(leftAttributes, rightAttributes, powerSet[i])}}`);
//   //     }
//   // }

//   FPlus(FDs, attributes) {
//     // Pomocná funkce pro zjištění, zda dvě pole jsou ekvivalentní (obsahují stejné prvky, nezávisle na pořadí)
//     function arraysEquivalent(arr1, arr2) {
//       if (arr1.length !== arr2.length) return false;
//       let sortedArr1 = [...arr1].sort();
//       let sortedArr2 = [...arr2].sort();
//       for (let i = 0; i < sortedArr1.length; i++) {
//         if (sortedArr1[i] !== sortedArr2[i]) return false;
//       }
//       return true;
//     }
//     const powerSet = this.powerSet(attributes);
//     let closure = [];
//     let fPlus = [];
//     for (let i = 0; i < powerSet.length; i++) {
//       closure = this.nonTrivialClosure(FDs, powerSet[i]).filter((element) =>
//         attributes.includes(element)
//       );

//       if (closure.length !== 0) {
//         if (!arraysEquivalent(powerSet[i], closure)) {
//           // Zbavime se trivialnich prikladu

//           let key = this.getReducedAttributes(FDs, powerSet[i], closure);
//           let value = this.difference(closure, key);

//           // Kontrola, zda v `fPlus` již existuje objekt s daným `key`
//           if (
//             !fPlus.some((e) => arraysEquivalent(e.left, key)) &&
//             key !== "" &&
//             value !== ""
//           ) {
//             fPlus.push({ left: key, right: value });
//           }
//         }
//       }
//     }
//     return fPlus;
//   }

//   // findAllDependencies(FDs) {
//   //     // Získání minimálního pokrytí
//   //     let minimalCover = this.minimalCover(FDs);

//   //     // Přidání všech závislostí z minimálního pokrytí
//   //     let allDependencies = new Set([...minimalCover]);

//   //     // Odvození nových závislostí pomocí transitivního pravidla
//   //     for (let fd1 of minimalCover) {
//   //         for (let fd2 of minimalCover) {
//   //             if (fd1.right.includes(fd2.left)) {
//   //                 allDependencies.add({ left: fd1.left, right: fd2.right });
//   //             }
//   //         }
//   //     }
//   //     // Výpis všech závislostí
//   //     for (let fd of allDependencies) {
//   //         console.log(fd.left.join(",") + " → " + fd.right.join(","));
//   //     }
//   // }

//   showTextDependencyWithArrow(fd) {
//     return fd.left.join(",") + " → " + fd.right.join(",");
//   }

//   dependenciesArrayToText(fds) {
//     return fds
//       .map((dep, index) => {
//         // Determine if the current element is an object or array of arrays
//         const isObjectFormat =
//           dep.hasOwnProperty("left") && dep.hasOwnProperty("right");

//         // Extract LHS and RHS based on the format
//         const lhs = isObjectFormat ? dep.left : dep[0];
//         const rhs = isObjectFormat ? dep.right : dep[1];

//         // Format the dependency as text
//         const depText = `${lhs.join(",")} → ${rhs.join(",")}`;

//         // Append a semicolon if this isn't the last element, else nothing
//         const separator = index < fds.length - 1 ? " ; " : "";

//         return depText + separator;
//       })
//       .join("");
//   }

//   showKeysAsText(keys) {
//     return keys.map((key) => `{ ${key} }`).join(", ");
//   }

//   showArrayWithBrackets(array) {
//     return `{ ${array.join(",")} }`;
//   }

//   mixRandomlyAttributes(attributes) {
//     const newAttributes = Array.from(attributes);
//     for (let i = newAttributes.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [newAttributes[i], newAttributes[j]] = [
//         newAttributes[j],
//         newAttributes[i],
//       ];
//     }
//     return newAttributes;
//   }
// }
