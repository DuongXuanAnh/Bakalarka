import { FunctionalDependencyFunctions } from "./FunctionalDependencyFunctions";
import { FindingKeysFunctions } from "./FindingKeysFunctions";
import { HelperSetFunctions } from "./HelperSetFunctions";

const helperSetFunctionsInstance = new HelperSetFunctions();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();
const findingKeysFunctionsInstance = new FindingKeysFunctions();
export class NormalFormALG {
  constructor() {
    this.isSuperKey = this.isSuperKey.bind(this);
    this.isPartOfKey = this.isPartOfKey.bind(this);
    this.isTrivialFD = this.isTrivialFD.bind(this);
    this.areAllAttributesPrime = this.areAllAttributesPrime.bind(this);
    this.check_2NF = this.check_2NF.bind(this);
    this.check_3NF = this.check_3NF.bind(this);
    this.check_BCNF = this.check_BCNF.bind(this);
    this.normalFormType = this.normalFormType.bind(this);
    this.moreWayHowToSplitNode = this.moreWayHowToSplitNode.bind(this);

    // this.check_3NF_transitivity = this.check_3NF_transitivity.bind(this);
  }

  check_2NF(FDs, A) {
    let faultyDependencies = [];

    const FDwithSingleRHS =
      functionalDependencyFunctionsInstance.rewriteFDSingleRHS(FDs);
    const NonTrivialFDs =
      functionalDependencyFunctionsInstance.removeTrivialFDs(FDwithSingleRHS);
    const candidateKeys = findingKeysFunctionsInstance.getAllKeys(
      NonTrivialFDs,
      A
    );

    for (let FD of NonTrivialFDs) {
      const leftSide = FD.left;
      const rightSide = FD.right;

      if (!this.isPartOfKey(candidateKeys, rightSide)) {
        let isKeyASubsetOfLeftSide = false;

        for (const key of candidateKeys) {
          if (
            helperSetFunctionsInstance.subset(leftSide, key) &&
            !helperSetFunctionsInstance.subset(key, leftSide)
          ) {
            isKeyASubsetOfLeftSide = true;
            break;
          }
        }

        if (isKeyASubsetOfLeftSide) {
          faultyDependencies.push({ left: leftSide, right: rightSide });
        }
      }
    }

    return {
      faultyDependencies: faultyDependencies,
      result: faultyDependencies.length === 0,
    };
  }

  isTrivialFD(FD) {
    return helperSetFunctionsInstance.subset(FD.right, FD.left);
  }

  areAllAttributesPrime(candidateKeys, rightSide) {
    return rightSide.every((attr) => this.isPartOfKey(candidateKeys, attr));
  }

  check_3NF(FDs, A) {
    let faultyDependencies = [];

    const FDwithSingleRHS =
      functionalDependencyFunctionsInstance.rewriteFDSingleRHS(FDs);
    const NonTrivialFDs =
      functionalDependencyFunctionsInstance.removeTrivialFDs(FDwithSingleRHS);
    const candidateKeys = findingKeysFunctionsInstance.getAllKeys(
      NonTrivialFDs,
      A
    );

    for (let FD of NonTrivialFDs) {
      if (
        this.isTrivialFD(FD) ||
        this.isSuperKey(candidateKeys, FD.left) ||
        this.isPartOfKey(candidateKeys, FD.right)
      ) {
      } else {
        faultyDependencies.push({ left: FD.left, right: FD.right });
      }
    }

    return {
      faultyDependencies: faultyDependencies,
      result: faultyDependencies.length === 0,
    };
  }

  // check_3NF_transitivity(FDs, attributes) {
  //     if (!this.check_2NF(FDs, attributes)) {
  //         return false; // If it's not in 2NF, it can't be in 3NF.
  //     }

  //     const candidateKeys = algoInstance.getAllKeys(FDs, attributes).keys;

  //     for (let i = 0; i < FDs.length; i++) {
  //         const X = FDs[i].left;
  //         const Y = FDs[i].right;

  //         // Check for transitive dependency X -> Y -> Z
  //         for (let j = 0; j < FDs.length; j++) {
  //             if (i === j) continue; // Skip the same functional dependency
  //             const Y_prime = FDs[j].left;
  //             const Z = FDs[j].right;

