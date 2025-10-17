import i18n from "../i18n";
import { HelperSetFunctions } from "./HelperSetFunctions";
import { ShowFunctions } from "./ShowFunctions";

const helperSetFunctionsInstance = new HelperSetFunctions();
const showFunctionsInstance = new ShowFunctions();

export class AttributeFunctions {
  constructor() {
    // Attribute algorithm
    this.mixRandomlyAttributes = this.mixRandomlyAttributes.bind(this);
    this.attributeClosure = this.attributeClosure.bind(this);
    this.attributeClosureWithExplain =
      this.attributeClosureWithExplain.bind(this);
    this.nonTrivialClosure = this.nonTrivialClosure.bind(this);
  }

  mixRandomlyAttributes(attributes) {
    const newAttributes = Array.from(attributes);
    for (let i = newAttributes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newAttributes[i], newAttributes[j]] = [
        newAttributes[j],
        newAttributes[i],
      ];
    }
    return newAttributes;
  }

  attributeClosure(FDs, attributesPlus) {
  //const leftAttributes = FDs.map((dep) => dep.left);
  //const rightAttributes = FDs.map((dep) => dep.right);

    let dependencies = [...FDs]; // Using spread to ensure we're working with a copy
    let closureX = [...attributesPlus]; // Using spread to ensure we're working with a copy
    let previousClosure;
    do {
      previousClosure = [...closureX];
      for (let i = 0; i < dependencies.length; i++) {
        if (
          helperSetFunctionsInstance.subset(dependencies[i].left, closureX) &&
          !helperSetFunctionsInstance.subset(dependencies[i].right, closureX)
        ) {
          closureX = [...new Set(closureX.concat(dependencies[i].right))]; // Ensuring uniqueness using Set
        }
      }
    } while (previousClosure.length !== closureX.length); // keep looping until no new attributes are added

    return closureX;
  }

  attributeClosureWithExplain(FDs, A, attributesPlus) {
  //const leftAttributes = FDs.map((dep) => dep.left);
  //const rightAttributes = FDs.map((dep) => dep.right);

    let dependencies = [...FDs]; // Using spread to ensure we're working with a copy
    let closureX = [...attributesPlus]; // Using spread to ensure we're working with a copy
    let previousClosure;
    let explainMessages = []; // Pole pro uchování vysvětlujících zpráv

    explainMessages.push(
      i18n.t("attributeClosure.startWithAttributes", {
        attributes: showFunctionsInstance.attributesArrayToText(attributesPlus),
      })
    );

    explainMessages.push(i18n.t("attributeClosure.aimToFindClosure"));

    do {
      previousClosure = [...closureX];

      explainMessages.push(
        i18n.t("attributeClosure.currentClosure", {
          closure: showFunctionsInstance.attributesArrayToText(closureX),
        })
      );

      for (let i = 0; i < dependencies.length; i++) {
        explainMessages.push(
          i18n.t("attributeClosure.examiningDependency", {
            dependency: showFunctionsInstance.showTextDependencyWithArrow(
              dependencies[i]
            ),
          })
        );

        if (
          helperSetFunctionsInstance.subset(dependencies[i].left, closureX) &&
          !helperSetFunctionsInstance.subset(dependencies[i].right, closureX)
        ) {
          explainMessages.push(i18n.t("attributeClosure.addingToClosure"));
          closureX = [...new Set(closureX.concat(dependencies[i].right))]; // Ensuring uniqueness using Set

          if (closureX.length === A.length) {
            explainMessages.push(i18n.t("attributeClosure.allAttrInClosure"));
            explainMessages.push(
              i18n.t("attributeClosure.finalClosure", {
                closure: showFunctionsInstance.attributesArrayToText(closureX),
              })
            );

            localStorage.setItem(
              "algorithmExplainAttrClosure",
              JSON.stringify(explainMessages)
            );
            return closureX;
          }

          explainMessages.push(
            i18n.t("attributeClosure.newClosure", {
              closure: showFunctionsInstance.attributesArrayToText(closureX),
            })
          );
        } else {
          explainMessages.push(i18n.t("attributeClosure.noExtension"));
        }
      }
    } while (previousClosure.length !== closureX.length); // keep looping until no new attributes are added

    explainMessages.push(
      i18n.t("attributeClosure.finalClosure", { closure: showFunctionsInstance.attributesArrayToText(closureX) })
    );

    // Nakonec uložíme pole zpráv do localStorage
    localStorage.setItem(
      "algorithmExplainAttrClosure",
      JSON.stringify(explainMessages)
    );
    return closureX;
  }

  nonTrivialClosure(FDs, attributes) {
    // získáme pouze atributy, které nejsou triviálně odvozeny
    let closure = this.attributeClosure(FDs, attributes);

    let nonTrivialClosure = closure.filter(
      (attr) => !attributes.includes(attr)
    );

    return nonTrivialClosure;
  }
}
