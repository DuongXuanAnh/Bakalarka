import i18n from "../i18n";
import { HelperSetFunctions } from "./HelperSetFunctions";
import { ShowFunctions } from "./ShowFunctions";
import { AttributeFunctions } from "./AttributeFunctions";
import { FunctionalDependencyFunctions } from "./FunctionalDependencyFunctions";

const helperSetFunctionsInstance = new HelperSetFunctions();
const showFunctionsInstance = new ShowFunctions();
const attributeFunctionsInstance = new AttributeFunctions();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();

export class FindingKeysFunctions {
  constructor() {
    this.findFirstKey = this.findFirstKey.bind(this);
    this.findFirstKeyWithExplain = this.findFirstKeyWithExplain.bind(this);
    this.getAllKeys = this.getAllKeys.bind(this);
    this.getAllKeysWithExplain = this.getAllKeysWithExplain.bind(this);
  }

  findFirstKey(F, schema) {
    let candidateKey = [...schema];

    for (let attr of schema) {
      if (candidateKey.length === 1) {
        break;
      }
      // Vytvoříme potenciální klíč bez aktuálního atributu
      const potentialKey = candidateKey.filter((item) => item !== attr);

      // Vypočítáme uzávěr potenciálního klíče
      const closure = attributeFunctionsInstance.attributeClosure(
        F,
        potentialKey
      );

      if (helperSetFunctionsInstance.subset(schema, closure)) {
        candidateKey = potentialKey;
      }
    }

    return candidateKey;
  }

  findFirstKeyWithExplain(F, schema) {
    let candidateKey = [...schema];
    let explainMessages = []; // Pole pro ukládání vysvětlujících zpráv

    explainMessages.push(i18n.t("firstKey.introduction"));
    for (let attr of schema) {
      explainMessages.push(
        i18n.t("firstKey.initialKeyToSchema", {
          candidateKey: candidateKey.join(", "),
          schema: schema.join(", "),
        })
      );
      if (candidateKey.length === 1) {
        break;
      }
      explainMessages.push(
        i18n.t("firstKey.tryToRemoveAttribute", { attr: attr })
      );

      // Vytvoříme potenciální klíč bez aktuálního atributu
      const potentialKey = candidateKey.filter((item) => item !== attr);

      // Vypočítáme uzávěr potenciálního klíče
      const closure = attributeFunctionsInstance.attributeClosure(
        F,
        potentialKey
      );

      explainMessages.push(i18n.t("firstKey.lookAtAttributeClosure"));
      explainMessages.push(
        i18n.t("firstKey.attributeClosureResult", {
          potentialKey: potentialKey.join(","),
          closure: closure.join(","),
        })
      );

      if (helperSetFunctionsInstance.subset(schema, closure)) {
        explainMessages.push(
          i18n.t("firstKey.attributeRedundant", { attr: attr })
        );
        candidateKey = potentialKey;
      } else {
        explainMessages.push(
          i18n.t("firstKey.attributeNotRedundant", { attr: attr })
        );
      }
    }

    explainMessages.push(
      i18n.t("firstKey.finalFirstKey", { candidateKey: candidateKey.join(",") })
    );

    // Uložíme pole zpráv do localStorage
    localStorage.setItem(
      "algorithmFindFirstKey",
      JSON.stringify(explainMessages)
    );
    return candidateKey;
  }

  getAllKeys(FDs, A) {
    const initialRewrittenFDs =
      functionalDependencyFunctionsInstance.rewriteFDSingleRHS(FDs);

    const nonTrivial_FDs =
      functionalDependencyFunctionsInstance.mergeSingleRHSFDs(
        functionalDependencyFunctionsInstance.removeTrivialFDs(
          initialRewrittenFDs
        )
      );

    const leftAttributes = nonTrivial_FDs.map((dep) => dep.left);
    const rightAttributes = nonTrivial_FDs.map((dep) => dep.right);

    let Q = [];
    let N = this.findFirstKey(FDs, A);

    let Keys = [N];
    Q.push(N);

    while (Q.length > 0) {
      let K = Q.shift();
      for (let i = 0; i < nonTrivial_FDs.length; i++) {
        let X = leftAttributes[i];
        let Y = rightAttributes[i];

        if (
          helperSetFunctionsInstance.intersection(Y, K).length > 0 &&
          !helperSetFunctionsInstance.subset(X, K)
        ) {
          let newPossibleKey = helperSetFunctionsInstance.difference(
            K.concat(X).filter(helperSetFunctionsInstance.onlyUnique),
            Y
          );
          let newKey =
            functionalDependencyFunctionsInstance.getReducedAttributes(
              FDs,
              newPossibleKey,
              A
            );
          if (
            !Keys.some(
              (key) =>
                helperSetFunctionsInstance.subset(newKey, key) &&
                helperSetFunctionsInstance.subset(key, newKey)
            )
          ) {
            Keys.push(newKey);
            Q.push(newKey);
          }
        }
      }
    }
    return Keys;
  }

