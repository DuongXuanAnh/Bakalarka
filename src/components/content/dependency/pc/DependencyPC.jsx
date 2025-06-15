import React from "react";
import { useNavigate } from "react-router-dom";
import { useAttributeContext } from "../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import "./dependencyPC.scss";

function DependencyPC() {
  const { t } = useTranslation();

  const { attributes } = useAttributeContext();
  const { dependencies, setDependencies } = useDependencyContext();

  const navigate = useNavigate();

  const handleAddDependency = () => {
    setDependencies([...dependencies, { left: [], right: [] }]);
  };

  const handleAddAttribute = (index, side, value) => {
    if (value === "default") return;
    const newDependencies = [...dependencies];
    newDependencies[index][side].push(value);
    setDependencies(newDependencies);
  };

  const backToInputAttributes = () => {
    navigate("/");
  };

  const handleSolveProblem = () => {
    let everythingOk = true;

    dependencies.map((dep) => {
      if (dep.left.length === 0 || dep.right.length === 0) {
        everythingOk = false;
        return;
      }
    });

    if (everythingOk) {
      navigate("/problems");
    } else {
      Swal.fire({
        icon: "warning",
        title: t("content-dependencies.unfinishedDependency"),
      });
    }
  };

  const handleRemoveAttribute = (depIndex, side, attrIndex) => {
    const newDependencies = [...dependencies];
    newDependencies[depIndex][side].splice(attrIndex, 1);
    setDependencies(newDependencies);
  };

  const handleRemoveDependency = (index) => {
    const newDependencies = [...dependencies];
    newDependencies.splice(index, 1);
    setDependencies(newDependencies);
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    const reorderedDependencies = reorder(
      dependencies,
      result.source.index,
      result.destination.index
    );
    setDependencies(reorderedDependencies);
  };

  const fillAllAttributes = (side, depIndex) => {
    const newDependencies = [...dependencies];
    if (side === "left") {
      newDependencies[depIndex].left = [...attributes];
    } else {
      newDependencies[depIndex].right = [...attributes];
    }
    setDependencies(newDependencies);
  };

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="dependencyContainer"
            >
              {dependencies.map((dep, depIndex) => (
                <Draggable
                  key={depIndex}
                  draggableId={`dep-${depIndex}`}
                  index={depIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="dependency"
                    >
                      <div className="leftAttributes">
                        {dep.left.map((attr, attrIndex) => (
                          <span key={attrIndex} className="attributeTag">
                            {attr}
                            <button
                              onClick={() =>
                                handleRemoveAttribute(
                                  depIndex,
                                  "left",
                                  attrIndex
                                )
                              }
                              className="removeBtn"
                            >
                              x
                            </button>
                          </span>
                        ))}
                        <select
                          value="default"
                          className="addAttrComboBox"
                          onChange={(e) =>
                            handleAddAttribute(depIndex, "left", e.target.value)
                          }
                        >
                          <option value="default" disabled>
                            {t("content-dependencies.option_addAttribute")}
                          </option>
                          {attributes
                            .filter((attr) => !dep.left.includes(attr))
                            .map((attr) => (
                              <option key={attr} value={attr}>
                                {attr}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="arrow">→</div>
                      <div className="rightAttributes">
                        <button
                          className="fillAllAttributesBtn"
                          onClick={() => fillAllAttributes("right", depIndex)}
                        >
                          {t("global.fillAllAttributes")}
                        </button>
                        {dep.right.map((attr, attrIndex) => (
                          <span key={attrIndex} className="attributeTag">
                            {attr}
                            <button
                              onClick={() =>
                                handleRemoveAttribute(
                                  depIndex,
                                  "right",
                                  attrIndex
                                )
                              }
                              className="removeBtn"
                            >
                              x
                            </button>
                          </span>
                        ))}
                        <select
                          value="default"
                          className="addAttrComboBox"
                          onChange={(e) =>
                            handleAddAttribute(
                              depIndex,
                              "right",
                              e.target.value
                            )
                          }
                        >
                          <option value="default" disabled>
                            {t("content-dependencies.option_addAttribute")}
                          </option>
                          {attributes
                            .filter((attr) => !dep.right.includes(attr))
                            .map((attr) => (
                              <option key={attr} value={attr}>
                                {attr}
                              </option>
                            ))}
                        </select>
                      </div>
                      <button
                        onClick={() => handleRemoveDependency(depIndex)}
                        className="removeDependencyBtn"
                      >
                        {t("content-dependencies.btn_removeDependency")}
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button className="addDependencyBtn" onClick={handleAddDependency}>
        {t("content-dependencies.addRelation")}
      </button>

      <button className="backToInputAttr_Btn" onClick={backToInputAttributes}>
        {t("content-dependencies.btn_backToInputAttributes")}
      </button>
      <button className="solveProblemBtn" onClick={handleSolveProblem}>
        {t("content-dependencies.btn_solveProblems")}
      </button>
    </div>
  );
}

export default DependencyPC;
