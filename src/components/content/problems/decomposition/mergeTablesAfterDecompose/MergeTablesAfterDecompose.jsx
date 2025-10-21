import React, { useState, useEffect } from "react";
import { NormalFormALG } from "../../../../../algorithm/NormalFormALG";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAttributeContext } from "../../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../../contexts/DependencyContext";
import Swal from "sweetalert2";
import { HelperColorFunctions } from "../../../../../algorithm/HelperColorFunctions";
import { useTranslation } from "react-i18next";
import "./mergeTablesAfterDecompose.scss";
import { CustomNodeFunctions } from "../../../../../algorithm/CustomNodeFunctions";
import { FPlusFunctions } from "../../../../../algorithm/FPlusFunctions";
import { FunctionalDependencyFunctions } from "../../../../../algorithm/FunctionalDependencyFunctions";
import { FindingKeysFunctions } from "../../../../../algorithm/FindingKeysFunctions";
import { ShowFunctions } from "../../../../../algorithm/ShowFunctions";
import { HelperSetFunctions } from "../../../../../algorithm/HelperSetFunctions";
import { AttributeFunctions } from "../../../../../algorithm/AttributeFunctions";

const CustomNodeFunctionsInstance = new CustomNodeFunctions();
const helperColorFunctionsInstance = new HelperColorFunctions();
const fPlusFunctionsInstance = new FPlusFunctions();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();
const findingKeysFunctionsInstance = new FindingKeysFunctions();
const showFunctionsInstance = new ShowFunctions();
const helperSetFunctionsInstance = new HelperSetFunctions();
const attributeFunctionsInstance = new AttributeFunctions();

