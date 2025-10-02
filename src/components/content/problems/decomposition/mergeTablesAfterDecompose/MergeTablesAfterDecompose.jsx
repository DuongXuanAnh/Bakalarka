import React, { useState, useEffect } from "react";
import { NormalFormALG } from "../../../../../algorithm/NormalFormALG";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useAttributeContext } from "../../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../../contexts/DependencyContext";
import Swal from "sweetalert2";
import { HelperColorFunctions } from "../../../../../algorithm/HelperColorFunctions";
import { useTranslation } from "react-i18next";
import "./mergeTablesAfterDecompose.scss";
import { FPlusFunctions } from "../../../../../algorithm/FPlusFunctions";
import { FunctionalDependencyFunctions } from "../../../../../algorithm/FunctionalDependencyFunctions";
import { FindingKeysFunctions } from "../../../../../algorithm/FindingKeysFunctions";
import { ShowFunctions } from "../../../../../algorithm/ShowFunctions";
import { HelperSetFunctions } from "../../../../../algorithm/HelperSetFunctions";
import { AttributeFunctions } from "../../../../../algorithm/AttributeFunctions";

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

  const getValidDependenciesFromFplus = (attr) => {
    let dependenciesDependsOnAttr = [];
    for (let i = 0; i < singleRHS_fPlus.length; i++) {
      let leftSideValid = singleRHS_fPlus[i].left.every((element) =>
        attr.includes(element)
      );
      let rightSideValid = singleRHS_fPlus[i].right.every((element) =>
        attr.includes(element)
      );

      if (leftSideValid && rightSideValid) {
        dependenciesDependsOnAttr.push(singleRHS_fPlus[i]);
      }
    }
    return dependenciesDependsOnAttr;
  };

  function mergeTables(table1, table2) {
    const mergedAttributes = Array.from(
      new Set([...table1.data.originalAttr, ...table2.data.originalAttr])
    );
    const FDs = getValidDependenciesFromFplus(mergedAttributes);
    const keys = findingKeysFunctionsInstance.getAllKeys(FDs, mergedAttributes);
    const normalForm = normalFormInstance.normalFormType(FDs, mergedAttributes);

    const mergedTable = {
      id: table1.id,
      data: {
        originalAttr: mergedAttributes,
        candidateKeys: keys,
        FDs: FDs,
        type: normalForm.type,
        faultyDependencies: normalForm.faultyDependencies,
      },
    };

    return mergedTable;
  }

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
          sourceItem.data.originalAttr,
          destinationItem.data.originalAttr
        ) ||
        helperSetFunctionsInstance.subset(
          destinationItem.data.originalAttr,
          sourceItem.data.originalAttr
        ) ||
        sourceItem.data.candidateKeys.some((K1) =>
          destinationItem.data.candidateKeys.some(
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
        const mergedValue = mergeTables(sourceItem, destinationItem);

        if (mergedValue.data.type === "BCNF" || mergedValue.data.type === "3") {
          const newTablesInfo = [...tablesInfo];
          newTablesInfo[destination.index] = mergedValue;
          newTablesInfo.splice(source.index, 1);
          setTablesInfo(newTablesInfo);

//        let tablesFDs = [];
//        newTablesInfo.forEach((table) => {
//          tablesFDs.push(...table.data.FDs);
//        });
          
//        const newFplus = fPlusFunctionsInstance.FPlus(tablesFDs, attributes);
//        const newFplusSingleRHS =
//          functionalDependencyFunctionsInstance.rewriteFDSingleRHS(newFplus);
//        let newLostFDs = [...lostFDsInfo];
//        newLostFDs.forEach((fd) => {
//          const attrClosure = attributeFunctionsInstance.attributeClosure(
//            newFplusSingleRHS,
//            fd.left
//          );
//          if (attrClosure.includes(fd.right[0])) {
//            newLostFDs = newLostFDs.filter((item) => item !== fd);
//          }
//        });
//        setLostFDsInfo(newLostFDs);
          
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
              normalForm: mergedValue.data.type,
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

  const getAllDependenciesDependsOnAttr = (attr) => {
    let dependenciesDependsOnAttr = [];
    for (let i = 0; i < singleRHS_fPlus.length; i++) {
      // Zkontrolujeme, že všechny prvky na levé i pravé straně jsou obsaženy v `attr`
      let leftSideValid = singleRHS_fPlus[i].left.every((element) =>
        attr.includes(element)
      );
      let rightSideValid = singleRHS_fPlus[i].right.every((element) =>
        attr.includes(element)
      );

      if (leftSideValid && rightSideValid) {
        dependenciesDependsOnAttr.push(singleRHS_fPlus[i]);
      }
    }

    return dependenciesDependsOnAttr;
  };

  const nodeData = (attr) => {
    const fPlus = getAllDependenciesDependsOnAttr(attr);
    const normalFormType = normalFormInstance.normalFormType(fPlus, attr);
    const candidateKeys = findingKeysFunctionsInstance.getAllKeys(fPlus, attr);
    let data = {
      originalAttr: attr,
      label: attr.join(", "),
      keys: showFunctionsInstance.showKeysAsText(candidateKeys),
      FDs: fPlus,
      type: normalFormType.type,
      faultyDependencies: normalFormType.faultyDependencies,
      candidateKeys: candidateKeys,
      subsetOf: [],
    };

    return data;
  };

  const addLostDependency = (fd) => {
    const dataNode = nodeData([...fd.left, ...fd.right]);
    const position = { x: 0, y: 0 };
    const newNode = {
      id: dataNode.label,
      type: "customNode",
      data: dataNode,
      position,
    };
    const newTablesInfo = [...tablesInfo];
    newTablesInfo.push(newNode);
    setTablesInfo(newTablesInfo);

//  let tablesFDs = [];
//  newTablesInfo.forEach((table) => {
//    tablesFDs.push(...table.data.FDs);
//  });
    
//  const newFplus = fPlusFunctionsInstance.FPlus(tablesFDs, attributes);
//  const newFplusSingleRHS =
//    functionalDependencyFunctionsInstance.rewriteFDSingleRHS(newFplus);
//  let newLostFDs = [...lostFDsInfo];
//  newLostFDs.forEach((fd) => {
//    const attrClosure = attributeFunctionsInstance.attributeClosure(
//      newFplusSingleRHS,
//      fd.left
//    );
//    if (attrClosure.includes(fd.right[0])) {
//      newLostFDs = newLostFDs.filter((item) => item !== fd);
//    }
//  });
//  setLostFDsInfo(newLostFDs);

    setLostFDsInfo(
      functionalDependencyFunctionsInstance.lostDependencies(
        lostFDsInfo, // previously lost FDs // MKOP 2025/10/02 would work even for non-canonical set of FDs
        newTablesInfo.map((table) => table.data.FDs).flat() // tablesFDs  // new FDs - some originaly FDs may be derivable now and some are still lost
        // MKOP 2025/09/23 canonical Fplus is not needed, attributeClosure will be the same
        )
      );
  };

  // Přidání logiky pro označení nadbytečných tabulek
  const markRedundantTables = () => {
    return tablesInfo.map((table, index) => {
      let isSubset = false;
      let longestSubsets = [];
      let maxLength = 0;

      tablesInfo.forEach((otherTable, otherIndex) => {
        if ( helperSetFunctionsInstance.isRedundant(
               table.data.originalAttr, index,
               otherTable.data.originalAttr, otherIndex
               )   
        ) {
          isSubset = true;
          const length = otherTable.data.originalAttr.length;
          if (length > maxLength) {
            maxLength = length;
            longestSubsets = [otherTable.data.originalAttr];
          } else if (length === maxLength) {
            longestSubsets.push(otherTable.data.originalAttr);
          }
        }
      });

      return {
        ...table,
        isSubset,
        subsetOf: longestSubsets,
      };
    });
  };

  const enrichedTablesInfo = markRedundantTables();

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
                {enrichedTablesInfo.map((table, index) => (
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
                                  table.data.type,
                                  false /*practiceMode*/
                                ),
                          border: "1px solid #ddd",
                          transform: snapshot.isDragging
                            ? provided.draggableProps.style.transform
                            : "none",
                        }}
                      >
                        <div>
                          <p className="tableAttrs">
                            ({table.data.originalAttr.join(",")})
                          </p>
                          <p className="tableKeys">
                            {t("problem-synthesis.keys")}: [{" "}
                            {showFunctionsInstance.showKeysAsText(
                              table.data.candidateKeys
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
                          false /*practiceMode*/
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

export default MergeTablesAfterDecompose;
