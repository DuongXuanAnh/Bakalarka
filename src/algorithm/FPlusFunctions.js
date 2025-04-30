import { HelperSetFunctions } from "./HelperSetFunctions";
import { AttributeFunctions } from "./AttributeFunctions";
import { FunctionalDependencyFunctions } from "./FunctionalDependencyFunctions";

const helperSetFunctionsInstance = new HelperSetFunctions();
const attributeFunctionsInstance = new AttributeFunctions();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();

export class FPlusFunctions {
  constructor() {
    this.FPlus = this.FPlus.bind(this);
  }

  FPlus(FDs, attributes) {
    // Pomocná funkce pro zjištění, zda dvě pole jsou ekvivalentní (obsahují stejné prvky, nezávisle na pořadí)
    function arraysEquivalent(arr1, arr2) {
      if (arr1.length !== arr2.length) return false;
      let sortedArr1 = [...arr1].sort();
      let sortedArr2 = [...arr2].sort();
      for (let i = 0; i < sortedArr1.length; i++) {
        if (sortedArr1[i] !== sortedArr2[i]) return false;
      }
      return true;
    }
    const powerSet = helperSetFunctionsInstance.powerSet(attributes);
    let closure = [];
    let fPlus = [];
    for (let i = 0; i < powerSet.length; i++) {
      closure = attributeFunctionsInstance
        .nonTrivialClosure(FDs, powerSet[i])
        .filter((element) => attributes.includes(element));

      if (closure.length !== 0) {
        if (!arraysEquivalent(powerSet[i], closure)) {
          // Zbavime se trivialnich prikladu

          let key = functionalDependencyFunctionsInstance.getReducedAttributes(
            FDs,
            powerSet[i],
            closure
          );
          let value = helperSetFunctionsInstance.difference(closure, key);

          // Kontrola, zda v `fPlus` již existuje objekt s daným `key`
          if (
            !fPlus.some((e) => arraysEquivalent(e.left, key)) &&
            key !== "" &&
            value !== ""
          ) {
            fPlus.push({ left: key, right: value });
          }
        }
      }
    }
    return fPlus;
  }
}