  //             // Check if Y -> Z
  //             if (algoInstance.equals(Y, Y_prime) && !this.isSuperKey(candidateKeys, X)) {
  //                 // Check if Z is not a prime attribute, which means X -> Z is a transitive dependency
  //                 if (!Z.every(attr => this.isPartOfKey(candidateKeys, attr))) {
  //                     console.log(X + "->" + Z + " is a transitive dependency.");
  //                     return false;
  //                 }
  //             }
  //         }
  //     }
  //     return true;
  // }

  check_BCNF(FDs, A) {
    let faultyDependencies = [];
    const FDwithSingleRHS =
      functionalDependencyFunctionsInstance.rewriteFDSingleRHS(FDs);
    const NonTrivialFDs =
      functionalDependencyFunctionsInstance.removeTrivialFDs(FDwithSingleRHS);
    const candidateKeys = findingKeysFunctionsInstance.getAllKeys(
      NonTrivialFDs,
      A
    );

    for (let FD of NonTrivialFDs) {
      if (this.isTrivialFD(FD) || this.isSuperKey(candidateKeys, FD.left)) {
      } else {
        faultyDependencies.push({ left: FD.left, right: FD.right });
      }
    }

    return {
      faultyDependencies: faultyDependencies,
      result: faultyDependencies.length === 0,
    };
  }

  normalFormType(FDs, A) {
    let faultyDependencies = [];
    let type = "BCNF";

    const FDwithSingleRHS =
      functionalDependencyFunctionsInstance.rewriteFDSingleRHS(FDs);
    const NonTrivialFDs =
      functionalDependencyFunctionsInstance.removeTrivialFDs(FDwithSingleRHS);
    const candidateKeys = findingKeysFunctionsInstance.getAllKeys(
      NonTrivialFDs,
      A
    );

    for (let FD of NonTrivialFDs) {
      const leftSide = FD.left;
      const rightSide = FD.right;
      if (!this.isPartOfKey(candidateKeys, rightSide)) {
        let isKeyASubsetOfLeftSide = false;

        for (const key of candidateKeys) {
          if (
            helperSetFunctionsInstance.subset(leftSide, key) &&
            !helperSetFunctionsInstance.subset(key, leftSide)
          ) {
            isKeyASubsetOfLeftSide = true;
            break;
          }
        }

        if (isKeyASubsetOfLeftSide) {
          faultyDependencies.push({ dependency: FD, violates: "2NF" });
          type = "1";
          continue;
        }
      }

      if (
        !(
          this.isTrivialFD(FD) ||
          this.isSuperKey(candidateKeys, FD.left) ||
          this.isPartOfKey(candidateKeys, FD.right)
        )
      ) {
        faultyDependencies.push({ dependency: FD, violates: "3NF" });
        type = type === "3" || type === "BCNF" ? "2" : type;
        continue;
      }

      if (!(this.isTrivialFD(FD) || this.isSuperKey(candidateKeys, FD.left))) {
        faultyDependencies.push({ dependency: FD, violates: "BCNF" });
        type = type === "BCNF" ? "3" : type;
        continue;
      }
    }

    return {
      type: type,
      faultyDependencies: faultyDependencies,
    };
  }

  isSuperKey(keys, attribute) {
    for (let key of keys) {
      if (helperSetFunctionsInstance.subset(key, attribute)) {
        return true;
      }
    }
    return false;
  }

  isPartOfKey(keys, attribute) {
    for (let a of attribute) {
      let temp = false;
      for (let key of keys) {
        if (key.includes(a)) {
          temp = true;
        }
      }
      if (!temp) {
        return false;
      }
    }
    return true;
  }

  // Dekomponovat dle LS → LS+ \ LS
  moreWayHowToSplitNode(nodeInfo) {
    let result = [];

    let mergedFDs = functionalDependencyFunctionsInstance.mergeSingleRHSFDs(
      nodeInfo.FDs
    );

    for (let fd of mergedFDs) {
      const leffLength = fd.left.length;
      const rightLength = fd.right.length;

      if (
        rightLength > 1 &&
        rightLength < nodeInfo.originalAttr.length - 1 &&
        leffLength + rightLength < nodeInfo.originalAttr.length
      ) {
        result.push(fd);
      }
    }

    return result;
  }
}
