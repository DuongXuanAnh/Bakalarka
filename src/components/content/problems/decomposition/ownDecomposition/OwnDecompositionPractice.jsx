import React, { useState, useEffect, useRef } from "react";
import { NormalFormALG } from "../../../../../algorithm/NormalFormALG";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import "./ownDecomposition.scss";

import { AttributeFunctions } from "../../../../../algorithm/AttributeFunctions";
import { HelperSetFunctions } from "../../../../../algorithm/HelperSetFunctions";

const attributeFunctionsInstance = new AttributeFunctions();
const helperSetFunctionsInstance = new HelperSetFunctions();

function OwnDecompositionPractice({
  selectedNode,
  handleDependencyClick,
  setIsModalDecompositeOwnWayOpen,
  setIsPracticeModalOpen,
}) {
  const { t } = useTranslation();
  const normalFormInstance = new NormalFormALG();
  const [leftSideAttributes, setLeftSideAttributes] = useState([]);
  const [rightSideAttributes, setRightSideAttributes] = useState([]);
  const [attributes, setAttributes] = useState(selectedNode.data.attributes);
  const [dependencies, setDependencies] = useState(selectedNode.data.FDs);
  const [leftSubRelationAttributes, setLeftSubRelationAttributes] = useState(
    []
  );
  const [rightSubRelationAttributes, setRightSubRelationAttributes] = useState(
    []
  );

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

    if (side === "leftSubRelation") {
      setLeftSubRelationAttributes(
        leftSubRelationAttributes.filter((attr) => attr !== attrToRemove)
      );
    }
    if (side === "rightSubRelation") {
      setRightSubRelationAttributes(
        rightSubRelationAttributes.filter((attr) => attr !== attrToRemove)
      );
    }
  };

  const handleAddAttribute = (side, value) => {
    if (side === "left") {
      setLeftSideAttributes([...leftSideAttributes, value]);
    }
    if (side === "right") {
      setRightSideAttributes([...rightSideAttributes, value]);
    }
    if (side === "leftSubRelation") {
      setLeftSubRelationAttributes([...leftSubRelationAttributes, value]);
    }
    if (side === "rightSubRelation") {
      setRightSubRelationAttributes([...rightSubRelationAttributes, value]);
    }
  };

  const fillAllAttributes = (side) => {
    if (side === "left") {
      setLeftSideAttributes([...attributes]);
    }
    if (side === "right") {
      setRightSideAttributes([...attributes]);
    }
    if (side === "leftSubRelation") {
      setLeftSubRelationAttributes([...attributes]);
    }
    if (side === "rightSubRelation") {
      setRightSubRelationAttributes([...attributes]);
    }
  };

  const isDerivableDependency = (leftSide, rightSide) => {
    const attrClosure = attributeFunctionsInstance.attributeClosure(
      dependencies,
      leftSide
    );

    return helperSetFunctionsInstance.subset(rightSide, attrClosure);
  };

  const isLeftSubRelationContainsAllAttributes = () => {
    return (
      helperSetFunctionsInstance.subset(
        [...leftSideAttributes, ...rightSideAttributes],
        leftSubRelationAttributes
      ) &&
      helperSetFunctionsInstance.subset(leftSubRelationAttributes, [
        ...leftSideAttributes,
        ...rightSideAttributes,
      ])
    );
  };

  const isRightsubRelationContainsAllAttributes = () => {
    // selectedNode.data.originalAttr without rightSideAttributes
    const correctRightAttributes = attributes.filter(
      (attr) => !rightSideAttributes.includes(attr)
    );

    return (
      helperSetFunctionsInstance.subset(
        correctRightAttributes,
        rightSubRelationAttributes
      ) &&
      helperSetFunctionsInstance.subset(
        rightSubRelationAttributes,
        correctRightAttributes
      )
    );
  };

  const decompositeOwnWay = () => {
    if (
      leftSideAttributes.length === 0 ||
      rightSideAttributes.length === 0 ||
      leftSubRelationAttributes.length === 0 ||
      rightSubRelationAttributes.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: t("ownDecomposition.error"),
        text: t("ownDecomposition.needAtLeastOneAttr"),
      });
    } else if (
      helperSetFunctionsInstance.intersection(
        leftSideAttributes,
        rightSideAttributes
      ).length > 0
    ) {
      Swal.fire({
        icon: "warning",
        title: t("ownDecomposition.error"),
        text: t("ownDecomposition.rightSideCantContainLeftAttr"),
      });
    }
    // kontrola zda je zadana zavislost odvoditelna
    else if (!isDerivableDependency(leftSideAttributes, rightSideAttributes)) {
      Swal.fire({
        icon: "warning",
        title: t("ownDecomposition.error"),
        text: t("ownDecomposition.dependencyNotDerivable"),
      });
    }

    // kontrola, za leva podrelace obsahuje vsechny atributy
    else if (!isLeftSubRelationContainsAllAttributes()) {
      Swal.fire({
        icon: "warning",
        title: t("ownDecomposition.error"),
        text: t("ownDecomposition.leftSideNotCorrect"),
      });
    }

    // Kontrola zda prava podrelace obsahuje vsechny atributy
    else if (!isRightsubRelationContainsAllAttributes()) {
      Swal.fire({
        icon: "warning",
        title: "Chyba",
        text: t("ownDecomposition.rightSideNotCorrect"),
      });
    } else if (
      leftSideAttributes.length + rightSideAttributes.length ===
      attributes.length
    ) {
      Swal.fire({
        icon: "warning",
        title: "Chyba",
        text: t("ownDecomposition.giveTableContainAllAttr"),
      });
    } else if (
      normalFormInstance.isSuperKey(
        selectedNode.data.keys,
        leftSideAttributes
      )
    ) {
      Swal.fire({
        icon: "warning",
        text: t("ownDecomposition.leftSideCanNotBeSuperKey"),
        showCancelButton: true,
        cancelButtonText: t("ownDecomposition.close"),
        confirmButtonText: t("ownDecomposition.stillDecompose"),
      }).then((result) => {
        if (result.isConfirmed) {
          const dependency = {
            left: leftSideAttributes,
            right: rightSideAttributes,
          };
          const node = selectedNode;

          handleDependencyClick(dependency, node);
          setIsModalDecompositeOwnWayOpen(false);
          setIsPracticeModalOpen(false);
        }
      });
    } else {
      const dependency = {
        left: leftSideAttributes,
        right: rightSideAttributes,
      };
      const node = selectedNode;

      handleDependencyClick(dependency, node);
      setIsModalDecompositeOwnWayOpen(false);
      setIsPracticeModalOpen(false);
    }
  };

  return (
    <div className="ownDependencyContainer">
      <div className="dependencyWrapper">
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
              <p className="text">{attr}</p>
              <button
                className="removeBtn"
                key={index}
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
              {t("ownDecomposition.addAttribute")}
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

      <hr style={{ margin: "15px 0px 15px 0" }} />

      <div className="leftSubRelation">
        <h3 style={{ color: "#000" }}>
          {t("ownDecomposition.leftSubRelation")}
        </h3>
        <button
          className="fillAllAttributesBtn"
          onClick={() => fillAllAttributes("leftSubRelation")}
        >
          {t("global.fillAllAttributes")}
        </button>
        {leftSubRelationAttributes.map((attr, index) => (
          <span className="attributeTag" key={index}>
            <p className="text">{attr}</p>
            <button
              className="removeBtn"
              key={index}
              onClick={() => handleRemoveAttribute("leftSubRelation", attr)}
            >
              x
            </button>
          </span>
        ))}
        <select
          value="default"
          className="addAttrComboBox"
          onChange={(e) =>
            handleAddAttribute("leftSubRelation", e.target.value)
          }
        >
          <option value="default" disabled>
            {t("ownDecomposition.addAttribute")}
          </option>
          {attributes.map(
            (attr) =>
              !leftSubRelationAttributes.includes(attr) && (
                <option key={attr} value={attr} className="text">
                  {attr}
                </option>
              )
          )}
        </select>
      </div>

      <div className="rightSubRelation">
        <h3 style={{ color: "#000" }}>
          {t("ownDecomposition.rightSubRelation")}
        </h3>
        <button
          className="fillAllAttributesBtn"
          onClick={() => fillAllAttributes("rightSubRelation")}
        >
          {t("global.fillAllAttributes")}
        </button>
        {rightSubRelationAttributes.map((attr, index) => (
          <span className="attributeTag" key={index}>
            <p className="text">{attr}</p>
            <button
              className="removeBtn"
              key={index}
              onClick={() => handleRemoveAttribute("rightSubRelation", attr)}
            >
              x
            </button>
          </span>
        ))}
        <select
          value="default"
          className="addAttrComboBox"
          onChange={(e) =>
            handleAddAttribute("rightSubRelation", e.target.value)
          }
        >
          <option value="default" disabled>
            {t("problem-derivability.addAttribute")}
          </option>
          {attributes.map(
            (attr) =>
              !rightSubRelationAttributes.includes(attr) && (
                <option key={attr} value={attr} className="text">
                  {attr}
                </option>
              )
          )}
        </select>
      </div>

      <button className="decompositeBtn" onClick={() => decompositeOwnWay()}>
        {t("ownDecomposition.decompose")}
      </button>
    </div>
  );
}

export default OwnDecompositionPractice;
