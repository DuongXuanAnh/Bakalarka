import React, { useState, useEffect, useRef } from "react";
import { NormalFormALG } from "../../../../../algorithm/NormalFormALG";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import "./ownDecomposition.scss";
import { AttributeFunctions } from "../../../../../algorithm/AttributeFunctions";
import { HelperSetFunctions } from "../../../../../algorithm/HelperSetFunctions";

const attributeFunctionsInstance = new AttributeFunctions();
const helperSetFunctionsInstance = new HelperSetFunctions();

// Define the usePrevious hook right in your component file
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function OwnDecomposition({
  selectedNode,
  handleDependencyClick,
  setIsModalDecompositeOwnWayOpen,
  setIsModalOpen,
}) {
  const { t } = useTranslation();
  const normalFormInstance = new NormalFormALG();
  const [leftSideAttributes, setLeftSideAttributes] = useState([]);
  const [rightSideAttributes, setRightSideAttributes] = useState([]);
  const [attributes] = useState(selectedNode.data.attributes);
  const [dependencies] = useState(selectedNode.data.FDs);

  const prevLeftSideAttributes = usePrevious(leftSideAttributes);

  useEffect(() => {
    if (
      prevLeftSideAttributes &&
      leftSideAttributes.length < prevLeftSideAttributes.length
    ) {
      setRightSideAttributes([]); // Clear rightSideAttributes only when an attribute is removed from the left side
    }
  }, [leftSideAttributes]);

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
  };

  const handleAddAttribute = (side, value) => {
    if (side === "left") {
      setLeftSideAttributes([...leftSideAttributes, value]);
    }
    if (side === "right") {
      setRightSideAttributes([...rightSideAttributes, value]);
    }
  };

  const fillAllAttributes = (side) => {
    if (side === "left") {
      setLeftSideAttributes([...attributes]);
    }
    if (side === "right") {
      setRightSideAttributes(
        attributeFunctionsInstance.nonTrivialClosure(
          dependencies,
          leftSideAttributes
        )
      );
    }
  };

  const decompositeOwnWay = () => {
    if (leftSideAttributes.length === 0 || rightSideAttributes.length === 0) {
      Swal.fire({
        icon: "warning",
        title: t("ownDecomposition.error"),
        text: t("ownDecomposition.needChooseAttributes"),
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
    } else if (
      leftSideAttributes.length + rightSideAttributes.length ===
      attributes.length
    ) {
      Swal.fire({
        icon: "warning",
        title: t("ownDecomposition.error"),
        text: t("ownDecomposition.giveTableContainAllAttr"),
      });
    } else if (
      normalFormInstance.isSuperKey(selectedNode.data.keys, leftSideAttributes)
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
          setIsModalOpen(false);
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
      setIsModalOpen(false);
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
              {t("ownDecomposition.addAttribute")}
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
            {attributeFunctionsInstance
              .nonTrivialClosure(dependencies, leftSideAttributes)
              .map(
                (attr) =>
                  !rightSideAttributes.includes(attr) && (
                    <option key={attr} value={attr}>
                      {attr}
                    </option>
                  )
              )}
          </select>
        </div>
      </div>

      <button className="decompositeBtn" onClick={() => decompositeOwnWay()}>
        {t("ownDecomposition.decompose")}
      </button>
    </div>
  );
}

export default OwnDecomposition;
