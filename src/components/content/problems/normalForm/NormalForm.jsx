import React, { useState, useEffect } from "react";
import { useAttributeContext } from "../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import { NormalFormALG } from "../../../../algorithm/NormalFormALG";
import { Trans, useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { HelperColorFunctions } from "../../../../algorithm/HelperColorFunctions";
import "./normalForm.scss";
import { FPlusFunctions } from "../../../../algorithm/FPlusFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";
import { FindingKeysFunctions } from "../../../../algorithm/FindingKeysFunctions";

const helperColorFunctionsInstance = new HelperColorFunctions();
const normalFormInstance = new NormalFormALG();
const fPlusFunctionsInstance = new FPlusFunctions();
const showFunctionsInstance = new ShowFunctions();
const findingKeysFunctionsInstance = new FindingKeysFunctions();

function NormalForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { attributes } = useAttributeContext();
  const { dependencies } = useDependencyContext();

  const [showResultArea, setShowResultArea] = useState(false);

  const location = useLocation();

  const [attributesArea, setAttributesArea] = useState(location.state || []);

  const [result, setResult] = useState({
    fplus: [],
    keys: [],
    normalFormInfo: [],
  });

  const handleRemoveAttribute = (attrToRemove) => {
    setAttributesArea(attributesArea.filter((attr) => attr !== attrToRemove));
  };

  const handleAddAttribute = (value) => {
    setAttributesArea([...attributesArea, value]);
  };

  const showNormalForm = () => {
    const fPlus = fPlusFunctionsInstance.FPlus(dependencies, attributesArea);
    const normalForm = normalFormInstance.normalFormType(fPlus, attributesArea);
    const candidateKeys = findingKeysFunctionsInstance.getAllKeys(
      fPlus,
      attributesArea
    );
    setResult({
      fplus: fPlus,
      keys: candidateKeys,
      normalFormInfo: normalForm,
    });

    if (attributesArea.length !== 0) {
      setShowResultArea(true);
    } else {
      Swal.fire({
        icon: "warning",
        text: t("problem-normalForm.chooseAtleastOneAttribute"),
      });
    }
  };

  const handleNavigate = (attributes, destionation) => {
    // Save current state
    const stateToSave = {
      attributesArea: attributesArea,
    };
    sessionStorage.setItem("normalFormState", JSON.stringify(stateToSave));

    // Navigate
    navigate("/problems/" + destionation, { state: attributes });
  };

  useEffect(() => {
    const savedState = sessionStorage.getItem("normalFormState");
    if (savedState) {
      const { attributesArea } = JSON.parse(savedState);
      setAttributesArea(attributesArea);
    }
  }, []);

  useEffect(() => {
    const savedState = sessionStorage.getItem("normalFormState");
    const savedStateDecomposition =
      sessionStorage.getItem("decompositionState");
    if ((attributesArea.length > 0 && savedState) || savedStateDecomposition) {
      showNormalForm();
    }
  }, [attributesArea]);

  const fillAllAttributes = (area) => {
    if (area === "normalFormArea") {
      setAttributesArea([...attributes]);
    }
  };

  return (
    <div className="normalForm-container">
      <div className="problemContainer">
        <h2>{t("problem-normalForm.schema")}</h2>
        {attributes.length > 0 ? (
          <p className="IS">IS ( {showFunctionsInstance.attributesArrayToText(attributes)} )</p>
        ) : (
          <p>{t("problem-normalForm.youWillSeeTheSchemaHere")}</p>
        )}

        <h2>{t("problem-normalForm.dependencies")}</h2>
        <p className="dependencies">
          F = &#123;{" "}
          {showFunctionsInstance.dependenciesArrayToText(dependencies)} &#125;
        </p>
      </div>

      <h2>{t("problem-normalForm.selectAttributes")}</h2>
      <button
        className="fillAllAttributesBtn"
        onClick={() => fillAllAttributes("normalFormArea")}
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
            {t("problem-normalForm.addAttribute")}
          </option>
          {attributes &&
            attributes.map(
              (attr) =>
                !attributesArea.includes(attr) && (
                  <option key={attr} value={attr}>
                    {attr}
                  </option>
                )
            )}
        </select>
      </div>

      <button className="showNormalForm_btn" onClick={showNormalForm}>
        {t("problem-normalForm.showInfoSelectedTable")}
      </button>

      {showResultArea && (
        <div
          className="resultArea"
          style={{
            backgroundColor: helperColorFunctionsInstance.nodeBackgroundColor(result.normalFormInfo.type, false),
          }}
        >
          <h2>{t("problem-normalForm.result")}</h2>

          <div className="normalFormInfo">
            {t("problem-normalForm.normalForm")}
            {result.normalFormInfo && result.normalFormInfo.type === "BCNF"
              ? " BCNF"
              : ` ${result.normalFormInfo.type} NF`}
          </div>

          {result.fplus.length !== 0 && (
            <h3>
              {" "}
              <Trans
                i18nKey="problem-normalForm.dependencies-simplifyFplus"
                components={[<sup></sup>]}
              />{" "}
              <button
                className="howButton"
                onClick={() => handleNavigate(attributesArea, "derivablity")}
              >
                <Trans
                  i18nKey="problem-normalForm.howToReachSimpleF"
                  components={[<sup></sup>]}
                />
              </button>
            </h3>
          )}

          <div className="fplusInfo">
            {result.fplus &&
              result.fplus.map((fd, index) => (
                <div key={index} className="dependency">
                  {showFunctionsInstance.showTextDependencyWithArrow(fd)}
                </div>
              ))}
          </div>

          <div className="candidateKeysInfo">
            <h3>
              {t("problem-normalForm.candidateKeys")}{" "}
              <button
                className="howButton"
                onClick={() => handleNavigate(attributesArea, "allKeys")}
              >
                {t("problem-normalForm.howToGetCandidateKeys")}
              </button>
            </h3>

            <p>[ {showFunctionsInstance.showKeysAsText(result.keys)} ]</p>
          </div>

          {result.normalFormInfo.faultyDependencies.length !== 0 && (
            <h3>{t("problem-normalForm.faultyDependency")}</h3>
          )}
          <div className="faultlyDependenciesInfo">
            {result.normalFormInfo.faultyDependencies &&
              result.normalFormInfo.faultyDependencies.map((fd, index) => (
                <div key={index} className="faultyDependency">
                  {showFunctionsInstance.showTextDependencyWithArrow(
                    fd.dependency
                  )}{" "}
                  ({t("problem-normalForm.violates")}
                  {fd.violates})
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NormalForm;
