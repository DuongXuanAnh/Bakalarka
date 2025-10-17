import React, { useState, useEffect, useRef } from "react";
import { useAttributeContext } from "../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import "./allKeys.scss";
import Swal from "sweetalert2";
import ReactModal from "react-modal";
import { useTranslation } from "react-i18next";
import { FPlusFunctions } from "../../../../algorithm/FPlusFunctions";
import { FunctionalDependencyFunctions } from "../../../../algorithm/FunctionalDependencyFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";
import { FindingKeysFunctions } from "../../../../algorithm/FindingKeysFunctions";

const fPlusFunctionsInstance = new FPlusFunctions();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();
const showFunctionsInstance = new ShowFunctions();
const findingKeysFunctionsInstance = new FindingKeysFunctions();

function AllKeys() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  const { attributes: contextAttributes } = useAttributeContext();
  const { dependencies: contextDependencies } = useDependencyContext();

  const storedState = JSON.parse(sessionStorage.getItem("normalFormState"));

  const initialAttributes =
    storedState && storedState.attributesArea
      ? storedState.attributesArea
      : contextAttributes;

  const [attributes] = useState(initialAttributes);

  const [simplifyFplus] = useState(
    fPlusFunctionsInstance.FPlus(contextDependencies, attributes)
  );

  const initialRewrittenFDs =
    functionalDependencyFunctionsInstance.rewriteFDSingleRHS(simplifyFplus);
  const nonTrivial_FDs =
    functionalDependencyFunctionsInstance.mergeSingleRHSFDs(
      functionalDependencyFunctionsInstance.removeTrivialFDs(
        initialRewrittenFDs
      )
    );

  const [allKeys, setAllKeys] = useState(
    findingKeysFunctionsInstance.getAllKeysWithExplain(
      simplifyFplus,
      attributes
    )
  );

  const [firstKey, setFirstKey] = useState(null);

  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const stepsContainerRef = useRef(null);

  const [checkedDependencies, setCheckedDependencies] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  let showPracticeButton = false;

  const endRef = useRef(null);
  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [currentStepIndex, showSteps]);

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
    const newAllKeys = findingKeysFunctionsInstance.getAllKeysWithExplain(
      simplifyFplus,
      attributes,
      firstKey
    );
    setAllKeys(newAllKeys);
    readNewLocalStorageSteps();
  }, [simplifyFplus, attributes, currentLanguage]);

  const handleCheckboxChange = (id, isChecked) => {
    setCheckedDependencies((currentCheckedIds) => {
      if (isChecked) {
        return [...currentCheckedIds, id];
      } else {
        return currentCheckedIds.filter((checkedId) => checkedId !== id);
      }
    });
  };

  const handleShowStepByStep = () => {
    if (!showSteps) {
      setShowSteps(true);
      setCurrentStepIndex(0); // Začneme od prvního kroku, pokud ještě nebyly kroky zobrazeny
    } else {
      setCurrentStepIndex((prevIndex) =>
        Math.min(prevIndex + 1, steps.length - 1)
      ); // Další krok
    }
  };

  const handleShowAllSteps = () => {
    setShowSteps(true);
    setCurrentStepIndex(steps.length - 1); // Nastavíme index na poslední krok, čímž zobrazíme všechny kroky
  };

  const stepDetectPracticeAble = (step) => {
    showPracticeButton = false;
    const pattern = "#^_^#";

    if (steps[currentStepIndex + 1]?.includes(pattern)) {
      showPracticeButton = true;
    }

    if (step?.includes(pattern)) {
      return step.split(pattern)[0];
    }

    return step;
  };

  const readNewLocalStorageSteps = () => {
    const storedSteps = JSON.parse(
      localStorage.getItem("algorithmFindAllKey") || "[]"
    );
    setSteps(storedSteps);
  };

  const choosenFirstKey = (userAnswer) => {
    const normalizedUserAnswer = userAnswer
      .toLowerCase()
      .replace(/\s+/g, "") // Remove all spaces
      .split(",")
      .sort()
      .join(",");

    const index = allKeys.findIndex((key) => {
      const normalizedKey = key
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "") // Remove all spaces
        .split(",")
        .sort()
        .join(",");
      return normalizedKey === normalizedUserAnswer;
    });

    return index;
  };

  const chooseFirstKeyModel = () => {
    const promptUser = (errorMessage = "") => {
      Swal.fire({
        title: t("problem-allKeys.firstKeyIs"),
        input: "text",
        inputPlaceholder: t("problem-allKeys.writeFirstKeyHere"),
        html: errorMessage ? `<p style="color: red;">${errorMessage}</p>` : "",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const chhoosenKeyIndex = choosenFirstKey(result.value);
          if (chhoosenKeyIndex !== -1) {
            Swal.fire(
              t("problem-allKeys.successAlertTitle"),
              t("problem-allKeys.successAlertText"),
              "success"
            );
            setFirstKey(allKeys[chhoosenKeyIndex]);
            const newAllKeys =
              findingKeysFunctionsInstance.getAllKeysWithExplain(
                simplifyFplus,
                attributes,
                allKeys[chhoosenKeyIndex]
              );
            readNewLocalStorageSteps();
            setAllKeys(newAllKeys);
            setCurrentStepIndex(currentStepIndex + 1);
          } else {
            promptUser(t("problem-allKeys.errorAlertText"));
          }
        }
      });
    };

    promptUser(); // První volání funkce bez chybové zprávy
  };

  const chooseNextDependency = () => {
    if (checkedDependencies.length > 1) {
      Swal.fire(
        t("problem-allKeys.errorAlertTitle"),
        t("problem-allKeys.canChooseOnlyOneDependency"),
        "error"
      );
      return;
    }
    if (checkedDependencies.length === 0) {
      if (steps[currentStepIndex + 1].includes("→")) {
        Swal.fire(
          t("problem-allKeys.errorAlertTitle"),
          t("problem-allKeys.errorAlertText"),
          "error"
        );
      } else {
        Swal.fire(
          t("problem-allKeys.successAlertTitle"),
          t("problem-allKeys.successAlertText"),
          "success"
        );
        setCurrentStepIndex(currentStepIndex + 1);
        setIsModalOpen(false);
        setCheckedDependencies([]);
      }
    } else {
      try {
        let nextStepContain = steps[currentStepIndex + 1].split("#^_^#")[0];

        const dependencyInNextStep = nextStepContain.split(":")[1].trim();

        const choosenDependency =
          showFunctionsInstance.showTextDependencyWithArrow(
            nonTrivial_FDs[checkedDependencies[0]]
          );

        if (choosenDependency === dependencyInNextStep) {
          Swal.fire(
            t("problem-allKeys.successAlertTitle"),
            t("problem-allKeys.successAlertText"),
            "success"
          );
          setCurrentStepIndex(currentStepIndex + 1);
          setIsModalOpen(false);
          setCheckedDependencies([]);
        } else {
          Swal.fire(
            t("problem-allKeys.errorAlertTitle"),
            t("problem-allKeys.errorAlertText"),
            "error"
          );
        }
      } catch {
        Swal.fire(
          t("problem-allKeys.errorAlertTitle"),
          t("problem-allKeys.errorAlertText"),
          "error"
        );
      }
    }
  };

  const showPracticeModal = () => {
    const pattern = "#^_^#";
    if (steps[currentStepIndex + 1].split(pattern)[1] === "chooseFirstKey") {
      chooseFirstKeyModel();
    }

    if (steps[currentStepIndex + 1].split(pattern)[1] === "dependencyOffer") {
      setIsModalOpen(true);
      setCheckedDependencies([]);
    }
  };

  return (
    <>
      <div>
        <div className="allKeys">
          <h2>{t("problem-allKeys.allKeysTitle")}</h2>
          <h3>[ {showFunctionsInstance.showKeysAsText(allKeys)} ]</h3>
        </div>

        <hr style={{ width: "80%", margin: "0 auto" }} />

        <div className="allKeysStepByStep">
          {showSteps && (
            <div ref={stepsContainerRef} className="steps-container">
              {steps.slice(0, currentStepIndex + 1).map((step, index) => (
                <p className="step" key={index}>
                  {stepDetectPracticeAble(step)}
                </p>
              ))}
            </div>
          )}
        </div>

        <div className="explainButtons">
          {currentStepIndex < steps.length - 1 && (
            <button
              className="btn_ExplainResult"
              onClick={handleShowStepByStep}
            >
              {showSteps
                ? t("problem-allKeys.nextStep")
                : t("problem-allKeys.showStepByStep")}
            </button>
          )}

          {showPracticeButton && (
            <button className="btn_PracticeButton" onClick={showPracticeModal}>
              {t("problem-allKeys.tryNextStep")}
            </button>
          )}

          {currentStepIndex !== steps.length - 1 && (
            <button className="btn_ExplainResult" onClick={handleShowAllSteps}>
              {t("problem-allKeys.showAllSteps")}
            </button>
          )}
        </div>
      </div>

      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="custom-modal"
      >
        <h2 style={{ color: "#000", marginBottom: "1em" }}>
          {t("problem-allKeys.chooseDependenciesAccordingConditions")}
        </h2>
        {nonTrivial_FDs.map((dependency, index) => (
          <div key={index} className="dependency-checkbox">
            <input
              type="checkbox"
              id={`dependency-${index}`}
              name={`dependency-${index}`}
              onChange={(e) => handleCheckboxChange(index, e.target.checked)}
              className="checkbox"
            />
            <label htmlFor={`dependency-${index}`}>
              {showFunctionsInstance.showTextDependencyWithArrow(dependency)}
            </label>
          </div>
        ))}
        <button onClick={() => chooseNextDependency()} className="confimButton">
          {t("problem-allKeys.modalButtonConfirm")}
        </button>
      </ReactModal>

      <div ref={endRef} />
    </>
  );
}

export default AllKeys;