  getAllKeysWithExplain(FDs, A, firstKey = null) {
    const initialRewrittenFDs =
      functionalDependencyFunctionsInstance.rewriteFDSingleRHS(FDs);

    const nonTrivial_FDs =
      functionalDependencyFunctionsInstance.mergeSingleRHSFDs(
        functionalDependencyFunctionsInstance.removeTrivialFDs(
          initialRewrittenFDs
        )
      );

    const leftAttributes = nonTrivial_FDs.map((dep) => dep.left);
    const rightAttributes = nonTrivial_FDs.map((dep) => dep.right);

    let Q = [];

    let N;
    if (firstKey === null) {
      N = this.findFirstKey(FDs, A);
    } else {
      N = firstKey;
    }

    let Keys = [N];

    let explainMessages = [];

    explainMessages.push(i18n.t("allKeys.removeTrivialAttributes"));
    explainMessages.push(
      i18n.t("allKeys.removeTrivialAttributesResult", {
        dependencies: `{ ${showFunctionsInstance.dependenciesArrayToText(
          nonTrivial_FDs
        )} }`,
      })
    );
    explainMessages.push(i18n.t("allKeys.findFirstKeyTitle"));
    explainMessages.push(
      i18n.t("allKeys.firstKey", {
        N: showFunctionsInstance.showArrayWithBrackets(N),
      })
    );
    explainMessages.push(
      i18n.t("allKeys.initializeKeysArray", {
        N: showFunctionsInstance.showArrayWithBrackets(N),
      })
    );
    explainMessages.push(
      i18n.t("allKeys.keysArray", {
        Keys: showFunctionsInstance.showArrayWithBrackets(Keys),
      })
    );
    Q.push(N);
    explainMessages.push(
      i18n.t("allKeys.initializeQueue", {
        N: showFunctionsInstance.showArrayWithBrackets(N),
      })
    );
    explainMessages.push(
      i18n.t("allKeys.queueContent", {
        Q: showFunctionsInstance.showKeysAsText(Q),
      })
    );

    let foundLegitDependency = false;

    while (Q.length > 0) {
      let K = Q.shift();
      foundLegitDependency = false;

      explainMessages.push(
        i18n.t("allKeys.checkDependencies", {
          key: showFunctionsInstance.showArrayWithBrackets(K),
          keysQueue: showFunctionsInstance.showKeysAsText(Q),
        })
      );

      for (let i = 0; i < nonTrivial_FDs.length; i++) {
        let X = leftAttributes[i];
        let Y = rightAttributes[i];

        if (
          helperSetFunctionsInstance.intersection(Y, K).length > 0 &&
          !helperSetFunctionsInstance.subset(X, K)
        ) {
          foundLegitDependency = true;
          explainMessages.push(
            i18n.t("allKeys.dependencyOffer", {
              dependency: showFunctionsInstance.showTextDependencyWithArrow(
                nonTrivial_FDs[i]
              ),
            })
          );
          explainMessages.push(
            i18n.t("allKeys.reasonForNewKey", {
              K: showFunctionsInstance.showArrayWithBrackets(K),
              Y: showFunctionsInstance.showArrayWithBrackets(Y),
              X: showFunctionsInstance.showArrayWithBrackets(X),
              K2: showFunctionsInstance.showArrayWithBrackets(K),
            })
          );
          let newPossibleKey = helperSetFunctionsInstance.difference(
            K.concat(X).filter(helperSetFunctionsInstance.onlyUnique),
            Y
          );

          explainMessages.push(
            i18n.t("allKeys.potentialNewKey", {
              newPossibleKey:
                showFunctionsInstance.showArrayWithBrackets(newPossibleKey),
              K: showFunctionsInstance.showArrayWithBrackets(K),
              Y: showFunctionsInstance.showArrayWithBrackets(Y),
              X: showFunctionsInstance.showArrayWithBrackets(X),
            })
          );
          let newKey =
            functionalDependencyFunctionsInstance.getReducedAttributes(
              FDs,
              newPossibleKey,
              A
            );

          explainMessages.push(
            i18n.t("allKeys.potentialNewKeyWhenDependency", {
              newPossibleKey:
                showFunctionsInstance.showArrayWithBrackets(newPossibleKey),
              newPossibleKey2: newPossibleKey.join(","),
              A: A.join(","),
            })
          );

          explainMessages.push(
            i18n.t("allKeys.reducePotentialKey", {
              newPossibleKey:
                showFunctionsInstance.showArrayWithBrackets(newPossibleKey),
            })
          );
          explainMessages.push(
            i18n.t("allKeys.finalNewKey", {
              newKey: showFunctionsInstance.showArrayWithBrackets(newKey),
            })
          );
          explainMessages.push(
            i18n.t("allKeys.keyAlreadyExists", {
              newKey: showFunctionsInstance.showArrayWithBrackets(newKey),
            })
          );

          if (
            !Keys.some(
              (key) =>
                helperSetFunctionsInstance.subset(newKey, key) &&
                helperSetFunctionsInstance.subset(key, newKey)
            )
          ) {
            Keys.push(newKey);
            Q.push(newKey);

            explainMessages.push(
              i18n.t("allKeys.addNewKeyToArray", {
                newKey: showFunctionsInstance.showArrayWithBrackets(newKey),
                Keys: showFunctionsInstance.showKeysAsText(Keys),
              })
            );

            explainMessages.push(
              i18n.t("allKeys.addNewKeyToQueue", {
                newKey: showFunctionsInstance.showArrayWithBrackets(newKey),
                Q: showFunctionsInstance.showKeysAsText(Q),
              })
            );
          } else {
            explainMessages.push(
              i18n.t("allKeys.keyAlreadyInArray", {
                newKey: showFunctionsInstance.showArrayWithBrackets(newKey),
              })
            );
          }
        }
      }
    }

    if (!foundLegitDependency) {
      explainMessages.push(i18n.t("allKeys.notFoundLegitDependency"));
    } else {
      explainMessages.push(i18n.t("allKeys.keysQueueEmpty"));
    }

    explainMessages.push(
      i18n.t("allKeys.finalAllKeys", {
        Keys: showFunctionsInstance.showKeysAsText(Keys),
      })
    );
    localStorage.setItem(
      "algorithmFindAllKey",
      JSON.stringify(explainMessages)
    );

    return Keys;
  }
}