function MergeTablesAfterDecompose({ tables, originKeys, lostFDs }) {
  const { t } = useTranslation();
  const normalFormInstance = new NormalFormALG();

  const { attributes } = useAttributeContext();
  const { dependencies, setDependencies } = useDependencyContext();

  const [tablesInfo, setTablesInfo] = useState(tables);
  const [lostFDsInfo, setLostFDsInfo] = useState(lostFDs);
  const [draggingOverIndex, setDraggingOverIndex] = useState(null);
  const [draggingItemIndex, setDraggingItemIndex] = useState(null);

  const fPlus = fPlusFunctionsInstance.FPlus(dependencies, attributes);
  const singleRHS_fPlus =
    functionalDependencyFunctionsInstance.rewriteFDSingleRHS(fPlus);

  useEffect(() => {
    setTablesInfo(tables);
    setLostFDsInfo(lostFDs);
  }, [tables, lostFDs]);

  const onDragTableStart = (start) => {
    setDraggingItemIndex(start.source.index);
    setDraggingOverIndex(null);
  };

  const onDragUpdate = (update) => {
    setDraggingOverIndex(update.destination ? update.destination.index : null);
  };

  const onDragEndTables = (result) => {
    const { source, destination } = result;
    setDraggingOverIndex(null);
    setDraggingItemIndex(null);

    if (!destination || destination.index === source.index) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index !== destination.index
    ) {
      const sourceItem = tablesInfo[source.index];
      const destinationItem = tablesInfo[destination.index];

      if (
        helperSetFunctionsInstance.subset(
          sourceItem.data.attributes,
          destinationItem.data.attributes
        ) ||
        helperSetFunctionsInstance.subset(
          destinationItem.data.attributes,
          sourceItem.data.attributes
        ) ||
        sourceItem.data.keys.some((K1) =>
          destinationItem.data.keys.some(
            (K2) =>
              functionalDependencyFunctionsInstance.isDependencyInClosure(
                singleRHS_fPlus,
                K1,
                K2
              ) &&
              functionalDependencyFunctionsInstance.isDependencyInClosure(
                singleRHS_fPlus,
                K2,
                K1
              )
          )
        )
      ) {
      //const mergedValue = mergeTables(sourceItem, destinationItem);
        const mergedValue = CustomNodeFunctionsInstance.mergeTables(sourceItem, destinationItem, singleRHS_fPlus);

        if (mergedValue.data.normalForm === "BCNF" || mergedValue.data.normalForm === "3") {
          const newTablesInfo = [...tablesInfo];
          newTablesInfo[destination.index] = mergedValue;
          newTablesInfo.splice(source.index, 1);
          setTablesInfo(newTablesInfo);

          setLostFDsInfo(
            functionalDependencyFunctionsInstance.lostDependencies(
              lostFDsInfo, // previously lost FDs // MKOP 2025/10/02 would work even for non-canonical set of FDs
              newTablesInfo.map((table) => table.data.FDs).flat() // tablesFDs  // new FDs - some originaly FDs may be derivable now and some are still lost
              // MKOP 2025/09/23 canonical Fplus is not needed, attributeClosure will be the same
              )
            );

          Swal.fire({
            icon: "success",
            title: t("problem-synthesis.TablesAreMergedTitle"),
            text: t("problem-synthesis.TablesAreMergedSuccessfully"),
          });
        } else {
          Swal.fire({
            icon: "error",
            title: t("problem-synthesis.CanNotMerge"),
            text: t("problem-synthesis.CanNotMerge-reason1", {
              normalForm: mergedValue.data.normalForm,
            }),
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: t("problem-synthesis.CanNotMerge"),
          text: t("problem-synthesis.CanNotMerge-reason2"),
        });
      }
    }
  };

  const addLostDependency = (fd) => {

    const newAttr = [...fd.left, ...fd.right]; 
    const newNode = CustomNodeFunctionsInstance.initNode(
      newAttr,
      singleRHS_fPlus,
      showFunctionsInstance.attributesArrayToText(newAttr)
      );
    const newTablesInfo = [...tablesInfo];
    newTablesInfo.push(newNode);
    setTablesInfo(newTablesInfo);

    setLostFDsInfo(
      functionalDependencyFunctionsInstance.lostDependencies(
        lostFDsInfo, // previously lost FDs // MKOP 2025/10/02 would work even for non-canonical set of FDs
        newTablesInfo.map((table) => table.data.FDs).flat() // tablesFDs  // new FDs - some originaly FDs may be derivable now and some are still lost
        // MKOP 2025/09/23 canonical Fplus is not needed, attributeClosure will be the same
        )
      );
  };
  
  let practiceMode = localStorage.getItem("practiceMode");
  practiceMode = practiceMode !== null ? JSON.parse(practiceMode) : false; 

  CustomNodeFunctionsInstance.highlightSubsetNodes(tablesInfo, false);

  return (
    <div className="mergeTablesAfterDecompose-container">
      <div className="Tables">
        <DragDropContext
          onDragStart={onDragTableStart}
          onDragUpdate={onDragUpdate}
          onDragEnd={onDragEndTables}
        >
          <Droppable droppableId="droppableTables">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {tablesInfo.map((table, index) => (
                  <Draggable
                    key={table.id}
                    draggableId={`table${table.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`table ${
                          table.isSubset ? "SubsetTable" : ""
                        }`}
                        style={{
                          userSelect: "none",
                          padding: 16,
                          margin: "0 0 8px 0",
                          backgroundColor:
                            index === draggingOverIndex &&
                            index !== draggingItemIndex
                              ? "#ccc"
                              : helperColorFunctionsInstance.nodeBackgroundColor(
                                  table.data.normalForm,
                                  practiceMode /*false*/ /*practiceMode*/
                                ),
                          border: "1px solid #ddd",
                          transform: snapshot.isDragging
                            ? provided.draggableProps.style.transform
                            : "none",
                        }}
                      >
                        <div>
                          <p className="tableAttrs">
                            ({showFunctionsInstance.attributesArrayToText(table.data.attributes)})
                          </p>
                          <p className="tableKeys">
                            {t("problem-synthesis.keys")}: [{" "}
                            {showFunctionsInstance.showKeysAsText(
                              table.data.keys
                            )}{" "}
                            ]
                          </p>
                          {table.isSubset && (
                            <p>
                              {
                                <span className="note" style={{ color: "red" }}>
                                  {t("mergeTablesAfterDecompose.isSubsetOf", {
                                    table: showFunctionsInstance.showKeysAsText(
                                      table.subsetOf
                                    ),
                                  })}
                                </span>
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="modal-middle">
        <b>{t("problem-decomposition.lostDependencies")}</b>
        <div className="lostDependencies">
          {lostFDsInfo.length > 0 ? (
            <ul>
              {lostFDsInfo.map((fd, index) => {
                const typeNF = normalFormInstance.normalFormType(
                  fPlusFunctionsInstance.FPlus(dependencies, [
                    ...fd.left,
                    ...fd.right,
                  ]),
                  [...fd.left, ...fd.right]
                ).type;
                return (
                  <li key={index}>
                    {showFunctionsInstance.showTextDependencyWithArrow(fd)}
                    <button
                      className="addButton"
                      style={{
                        backgroundColor: helperColorFunctionsInstance.nodeBackgroundColor(
                          typeNF,
                          practiceMode /*false*/ /*practiceMode*/
                        ),
                        border: "none",
                      }}
                      onClick={() => addLostDependency(fd)}
                    >
                      {t("mergeTablesAfterDecompose.addRelation")}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>{t("problem-decomposition.noLostDependencies")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

//<div>
//<p hidden="hidden">a) {JSON.stringify(tablesInfo)}</p>
//</div>


export default MergeTablesAfterDecompose;
