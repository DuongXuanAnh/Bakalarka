import React, { useState, useEffect, useRef } from "react";
import { useAttributeContext } from "../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HelperSetFunctions } from "../../../../algorithm/HelperSetFunctions";
import { AttributeFunctions } from "../../../../algorithm/AttributeFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";
import "./redundantAttribute.scss";

// Define the usePrevious hook right in your component file
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  return ref.current;
}

function RedundantAttribute() {
  const { t } = useTranslation();
  const { attributes } = useAttributeContext();
  const { dependencies, setDependencies } = useDependencyContext();
  const navigate = useNavigate();
  const helperSetFunctionsInstance = new HelperSetFunctions();
  const attributeFunctionsInstance = new AttributeFunctions();
  const showFunctionsInstance = new ShowFunctions();
  const [leftSideAttributes, setLeftSideAttributes] = useState([]);
  const [rightSideAttributes, setRightSideAttributes] = useState([]);

  const [redundantAttributes, setRedundantAttributes] = useState([]);
  const [isPracticing, setIsPracticing] = useState(false);
  const [openResultArea, setOpenResultArea] = useState(false);

  const [dragDirection, setDragDirection] = useState("horizontal");

  const prevLeftSideAttributes = usePrevious(leftSideAttributes);

  useEffect(() => {
    if (
      prevLeftSideAttributes &&
      leftSideAttributes.length < prevLeftSideAttributes.length
    ) {
      setRightSideAttributes([]); // Clear rightSideAttributes only when an attribute is removed from the left side
    }
    setIsPracticing(false);
  }, [leftSideAttributes]);

  useEffect(() => {
    const updateDragDirection = () => {
      if (window.innerWidth < 991) {
        setDragDirection("vertical");
      } else {
        setDragDirection("horizontal");
      }
    };

    updateDragDirection();
    window.addEventListener("resize", updateDragDirection);

    return () => {
      window.removeEventListener("resize", updateDragDirection);
    };
  }, []);

  const findRedundantAttributes = () => {
    if (leftSideAttributes.length === 0 || rightSideAttributes.length === 0) {
      Swal.fire({
        text: t(
          "problem-redundantAttribute.chooseAttributesBeforeCheckRedundancy"
        ),
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } else {
      setRedundantAttributes([]);

      let minimizeLHS = [...leftSideAttributes];
      const updatedRedundantAttributes = [];

      for (let i = 0; i < leftSideAttributes.length; i++) {
        let temp = minimizeLHS.shift();

        const attrClosure = attributeFunctionsInstance.attributeClosure(
          dependencies,
          minimizeLHS
        );

        if (
          helperSetFunctionsInstance.subset(rightSideAttributes, attrClosure)
        ) {
          updatedRedundantAttributes.push(temp);
        } else {
          minimizeLHS.push(temp);
        }
      }

      setRedundantAttributes(updatedRedundantAttributes);
    }
  };

  const showRedundantAttributes = () => {
    if (leftSideAttributes.length === 0 || rightSideAttributes.length === 0) {
      Swal.fire({
        text: t(
          "problem-redundantAttribute.chooseAttributesBeforeCheckRedundancy"
        ),
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } else {
      findRedundantAttributes();
      setOpenResultArea(true);
    }
  };

  const practiceRedundantAttributes = () => {
    setOpenResultArea(false);
    if (leftSideAttributes.length === 0 || rightSideAttributes.length === 0) {
      Swal.fire({
        text: t(
          "problem-redundantAttribute.chooseAttributesBeforeCheckRedundancy"
        ),
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } else {
      setIsPracticing(true);
    }
    findRedundantAttributes();
  };

  const handleAddAttribute = (side, value) => {
    if (side === "left") {
      setLeftSideAttributes([...leftSideAttributes, value]);
    }
    if (side === "right") {
      setRightSideAttributes([...rightSideAttributes, value]);
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
  };

  const onDragEnd = (result) => {
    // Pokud uživatel přetáhl prvek mimo povolenou oblast, nic se nestane
    if (!result.destination) {
      return;
    }

    // Získáme nové pořadí atributů
    const newAttributeOrder = Array.from(leftSideAttributes);
    const [removed] = newAttributeOrder.splice(result.source.index, 1);
    newAttributeOrder.splice(result.destination.index, 0, removed);

    // Aktualizujeme stav
    setLeftSideAttributes(newAttributeOrder);
    findRedundantAttributes();
  };

  const evaluationChoosenResult = () => {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checked = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    if (
      helperSetFunctionsInstance.subset(redundantAttributes, checked) &&
      helperSetFunctionsInstance.subset(checked, redundantAttributes)
    ) {
      Swal.fire({
        title: t("problem-redundantAttribute.resultTitle"),
        text: t("problem-redundantAttribute.choosenAttributesAreRedundant"),
        icon: "success",
        confirmButtonText: "Ok",
      });
    } else {
      Swal.fire({
        title: t("problem-redundantAttribute.resultTitle"),
        text: t("problem-redundantAttribute.choosenAttributesAreNotRedundant"),
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const fillAllAttributes = (side) => {
    if (side === "left") {
      setLeftSideAttributes([...attributes]);
    }
    if (side === "right") {
      setRightSideAttributes(
        attributeFunctionsInstance.attributeClosure(
          dependencies,
          leftSideAttributes
        )
      );
    }
  };

  const reverseAttributes = () => {
    const newAttributes = Array.from(leftSideAttributes).reverse();
    setLeftSideAttributes(newAttributes);
  };

  const mixRandomAttributes = () => {
    setLeftSideAttributes(
      attributeFunctionsInstance.mixRandomlyAttributes(leftSideAttributes)
    );
  };

  return (
    <>
      <div className="redundantAttribute-container">
        <div className="problemContainer">
          <h2>{t("problem-redundantAttribute.schema")}</h2>
          {attributes.length > 0 ? (
            <p className="IS">IS ( {showFunctionsInstance.attributesArrayToText(attributes)} )</p>
          ) : (
            <p>{t("problem-redundantAttribute.youWillSeeTheSchemaHere")}</p>
          )}

          <h2>{t("problem-redundantAttribute.dependencies")}</h2>
          <p className="dependencies">
            F ={" "}
            {`{ ${showFunctionsInstance.dependenciesArrayToText(
              dependencies
            )} }`}
          </p>
        </div>
        <h2 className="inputDependencyTitleText">
          {t("problem-redundantAttribute.inputDependency")}
        </h2>
        <div className="redundantAttribute-dependency">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="leftAttributes">
              <button
                className="fillAllAttributesBtn"
                onClick={() => fillAllAttributes("left")}
              >
                {t("global.fillAllAttributes")}
              </button>
              <button onClick={reverseAttributes} className="reverse_btn">
                {t("global.reverseAttributes")}
              </button>
              <button onClick={mixRandomAttributes} className="mixRandom_btn">
                {t("global.mixDependenciesRandomly")}
              </button>

              <Droppable droppableId="droppable" direction={dragDirection}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    className="attributesContainer"
                    ref={provided.innerRef}
                    style={{ display: "flex", overflow: "auto" }}
                  >
                    <div></div>

                    {leftSideAttributes.map((attr, index) => (
                      <Draggable key={attr} draggableId={attr} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="attributeTagContainer"
                          >
                            <span className="attributeTag">
                              <p className="text">{attr}</p>
                              <button
                                className="removeBtn"
                                onClick={() =>
                                  handleRemoveAttribute("left", attr)
                                }
                              >
                                x
                              </button>
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <select
                value="default"
                className="addAttrComboBox"
                onChange={(e) => handleAddAttribute("left", e.target.value)}
              >
                <option value="default" disabled>
                  {t("problem-redundantAttribute.addAttribute")}
                </option>
                {attributes.map(
                  (attr) =>
                    !leftSideAttributes.includes(attr) && (
                      <option key={attr} value={attr}>
                        {attr}
                      </option>
                    )
                )}
              </select>
            </div>
          </DragDropContext>

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
                {t("problem-redundantAttribute.addAttribute")}
              </option>
              {attributeFunctionsInstance
                .attributeClosure(dependencies, leftSideAttributes)
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

        <div className="buttons">
          <button
            className="btn_showRedundantAutomatically"
            onClick={() => showRedundantAttributes()}
          >
            {t("problem-redundantAttribute.showRedundantAttributes")}
          </button>
          <button
            className="btn_showRedundantManually"
            onClick={() => practiceRedundantAttributes()}
          >
            {t("problem-redundantAttribute.practice")}
          </button>
        </div>

        {isPracticing && (
          <div>
            <h3>
              {t("problem-redundantAttribute.selectAttrsToCheckRedundancy")}
            </h3>
            {leftSideAttributes.map((attr, index) => (
              <div key={index} className="checkBox">
                <input
                  type="checkbox"
                  id={`attr-${index}`}
                  name={attr}
                  value={attr}
                />
                <label htmlFor={`attr-${index}`} className="checkBox-label">
                  {attr}
                </label>
              </div>
            ))}
            <button
              className="btn_checkSelectedAttributes"
              onClick={() => evaluationChoosenResult()}
            >
              {t("problem-redundantAttribute.checkSelectedAttributes")}
            </button>
          </div>
        )}

        {openResultArea && (
          <div className="showRedundantAttributesResultArea">
            <h2>{t("problem-redundantAttribute.redundantAttributes")}</h2>
            <div className="area">
              {redundantAttributes.length > 0 ? (
                <p>{showFunctionsInstance.attributesArrayToText(redundantAttributes)}</p>
              ) : (
                <p>{t("problem-redundantAttribute.noRedundantAttributes")}</p>
              )}
            </div>

            <h2 className="underlineText">
              {t("problem-redundantAttribute.explanation")}
            </h2>
            <div className="explainArea">
              <p>
                {t("problem-redundantAttribute.explanation-Step1-part1")}
                <span> </span>
                <span
                  className="clickAbleText"
                  onClick={() => navigate("/problems/attributeClosure")}
                >
                  {t("global.attributeClosure")}
                </span>
                <span> </span>
                {t("problem-redundantAttribute.explanation-Step1-part2")}
              </p>
              <p>{t("problem-redundantAttribute.explanation-Step2")}</p>
              <p>{t("problem-redundantAttribute.explanation-Step3")}</p>
              <p>{t("problem-redundantAttribute.explanation-Step4")}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default RedundantAttribute;
