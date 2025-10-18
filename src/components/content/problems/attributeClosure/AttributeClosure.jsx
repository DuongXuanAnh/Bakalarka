import React, { useState, useEffect, useRef } from "react";
import { useAttributeContext } from "../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import { AttributeFunctions } from "../../../../algorithm/AttributeFunctions";
import { HelperSetFunctions } from "../../../../algorithm/HelperSetFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import "./attributeClosure.scss";
import "./attributeClosureMobile.scss";

function AttributeClosure() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const { attributes } = useAttributeContext();
  const { dependencies } = useDependencyContext();

  const attributeFunctionsInstance = new AttributeFunctions();
  const helperSetFunctionsInstance = new HelperSetFunctions();
  const showFunctionsInstance = new ShowFunctions();
  const [attributesArea, setAttributesArea] = useState([]);

  const [attributeClosure, setAttributeClosure] = useState(
    attributeFunctionsInstance.attributeClosureWithExplain(
      dependencies,
      attributes,
      attributesArea
    )
  );

  const [attributeClosurePractice, setAttributeClosurePractice] = useState([]);

  const [viewMode, setViewMode] = useState("none"); // none, showClosure, practiceClosure

  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

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
    const storedSteps = JSON.parse(
      localStorage.getItem("algorithmExplainAttrClosure") || "[]"
    );
    setSteps(storedSteps);
  }, [attributesArea, currentLanguage]);

  const handleAddAttribute = (value) => {
    setAttributesArea([...attributesArea, value]);
    setAttributeClosure([]);
    setViewMode("none");
  };

  const handleAddAttributePractice = (value) => {
    setAttributeClosurePractice([...attributeClosurePractice, value]);
  };

  const handleRemoveAttribute = (attrToRemove) => {
    setAttributesArea(attributesArea.filter((attr) => attr !== attrToRemove));
    setAttributeClosure([]);
    setViewMode("none");
  };

  const handleRemovePracticeAttribute = (attrToRemove) => {
    setAttributeClosurePractice(
      attributeClosurePractice.filter((attr) => attr !== attrToRemove)
    );
  };

  const showAttributeClosure = () => {
    if (attributesArea.length === 0) {
      Swal.fire({
        text: t("problem-attributeClosure.selectAtLeastOneAttribute"),
        icon: "warning",
        confirmButtonText: t("problem-attributeClosure.close"),
      });
    } else {
      setCurrentStepIndex(-1);
      setAttributeClosure(
        attributeFunctionsInstance.attributeClosure(
          dependencies,
          attributesArea
        )
      );
      setViewMode("showClosure");
    }
  };

  const practiceAttributeClosure = () => {
    setAttributeClosurePractice([]);
    if (attributesArea.length === 0) {
      Swal.fire({
        text: t("problem-attributeClosure.selectAtLeastOneAttribute"),
        icon: "warning",
        confirmButtonText: t("problem-attributeClosure.close"),
      });
    } else {
      setViewMode("practiceClosure");
    }
  };

  const submitPracticeAttributeClosure = () => {
    const closure = attributeFunctionsInstance.attributeClosure(
      dependencies,
      attributesArea
    );
    if (
      helperSetFunctionsInstance.subset(closure, attributeClosurePractice) &&
      helperSetFunctionsInstance.subset(attributeClosurePractice, closure)
    ) {
      Swal.fire({
        title: t("problem-attributeClosure.congratulations"),
        text: t("problem-attributeClosure.yourAnswerIsCorrect"),
        icon: "success",
        confirmButtonText: t("problem-attributeClosure.close"),
      });
    } else {
      Swal.fire({
        title: t("problem-attributeClosure.unfortunately"),
        text: t("problem-attributeClosure.yourAnswerIsIncorrect"),
        icon: "error",
        confirmButtonText: t("problem-attributeClosure.close"),
      });
    }
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

  const fillAllAttributes = (area) => {
    if (area === "chosenAttr") {
      setAttributesArea([...attributes]);
      setAttributeClosure([]);
      setViewMode("none");
    } else if (area === "practiceAttr") {
      setAttributeClosurePractice([...attributes]);
    }
  };

  return (
    <>
      <div className="attributeClosure-container">
        <div className="problemContainer">
          <h2>{t("problem-attributeClosure.schema")}</h2>
          {attributes.length > 0 ? (
            <p className="IS">
              IS ( {showFunctionsInstance.attributesArrayToText(attributes)} )
            </p>
          ) : (
            <p>{t("problem-attributeClosure.youWillSeeTheSchemaHere")}</p>
          )}

          <h2>{t("problem-attributeClosure.dependencies")}</h2>
          <p className="dependencies">
            F = &#123;{" "}
            {showFunctionsInstance.dependenciesArrayToText(dependencies)}
            &#125;
          </p>
        </div>
        <h2 style={{ marginBottom: "1em" }}>
          {t("problem-attributeClosure.selectAttributes")}
        </h2>
        <div>
          <button
            className="fillAllAttributesBtn"
            onClick={() => fillAllAttributes("chosenAttr")}
          >
            {t("global.fillAllAttributes")}
          </button>
          <div className="attributesArea">
            {attributesArea.map((attr, index) => (
              <span className="attributeTag" key={index}>
                <p className="text">{attr}</p>
                <button
                  className="removeBtn"
                  onClick={() => handleRemoveAttribute(attr)}
                >
                  x
                </button>
              </span>
            ))}
            <select
              value="default"
              className="addAttrComboBox"
              onChange={(e) => handleAddAttribute(e.target.value)}
            >
              <option value="default" disabled>
                {t("problem-attributeClosure.addAttribute")}
              </option>
              {attributes.map(
                (attr) =>
                  !attributesArea.includes(attr) && (
                    <option key={attr} value={attr}>
                      {attr}
                    </option>
                  )
              )}
            </select>
          </div>

          <div className="btn_showAttributeClosureWrapper">
            <button
              className="btn_showAttributeClosure"
              onClick={() => showAttributeClosure()}
            >
              {t("problem-attributeClosure.showAttributeClosure")}
            </button>
            <button
              className="btn_practiceAttributeClosure"
              onClick={() => practiceAttributeClosure()}
            >
              {t("problem-attributeClosure.practiceAttributeClosure")}
            </button>
          </div>

          {viewMode === "showClosure" && (
            <div className="attributeClosure">
              <h2>{t("problem-attributeClosure.attributeClosure")}</h2>
              <div className="attributeClosureResult">
                {showFunctionsInstance.attributesArrayToText(attributesArea)}
                <sup>+</sup>
                <span className="arrow"> = </span>
                {showFunctionsInstance.attributesArrayToText(attributeClosure)}
              </div>
              <div className="StepsContainer">
                {steps.slice(0, currentStepIndex + 1).map((step, index) => (
                  <p className="step" key={index}>
                    {step}
                  </p>
                ))}
              </div>

              {currentStepIndex < steps.length - 1 && (
                <button
                  className="btn_ExplainResult"
                  onClick={handleShowStepByStep}
                >
                  {showSteps
                    ? t("problem-attributeClosure.showNextStep")
                    : t("problem-attributeClosure.showStepByStepProcedure")}
                </button>
              )}

              {currentStepIndex !== steps.length - 1 && (
                <button
                  className="btn_ExplainResult"
                  onClick={handleShowAllSteps}
                >
                  {t("problem-attributeClosure.showTheWholeProcedure")}
                </button>
              )}
            </div>
          )}

          {viewMode === "practiceClosure" && (
            <div className="practiceAttributeClosureWrapper">
              <h2 style={{ marginBottom: "1em" }}>
                {t("problem-attributeClosure.yourOpinionOnAttributeClosure")}
              </h2>
              <button
                className="fillAllAttributesBtn"
                onClick={() => fillAllAttributes("practiceAttr")}
              >
                {t("global.fillAllAttributes")}
              </button>
              <div className="attributesAreaResult">
                {attributeClosurePractice.map((attr, index) => (
                  <span className="attributeTag" key={index}>
                    <p className="text">{attr}</p>
                    <button
                      className="removeBtn"
                      onClick={() => handleRemovePracticeAttribute(attr)}
                    >
                      x
                    </button>
                  </span>
                ))}
                <select
                  value="default"
                  className="addAttrComboBox"
                  onChange={(e) => handleAddAttributePractice(e.target.value)}
                >
                  <option value="default" disabled>
                    {t("problem-attributeClosure.addAttribute")}
                  </option>
                  {attributes.map(
                    (attr) =>
                      !attributeClosurePractice.includes(attr) && (
                        <option key={attr} value={attr}>
                          {attr}
                        </option>
                      )
                  )}
                </select>
              </div>

              <button
                className="btnSubmit_practiceAttributeClosure"
                onClick={() => submitPracticeAttributeClosure()}
              >
                {t("problem-attributeClosure.checkTheResult")}
              </button>
            </div>
          )}
        </div>
      </div>
      <div ref={endRef} />
    </>
  );
}

export default AttributeClosure;
