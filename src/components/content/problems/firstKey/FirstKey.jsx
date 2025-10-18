import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAttributeContext } from "../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./firstKey.scss";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { FindingKeysFunctions } from "../../../../algorithm/FindingKeysFunctions";
import { AttributeFunctions } from "../../../../algorithm/AttributeFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";

const findingKeysFunctionsInstance = new FindingKeysFunctions();
const attributeFunctionsInstance = new AttributeFunctions();
const showFunctionsInstance = new ShowFunctions();

function FirstKey() {
  const { t, i18n } = useTranslation();

  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const stepsContainerRef = useRef(null);

  const { attributes, setAttributes } = useAttributeContext();
  const { dependencies } = useDependencyContext();
  const candidateKey = findingKeysFunctionsInstance.findFirstKeyWithExplain(
    dependencies,
    attributes
  );

  const endRef = useRef(null);
  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [currentStepIndex, showSteps]);

  let showPracticeButton = false;

  useEffect(() => {
    // Posluchač, který se spustí pokaždé, když se změní jazyk
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
    };

    // Přidání posluchače na událost změny jazyka
    i18n.on("languageChanged", handleLanguageChange);

    // Cleanup funkce pro odstranění posluchače
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]); // Závislost na instance i18n zajistí, že posluchač se přidá jen jednou

  useEffect(() => {
    // Při prvním načtení nebo změně závislostí/schema načíst kroky
    const storedSteps = JSON.parse(
      localStorage.getItem("algorithmFindFirstKey") || "[]"
    );
    setSteps(storedSteps);
  }, [dependencies, attributes, currentLanguage]);

  const handleShowStepByStep = () => {
    if (!showSteps) {
      setShowSteps(true);
      setCurrentStepIndex(0); // Začneme od prvního kroku, pokud ještě nebyly kroky zobrazeny
    } else {
      setCurrentStepIndex((prevIndex) =>
        Math.min(prevIndex + 1, steps.length - 1)
      );
    }
  };

  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const newAttributes = Array.from(attributes);
      const [reorderedItem] = newAttributes.splice(result.source.index, 1);
      newAttributes.splice(result.destination.index, 0, reorderedItem);

      setAttributes(newAttributes);

      // Resetuje kroky po změně pořadí
      setShowSteps(false);
      setSteps([]);
      setCurrentStepIndex(0);
    },
    [attributes, setAttributes]
  );

  const handleShowAllSteps = () => {
    setShowSteps(true);
    setCurrentStepIndex(steps.length - 1); // Nastavíme index na poslední krok, čímž zobrazíme všechny kroky
  };

  const stepDetectPracticeAble = (step) => {
    showPracticeButton = false;

    if (step.endsWith("#^_^#")) {
      showPracticeButton = true;
      return step.replace("#^_^#", "");
    }

    return step;
  };

  const compareAnswers = (str1, str2) => {
    // Převod stringů na pole, odstranění bílých znaků a seřazení
    const arr1 = str1
      .split(",")
      .map((s) => s.trim())
      .sort();
    const arr2 = str2
      .split(",")
      .map((s) => s.trim())
      .sort();

    // Převod zpět na stringy a porovnání
    return arr1.join(",") === arr2.join(",");
  };

  const showPracticeModal = () => {
    const stepContain = steps[currentStepIndex + 1];

    const token = stepContain.split(" = ");
    const closureAssignment = token[0];
    const answer = token[1];
    const promptUser = (errorMessage = "") => {
      Swal.fire({
        title: t("problem-firstKey.closurePromptTitle", {
          closureAssignment: closureAssignment,
        }),
        input: "text",
        inputPlaceholder: t("problem-firstKey.closurePromptPlaceholder", {
          closureAssignment: closureAssignment,
        }),
        html: errorMessage ? `<p style="color: red;">${errorMessage}</p>` : "",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          if (compareAnswers(result.value, answer)) {
            Swal.fire(
              t("problem-firstKey.successAlertTitle"),
              t("problem-firstKey.successAlertText"),
              "success"
            );
            // Přejít na další krok, pokud je odpověď správná
            setCurrentStepIndex(currentStepIndex + 1);
          } else {
            promptUser(t("problem-firstKey.errorAlertText"));
          }
        }
      });
    };

    promptUser();
  };

  const mixRandomAttributes = () => {
    localStorage.removeItem("algorithmFindFirstKey");
    setShowSteps(false);
    setCurrentStepIndex(0);
    setAttributes(attributeFunctionsInstance.mixRandomlyAttributes(attributes));
  };

  const reverseAttributes = () => {
    localStorage.removeItem("algorithmFindFirstKey");
    setShowSteps(false);
    setCurrentStepIndex(0);
    const newAttributes = Array.from(attributes).reverse();
    setAttributes(newAttributes);
  };

  return (
    <div className="first-key-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="attributes" direction="horizontal">
          {(provided) => (
            <div
              className="attributesContainer"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <h3>{t("problem-firstKey.attributesListTitle")}</h3>
              <div className="reverseMix_btn">
                <button onClick={reverseAttributes} className="reverse_btn">
                  {t("global.reverseAttributes")}
                </button>
                <button onClick={mixRandomAttributes} className="mixRandom_btn">
                  {t("global.mixDependenciesRandomly")}
                </button>
              </div>

              <ul>
                {attributes.map((attribute, index) => (
                  <Draggable
                    key={attribute}
                    draggableId={attribute}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`attrInList ${
                          snapshot.isDragging ? "dragging" : ""
                        }`}
                      >
                        {attribute}
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <h3 className="allKeysDisplay">
        {t("problem-firstKey.firstKeyTitle")}
        {`{ ${showFunctionsInstance.attributesArrayToText(candidateKey)} }`}
      </h3>
      {showSteps && (
        <div ref={stepsContainerRef} className="steps-container">
          {steps.slice(0, currentStepIndex + 1).map((step, index) => (
            <p className="step" key={index}>
              {stepDetectPracticeAble(step)}
            </p>
          ))}
        </div>
      )}
      <div>
        {currentStepIndex < steps.length - 1 && (
          <button className="btn_ExplainResult" onClick={handleShowStepByStep}>
            {showSteps
              ? t("problem-firstKey.nextStepButton")
              : t("problem-firstKey.showStepByStepButton")}
          </button>
        )}

        {showPracticeButton && (
          <button className="btn_PracticeButton" onClick={showPracticeModal}>
            {t("problem-firstKey.practiceNextStepButton")}
          </button>
        )}

        {currentStepIndex !== steps.length - 1 && (
          <button className="btn_ExplainResult" onClick={handleShowAllSteps}>
            {t("problem-firstKey.showAllStepsButton")}
          </button>
        )}
      </div>

      <div ref={endRef} />
    </div>
  );
}

export default FirstKey;
