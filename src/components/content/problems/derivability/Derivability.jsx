import React, { useState, useEffect, useRef } from "react";
import { useAttributeContext } from "../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import Swal from "sweetalert2";
import { Trans, useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import "./derivability.scss";
import "./derivabilityMobile.scss";
import { AttributeFunctions } from "../../../../algorithm/AttributeFunctions";
import { FunctionalDependencyFunctions } from "../../../../algorithm/FunctionalDependencyFunctions";
import { HelperSetFunctions } from "../../../../algorithm/HelperSetFunctions";
import { FPlusFunctions } from "../../../../algorithm/FPlusFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";

const attributeFunctionsInstance = new AttributeFunctions();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();
const helperSetFunctionsInstance = new HelperSetFunctions();
const fPlusFunctionsInstance = new FPlusFunctions();
const showFunctionsInstance = new ShowFunctions();
function Derivability() {
  const { t } = useTranslation();
  const { attributes } = useAttributeContext();
  const { dependencies, setDependencies } = useDependencyContext();

  const location = useLocation();

  const [leftSideAttributes, setLeftSideAttributes] = useState([]);
  const [rightSideAttributes, setRightSideAttributes] = useState([]);

  const [attributesAreaFplus, setAttributesAreaFplus] = useState(
    location.state || []
  );

  const [fplusResult, setFplusResult] = useState([]);

  const [fPlusForStep4, setfPlusForStep4] = useState([]);

  const [powerSet, setPowerSet] = useState([]);

  const [currentStep, setCurrentStep] = useState(0);

  const [showFplusExplainButton, setShowFplusExplainButton] = useState(false);
  const [showFPlusResult, setShowFPlusResult] = useState(false);

  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentStep, showFPlusResult]);

  useEffect(() => {
    if (currentStep < 3) {
      return;
    }

    const newfPlusForStep4 = powerSet
      .map((subset, index) => {
        const closure = attributeFunctionsInstance.attributeClosure(
          dependencies,
          subset
        );
        const relevantClosure = closure.filter(
          (attr) => attributesAreaFplus.includes(attr) && !subset.includes(attr)
        );

        if (
          relevantClosure.length === 0 ||
          relevantClosure.every((attr) => subset.includes(attr))
        ) {
          return null;
        } else {
          return { left: subset, right: relevantClosure };
        }
      })
      .filter((item) => item !== null);

    const FDsWithReducedLeftSide = newfPlusForStep4.map((dependency, index) => {
      let key = functionalDependencyFunctionsInstance.getReducedAttributes(
        dependencies,
        dependency.left,
        dependency.right
      );
      let value = helperSetFunctionsInstance.difference(dependency.right, key);

      return { left: key, right: value };
    });

    setfPlusForStep4(FDsWithReducedLeftSide);
  }, [currentStep]);

  const handleAddAttribute = (side, value) => {
    if (side === "left") {
      setLeftSideAttributes([...leftSideAttributes, value]);
    }
    if (side === "right") {
      setRightSideAttributes([...rightSideAttributes, value]);
    }
    if (side == "fplus") {
      setAttributesAreaFplus([...attributesAreaFplus, value]);
      setShowFPlusResult(false);
      setCurrentStep(0);
      setShowFplusExplainButton(false);
    }
  };

  const handleRemoveAttribute = (side, attrToRemove) => {
    if (side === "left") {
      setLeftSideAttributes(
        leftSideAttributes.filter((attr) => attr !== attrToRemove)
      );
    }
    if (side === "right") {
      setRightSideAttributes(
        rightSideAttributes.filter((attr) => attr !== attrToRemove)
      );
    }
    if (side === "fplus") {
      setAttributesAreaFplus(
        attributesAreaFplus.filter((attr) => attr !== attrToRemove)
      );
      setShowFPlusResult(false);
      setCurrentStep(0);
      setShowFplusExplainButton(false);
    }
  };

  const CheckDerivability = () => {
    if (leftSideAttributes.length === 0 || rightSideAttributes.length === 0) {
      Swal.fire({
        title: t("problem-derivability.selectAttributesInBothSides"),
        icon: "warning",
        confirmButtonText: "Ok",
      });
      return;
    }

    const attrClosure = attributeFunctionsInstance.attributeClosure(
      dependencies,
      leftSideAttributes
    );

    if (helperSetFunctionsInstance.subset(rightSideAttributes, attrClosure)) {
      Swal.fire({
        title: t("problem-derivability.dependencyIsDerivable"),
        icon: "success",
        confirmButtonText: "Ok",
      });
    } else {
      Swal.fire({
        title: t("problem-derivability.dependencyIsNotDerivable"),
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const showFplus = () => {
    if (attributesAreaFplus.length === 0) {
      Swal.fire({
        title: t("problem-derivability.selectAttributesBeforeCheck"),
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } else {
      const fplus = fPlusFunctionsInstance.FPlus(
        dependencies,
        attributesAreaFplus
      );
      setFplusResult(fplus);
      setShowFplusExplainButton(true);
      setShowFPlusResult(true);
    }

    window.scrollBy(0, 1000);
  };

  const explainFplusResult = () => {
    setPowerSet(helperSetFunctionsInstance.powerSet(attributesAreaFplus));
    setCurrentStep(currentStep + 1);

    window.scrollBy(0, 1000);
  };

  const renderSubset = (subset, index) => {
    const closure = attributeFunctionsInstance.attributeClosure(
      dependencies,
      subset
    );
    // Filtrujeme pouze atributy, které jsou součástí `attributesAreaFplus` a nejsou v subsetu
    const relevantClosure = closure.filter(
      (attr) => attributesAreaFplus.includes(attr) && !subset.includes(attr)
    );

    if (
      relevantClosure.length === 0 ||
      relevantClosure.every((attr) => subset.includes(attr))
    ) {
      return null;
    } else {
      return (
        <div key={index} className="powerSetSubset">
          <div className="subset">
            {showFunctionsInstance.dependencySideArrayToText(subset)}
            {" → " +
              showFunctionsInstance.dependencySideArrayToText(relevantClosure)}
          </div>
        </div>
      );
    }
  };

  const fillAllAttributes = (side) => {
    if (side === "left") {
      setLeftSideAttributes(attributes);
    } else if (side === "right") {
      setRightSideAttributes([...attributes]);
    } else if (side === "simplifyFplus") {
      setAttributesAreaFplus([...attributes]);
      setShowFPlusResult(false);
      setCurrentStep(0);
      setShowFplusExplainButton(false);
    }
  };

  return (
    <div className="derivability-container">
      <div className="problemContainer">
        <h2>{t("problem-derivability.schema")}</h2>
        {attributes.length > 0 ? (
          <p className="IS">
            IS ( {showFunctionsInstance.attributesArrayToText(attributes)} )
          </p>
        ) : (
          <p>{t("problem-derivability.youWillSeeTheSchemaHere")}</p>
        )}

        <h2>{t("problem-derivability.dependencies")}</h2>
        <p className="dependencies">
          F = &#123;{" "}
          {showFunctionsInstance.dependenciesArrayToText(dependencies)}
          &#125;
        </p>
      </div>

      <hr />

      <div className="checkDerivability-container">
        <h1>{t("problem-derivability.checkIfDependencyIsDerivable")}</h1>
        <h2 className="addDependencyH2title">
          {t("problem-derivability.insertTheDependency")}
        </h2>
        <div className="derivability-dependency">
          <div className="leftAttributes">
            <button
              className="fillAllAttributesBtn"
              onClick={() => fillAllAttributes("left")}
            >
              {t("global.fillAllAttributes")}
            </button>
            {leftSideAttributes.map((attr, index) => (
              <span className="attributeTag" key={index}>
                <span className="text">{attr}</span>
                <button
                  className="removeBtn"
                  onClick={() => handleRemoveAttribute("left", attr)}
                >
                  x
                </button>
              </span>
            ))}

            <select
              value="default"
              className="addAttrComboBox"
              onChange={(e) => handleAddAttribute("left", e.target.value)}
            >
              <option value="default" disabled>
                {t("problem-derivability.addAttribute")}
              </option>
              {attributes.map(
                (attr) =>
                  !leftSideAttributes.includes(attr) && (
                    <option key={attr} value={attr} className="text">
                      {attr}
                    </option>
                  )
              )}
            </select>
          </div>
          <div className="arrow">→</div>
          <div className="rightAttributes">
            <button
              className="fillAllAttributesBtn"
              onClick={() => fillAllAttributes("right")}
            >
              {t("global.fillAllAttributes")}
            </button>
            {rightSideAttributes.map((attr, index) => (
              <span className="attributeTag" key={index}>
                <span className="text">{attr}</span>
                <button
                  className="removeBtn"
                  onClick={() => handleRemoveAttribute("right", attr)}
                >
                  x
                </button>
              </span>
            ))}
            <select
              value="default"
              className="addAttrComboBox"
              onChange={(e) => handleAddAttribute("right", e.target.value)}
            >
              <option value="default" disabled>
                {t("problem-derivability.addAttribute")}
              </option>
              {attributes.map(
                (attr) =>
                  !rightSideAttributes.includes(attr) && (
                    <option key={attr} value={attr} className="text">
                      {attr}
                    </option>
                  )
              )}
            </select>
          </div>
        </div>

        <button
          className="showRedundantManually_btn"
          onClick={() => CheckDerivability()}
        >
          {t("problem-derivability.checkDerivability")}
        </button>
      </div>

      <hr />

      <div className="fPlus-container">
        <h1>{t("problem-derivability.dependenciesFromSelectedAttributes")}</h1>
        <h2>{t("problem-derivability.chooseAttributes")}</h2>
        <div>
          <button
            className="fillAllAttributesBtn"
            id="fillAllAttributesBtnFplus"
            onClick={() => fillAllAttributes("simplifyFplus")}
          >
            {t("global.fillAllAttributes")}
          </button>

          <div className="derivability-attributesArea">
            {attributesAreaFplus.map((attr, index) => (
              <span className="attributeTag" key={index}>
                <span className="text">{attr}</span>
                <button
                  className="removeBtn"
                  onClick={() => handleRemoveAttribute("fplus", attr)}
                >
                  x
                </button>
              </span>
            ))}
            <select
              value="default"
              className="addAttrComboBox"
              onChange={(e) => handleAddAttribute("fplus", e.target.value)}
            >
              <option value="default" disabled>
                {t("problem-derivability.addAttribute")}
              </option>
              {attributes.map(
                (attr) =>
                  !attributesAreaFplus.includes(attr) && (
                    <option key={attr} value={attr} className="text">
                      {attr}
                    </option>
                  )
              )}
            </select>
          </div>
        </div>

        <button className="showFplus_btn" onClick={() => showFplus()}>
          <Trans
            i18nKey="problem-derivability.showSimplifyFplus"
            components={[<sup></sup>]}
          />
        </button>

        {showFPlusResult && (
          <div className="fplusResult">
            <h3>
              {" "}
              <Trans
                i18nKey="problem-derivability.simplifyFplus"
                components={[<sup></sup>]}
              />
            </h3>
            {fplusResult.map((dependency, index) => (
              <div key={index} className="fplusDependency">
                {showFunctionsInstance.showTextDependencyWithArrow(dependency)}
              </div>
            ))}
          </div>
        )}

        {currentStep >= 1 && (
          <div className="FplusExplainStep1">
            <h2>{t("problem-derivability.step1")}</h2>
            <div className="note">
              <Trans
                i18nKey="problem-derivability.step1Note"
                components={[
                  <sup></sup>,
                  <sup></sup>,
                  { attributesAreaFplusLength: attributesAreaFplus.length },
                ]}
              />
            </div>
            <div className="powerSetSubetContainer">
              {
                // zobrazit prvních 15 prvků z powerSet, poté "..." a nakonec posledních 5 prvků
                powerSet.length > 20 ? (
                  <>
                    {powerSet.slice(0, 15).map((subset, index) => (
                      <div key={index} className="powerSetSubset">
                        {showFunctionsInstance.attributesArrayToText(subset)}
                      </div>
                    ))}
                    <div className="dots">...</div>
                    {powerSet.slice(-5).map((subset, index) => (
                      <div key={`last-${index}`} className="powerSetSubset">
                        {showFunctionsInstance.attributesArrayToText(subset)}
                      </div>
                    ))}
                  </>
                ) : (
                  powerSet.map((subset, index) => (
                    <div key={index} className="powerSetSubset">
                      {showFunctionsInstance.attributesArrayToText(subset)}
                    </div>
                  ))
                )
              }
            </div>
          </div>
        )}

        {currentStep >= 2 && (
          <div className="FplusExplainStep2">
            <h2>{t("problem-derivability.step2")}</h2>
            <div className="powerSetSubsetContainer">
              {powerSet.length > 20 ? (
                <>
                  {powerSet.slice(0, 15).map((subset, index) => (
                    <div key={index} className="powerSetSubset">
                      <div className="subset">
                        (
                        {showFunctionsInstance.dependencySideArrayToText(
                          subset
                        )}
                        )<sup>+</sup>
                        {" → " +
                          showFunctionsInstance.dependencySideArrayToText(
                            attributeFunctionsInstance.attributeClosure(
                              dependencies,
                              subset
                            )
                          )}
                      </div>
                    </div>
                  ))}
                  <div key="dots" className="powerSetSubset">
                    ...
                  </div>
                  {powerSet.slice(-5).map((subset, index) => (
                    <div key={`last-${index}`} className="powerSetSubset">
                      <div className="subset">
                        (
                        {showFunctionsInstance.dependencySideArrayToText(
                          subset
                        )}
                        )<sup>+</sup>
                        {" → " +
                          showFunctionsInstance.dependencySideArrayToText(
                            attributeFunctionsInstance.attributeClosure(
                              dependencies,
                              subset
                            )
                          )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                powerSet.map((subset, index) => (
                  <div key={index} className="powerSetSubset">
                    <div className="subset">
                      ({showFunctionsInstance.dependencySideArrayToText(subset)}
                      )<sup>+</sup>
                      {" → " +
                        showFunctionsInstance.dependencySideArrayToText(
                          attributeFunctionsInstance.attributeClosure(
                            dependencies,
                            subset
                          )
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentStep >= 3 && (
          <div className="FplusExplainStep3">
            <h2>
              <Trans i18nKey="problem-derivability.step3" />
            </h2>
            <div className="note">{t("problem-derivability.step3_Note1")}</div>
            <div className="note">{t("problem-derivability.step3_Note2")}</div>
            <div className="note">{t("problem-derivability.step3_Note3")}</div>
            <div className="powerSetSubsetContainer">
              {powerSet.length > 20 ? (
                <>
                  {powerSet
                    .slice(0, 15)
                    .map((subset, index) => renderSubset(subset, index))}
                  <div key="dots" className="powerSetSubset">
                    ...
                  </div>
                  {powerSet
                    .slice(-5)
                    .map((subset, index) => renderSubset(subset, index))}
                </>
              ) : (
                powerSet.map((subset, index) => renderSubset(subset, index))
              )}
            </div>
          </div>
        )}

        {currentStep >= 4 && (
          <div className="FplusExplainStep4">
            <h2>{t("problem-derivability.step4")}</h2>
            <div className="fplusDependencyContainer">
              {fPlusForStep4.length > 20 ? (
                <>
                  {fPlusForStep4.slice(0, 15).map((dependency, index) => (
                    <div key={index} className="fplusDependency">
                      {showFunctionsInstance.showTextDependencyWithArrow(
                        dependency
                      )}
                    </div>
                  ))}
                  <div key="dots" className="fplusDependency">
                    ...
                  </div>
                  {fPlusForStep4.slice(-5).map((dependency, index) => (
                    <div key={`last-${index}`} className="fplusDependency">
                      {showFunctionsInstance.showTextDependencyWithArrow(
                        dependency
                      )}
                    </div>
                  ))}
                </>
              ) : (
                fPlusForStep4.map((dependency, index) => (
                  <div key={index} className="fplusDependency">
                    {showFunctionsInstance.showTextDependencyWithArrow(
                      dependency
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentStep >= 5 && (
          <div className="FplusExplainStep5">
            <h2>
              <Trans
                i18nKey="problem-derivability.step5"
                components={[<sup></sup>]}
              />
            </h2>
            <div className="fplusDependencyContainer">
              {functionalDependencyFunctionsInstance
                .mergeDependenciesWithTheSameLHS(fPlusForStep4)
                .map((dependency, index) => (
                  <div key={index} className="fplusDependency">
                    {showFunctionsInstance.showTextDependencyWithArrow(
                      dependency
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {showFplusExplainButton && currentStep < 5 && (
          <button
            className="explainFplusResult_btn"
            onClick={explainFplusResult}
          >
            {currentStep === 0 ? (
              <span>
                <Trans
                  i18nKey="problem-derivability.explainFplusResult"
                  components={[<sup></sup>]}
                />
              </span>
            ) : (
              t("problem-derivability.nextStep")
            )}
          </button>
        )}
      </div>

      <div ref={endRef} />
    </div>
  );
}

export default Derivability;
