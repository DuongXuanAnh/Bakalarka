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
    const leftAttributes = FDs.map((dep) => dep.left);
    const rightAttributes = FDs.map((dep) => dep.right);

    let closureX = [...attributesPlus]; // Using spread to ensure we're working with a copy
    let previousClosure;
    do {
      previousClosure = [...closureX];
      for (let i = 0; i < leftAttributes.length; i++) {
        if (
          helperSetFunctionsInstance.subset(leftAttributes[i], closureX) &&
          !helperSetFunctionsInstance.subset(rightAttributes[i], closureX)
        ) {
          closureX = [...new Set(closureX.concat(rightAttributes[i]))]; // Ensuring uniqueness using Set
        }
      }
    } while (previousClosure.length !== closureX.length); // keep looping until no new attributes are added

    return closureX;
  }

  attributeClosureWithExplain(FDs, A, attributesPlus) {
    const leftAttributes = FDs.map((dep) => dep.left);
    const rightAttributes = FDs.map((dep) => dep.right);

    let closureX = [...attributesPlus]; // Using spread to ensure we're working with a copy
    let previousClosure;
    let explainMessages = []; // Pole pro uchování vysvětlujících zpráv

    explainMessages.push(
      i18n.t("attributeClosure.startWithAttributes", {
        attributes: attributesPlus.join(","),
      })
    );

    explainMessages.push(i18n.t("attributeClosure.aimToFindClosure"));

    do {
      previousClosure = [...closureX];

      explainMessages.push(
        i18n.t("attributeClosure.currentClosure", {
          closure: closureX.join(","),
        })
      );

      for (let i = 0; i < FDs.length; i++) {
        explainMessages.push(
          i18n.t("attributeClosure.examiningDependency", {
            dependency: showFunctionsInstance.showTextDependencyWithArrow(
              FDs[i]
            ),
          })
        );

        if (
          helperSetFunctionsInstance.subset(leftAttributes[i], closureX) &&
          !helperSetFunctionsInstance.subset(rightAttributes[i], closureX)
        ) {
          explainMessages.push(i18n.t("attributeClosure.addingToClosure"));
          closureX = [...new Set(closureX.concat(rightAttributes[i]))]; // Ensuring uniqueness using Set

          if (closureX.length === A.length) {
            explainMessages.push(i18n.t("attributeClosure.allAttrInClosure"));
            explainMessages.push(
              i18n.t("attributeClosure.finalClosure", {
                closure: closureX.join(","),
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
              closure: closureX.join(","),
            })
          );
        } else {
          explainMessages.push(i18n.t("attributeClosure.noExtension"));
        }
      }
    } while (previousClosure.length !== closureX.length); // keep looping until no new attributes are added

    explainMessages.push(
      i18n.t("attributeClosure.finalClosure", { closure: closureX.join(",") })
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
