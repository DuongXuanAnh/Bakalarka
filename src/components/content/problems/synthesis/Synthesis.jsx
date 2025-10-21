import React, { useState, useEffect } from "react";
import { useAttributeContext } from "../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Swal from "sweetalert2";
import ReactModal from "react-modal";
import { CustomNodeFunctions } from "../../../../algorithm/CustomNodeFunctions";
import { HelperColorFunctions } from "../../../../algorithm/HelperColorFunctions";
import { useTranslation } from "react-i18next";
import "./synthesis.scss";
import { FunctionalDependencyFunctions } from "../../../../algorithm/FunctionalDependencyFunctions";
import { HelperSetFunctions } from "../../../../algorithm/HelperSetFunctions";
import { FPlusFunctions } from "../../../../algorithm/FPlusFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";
import { FindingKeysFunctions } from "../../../../algorithm/FindingKeysFunctions";

const CustomNodeFunctionsInstance = new CustomNodeFunctions();
const helperColorFunctionsInstance = new HelperColorFunctions();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();
const helperSetFunctionsInstance = new HelperSetFunctions();
const fPlusFunctionsInstance = new FPlusFunctions();
const showFunctionsInstance = new ShowFunctions();
const findingKeysFunctionsInstance = new FindingKeysFunctions();

function Synthesis() {
  const { t } = useTranslation();

  const { attributes } = useAttributeContext();
  const { dependencies } = useDependencyContext();

  const initialRewrittenFDs =
    functionalDependencyFunctionsInstance.rewriteFDSingleRHS(dependencies);

  const [rewrittenFDs, setRewrittenFDs] = useState(initialRewrittenFDs);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tablesInfo, setTablesInfo] = useState([
    // MKOP it seems that an empty array works as well
    //{
    //  id: "",
    //  isSubset: false,       // MKOP newly initialized
    //  subsetOf: [],          // MKOP new
    //  data: {
    //    attributes: [],      // MKOP moved to data
    //    FDs: [],             // MKOP moved to data
    //    keys: [],            // MKOP moved to data
    //    normalForm: "",      // MKOP moved to data from normalForm.type
    //    faultyFDs: [],       // MKOP moved to data from normalForm.faultyDependencies
    //  },
    //},
  ]);

  const [draggingOverIndex, setDraggingOverIndex] = useState(null);
  const [draggingItemIndex, setDraggingItemIndex] = useState(null); // Store the index of the currently dragged item

  const onDragTableStart = (start) => {
    setDraggingItemIndex(start.source.index); // Set the index of the dragged item
    setDraggingOverIndex(null);
  };

  const onDragUpdate = (update) => {
    setDraggingOverIndex(update.destination ? update.destination.index : null);
  };

  const [modalContent, setModalContent] = useState(() =>
    CustomNodeFunctionsInstance.emptyNode()
  );

  const fPlus = fPlusFunctionsInstance.FPlus(dependencies, attributes);

  const singleRHS_fPlus =
    functionalDependencyFunctionsInstance.rewriteFDSingleRHS(fPlus);

  // Remove trivial FDs (those where the RHS is also in the LHS)
  const nonTrivial_FDs =
    functionalDependencyFunctionsInstance.removeTrivialFDs(rewrittenFDs);

  // Minimize LHS of each FD.
  const minimizeLHS_FDs =
    functionalDependencyFunctionsInstance.minimizeLHS(nonTrivial_FDs);
  const removeRedundant_FDs =
    functionalDependencyFunctionsInstance.removeRedundantFDs(minimizeLHS_FDs);

  const originKeys = findingKeysFunctionsInstance.getAllKeys(
    singleRHS_fPlus,
    attributes
  );

  // Transform FDs to condensed form G'
  const transformFDsToCondensedForm = (fds) => {
    // Akumulace FD seskupených podle jejich LHS
    const groupedFDs = fds.reduce((accumulator, currentFD) => {
      // Vytvoří unikátní klíč z LHS spojením prvků pole čárkou
      const key = currentFD.left.join(",");
      // Inicializuje množinu pro znaky na RHS, pokud tato LHS nebyla ještě viděna
      if (!accumulator[key]) {
        accumulator[key] = new Set();
      }
      // Přidá všechny znaky z RHS do množiny, čímž zajišťuje jejich unikátnost
      currentFD.right.forEach((char) => accumulator[key].add(char));
      return accumulator;
    }, {});

    // Převede seskupené FD do požadovaného formátu pole
    return Object.entries(groupedFDs).map(([lhs, rhsChars]) => ({
      // Rozdělí LHS zpět na pole
      left: lhs.split(","),
      // Převede množinu znaků na RHS do seřazeného pole
      right: Array.from(rhsChars).sort(),
    }));
  };

  const condensedFDs = transformFDsToCondensedForm(removeRedundant_FDs);

  const checkIfTablesContainOriginKey = () => {
    const normalizedOriginKeys = originKeys.map((key) => key.sort());
    // Prochází všechny tabulky
    for (const table of tablesInfo) {
      // Prochází všechny klíče v dané tabulce
      for (const keys of table.data.keys) {
        // Normalizace aktuálního klíče tabulky tím, že jej seřadíme
        const normalizedKeys = [...keys].sort();

        // Kontrola, zda se normalizovaný klíč tabulky shoduje s některým z normalizovaných originKeys
        for (const normalizedOriginKey of normalizedOriginKeys) {
          // Pokud mají stejnou délku a všechny prvky jsou shodné (bez ohledu na pořadí)
          if (
            normalizedKeys.length === normalizedOriginKey.length &&
            normalizedKeys.every(
              (element, index) => element === normalizedOriginKey[index]
            )
          ) {
            return true; // Klíč byl nalezen v tabulce
          }
        }
      }
    }
    // Žádná tabulka neobsahuje klíč
    return false;
  };

  const onDragEndDependencies = (result) => {
    if (!result.destination) {
      return;
    }

    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    const reorderedFDs = reorder(
      rewrittenFDs,
      result.source.index,
      result.destination.index
    );
    setRewrittenFDs(reorderedFDs);
  };

  const reverseDependencies = () => {
    setRewrittenFDs((prevDeps) => [...prevDeps].reverse());
  };

  const mixRandomDependencies = () => {
    setRewrittenFDs((prevFDs) => {
      // Copy the array to a new variable
      let array = [...prevFDs];
      for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements array[i] and array[j]
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    });
  };

  useEffect(() => {
    setTablesInfo([]);
    const newTablesInfo = condensedFDs.map((fd, index) => {
      //    let attrs = [...fd.left, ...fd.right];
      //
      //    const FDs = functionalDependencyFunctionsInstance.getAllDependenciesDependsOnAttr(attrs, singleRHS_fPlus);
      //    const keys = findingKeysFunctionsInstance.getAllKeys(FDs, attrs);
      //    const normalForm = normalFormInstance.normalFormType(FDs, attrs);
      //
      //    return  {
      //      id: index.toString(),
      //      data: {
      //        attributes: attrs,
      //        FDs: FDs,
      //        keys: keys,
      //        normalForm: normalForm.type,
      //        faultyFDs: normalForm.faultyDependencies,
      //      },
      //    };

      const newAttr = [...fd.left, ...fd.right];

      const retVal = CustomNodeFunctionsInstance.initNode(
        newAttr,
        singleRHS_fPlus,
        index.toString()
      );
      return retVal;
    });

    // Přidání nově vypočítaných informací do stávajícího stavu tablesInfo
    setTablesInfo((prevTablesInfo) => [...prevTablesInfo, ...newTablesInfo]);
  }, [rewrittenFDs]);

  CustomNodeFunctionsInstance.highlightSubsetNodes(tablesInfo, false);

  const showInformationModal = (table) => {
    setIsModalOpen(true);
    setModalContent(table);
  };

  const onDragEndTables = (result) => {
    const { source, destination } = result;
    setDraggingOverIndex(null); // Reset dragging over index
    setDraggingItemIndex(null); // Reset dragging item index

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
        const mergedValue = CustomNodeFunctionsInstance.mergeTables(
          sourceItem,
          destinationItem,
          singleRHS_fPlus
        );

        if (
          mergedValue.data.normalForm === "BCNF" ||
          mergedValue.data.normalForm === "3"
        ) {
          const newTablesInfo = [...tablesInfo];
          newTablesInfo[destination.index] = mergedValue;
          newTablesInfo.splice(source.index, 1);
          setTablesInfo(newTablesInfo);

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

  return (
    <div className="systhesis-container">
      <div className="dragDependenciesArea">
        <div className="note">{t("problem-synthesis.note1")}</div>
        <button onClick={reverseDependencies} className="reverse_btn">
          {t("problem-synthesis.reverseDependencies")}
        </button>
        <button onClick={mixRandomDependencies} className="mixRandom_btn">
          {t("global.mixDependenciesRandomly")}
        </button>
        <DragDropContext onDragEnd={onDragEndDependencies}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="functionalDependenciesContainer"
              >
                {rewrittenFDs.map((fd, index) => (
                  <Draggable
                    key={index}
                    draggableId={`fd-${index}`}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="functionalDependency"
                      >
                        {showFunctionsInstance.showTextDependencyWithArrow(fd)}
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

      <div className="systhesisResultArea">
        <div className="MinimalCoverFinalResult">
          <h3>
            <u>{t("problem-synthesis.minimalCover")}</u>
          </h3>
          <div className="MinimalCover">
            G ={" "}
            {`{ ${showFunctionsInstance.dependenciesArrayToText(
              removeRedundant_FDs
            )} }`}
          </div>
        </div>

        <div className="MinimalCoverAfterEdit">
          <h3>
            <u>{t("problem-synthesis.minimalCoverAfterMerge")}</u>
          </h3>
          <div className="MinimalCoverCondensed">
            G' ={" "}
            {`{ ${showFunctionsInstance.dependenciesArrayToText(
              condensedFDs
            )} }`}
          </div>
        </div>

        <div className="originalKeys">
          <h3>
            <u>{t("problem-synthesis.allKeys")}</u>: [{" "}
            {showFunctionsInstance.showKeysAsText(originKeys)} ]
          </h3>
        </div>

        <div className="Tables">
          <h3>{t("problem-synthesis.explainText1")}</h3>
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
                      key={tablesInfo[index].id}
                      draggableId={`table${tablesInfo[index].id}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`TableButton ${
                            table.isSubset ? "SubsetTable" : ""
                          }`}
                          disabled={table.isSubset}
                          onClick={() => {
                            showInformationModal(table);
                          }}
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
                                    false
                                  ),
                            border: "1px solid #ddd",
                            ...provided.draggableProps.style,
                            transform: snapshot.isDragging
                              ? provided.draggableProps.style.transform
                              : "none",
                          }}
                        >
                          <div>
                            <p>
                              {t("problem-synthesis.table")} {index + 1}:
                            </p>
                            <p>
                              R{index + 1}(
                              {showFunctionsInstance.attributesArrayToText(
                                table.data.attributes
                              )}
                              )
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
                                  <span
                                    className="note"
                                    style={{ color: "red" }}
                                  >
                                    {t(
                                      "problem-synthesis.unnecessaryTableSubet",
                                      {
                                        index1: index + 1,
                                        index2: table.subsetOfIndex + 1,
                                      }
                                    )}
                                    .
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
                  {!checkIfTablesContainOriginKey() && (
                    <div
                      className="TableButton"
                      style={{
                        userSelect: "none",
                        padding: 16,
                        margin: "0 0 8px 0",
                        backgroundColor:
                          helperColorFunctionsInstance.nodeBackgroundColor(
                            "BCNF",
                            false
                          ),
                        border: "1px solid #ddd",
                        transform: "none",
                      }}
                    >
                      <p>
                        {t("problem-synthesis.table")} {tablesInfo.length + 1}:
                      </p>
                      R{tablesInfo.length + 1} (
                      {showFunctionsInstance.attributesArrayToText(
                        originKeys[0]
                      )}
                      )
                      <p className="tableKeys">
                        {t("problem-synthesis.keys")}: [{" "}
                        {"{" +
                          showFunctionsInstance.attributesArrayToText(
                            originKeys[0]
                          ) +
                          "}"}{" "}
                        ]
                      </p>
                      <p>
                        {
                          <span className="note" style={{ color: "red" }}>
                            {t(
                              "problem-synthesis.noteText_originKeyNotContained"
                            )}
                          </span>
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="custom-modal"
      >
        <div className="modal-header">
          <h2 className="black">{t("problem-synthesis.tableDetail")}</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="close-button"
          >
            X
          </button>
        </div>

        <div className="modal-content">
          {modalContent && (
            <>
              <p>
                <b>{t("problem-synthesis.attributes")}:</b>{" "}
                {modalContent.data.label}
              </p>
              <p>
                <b>{t("problem-synthesis.keys")}:</b>{" "}
                {showFunctionsInstance.showKeysAsText(
                  modalContent.data.keys
                )}{" "}
              </p>
              <p>
                <b>{t("problem-synthesis.normalForm")}:</b>{" "}
                 {modalContent.data.normalForm === "BCNF"
                   ? "BCNF"
                   : modalContent.data.normalForm + " NF"}
              </p>
            </>
          )}
        </div>

        <div className="modal-middle">
          {modalContent && (
            <>
              <p>
                <b>{t("problem-synthesis.dependencies")}:</b>{" "}
              </p>
                {functionalDependencyFunctionsInstance
                  .mergeSingleRHSFDs(modalContent.data.FDs)
                  .map((dependency, index) => {
                    return (
                      <p key={index}>
                        {showFunctionsInstance.showTextDependencyWithArrow(
                          dependency
                        )}
                      </p>
                    );
                  })}
              </>
            )}
        </div>

        <div className="modal-middle">
          {modalContent && modalContent.data.faultyFDs.length > 0 && (
            <>
              <div>
                <b>{t("problem-synthesis.unwantedDependencies")}:</b>{" "}
                <ul>
                  {modalContent.data.faultyFDs.map(
                    (faultyDependency, index) => (
                      <li key={index}>
                        {showFunctionsInstance.showTextDependencyWithArrow(
                          faultyDependency.dependency
                        )}{" "}
                        - {t("problem-synthesis.violates")} {faultyDependency.violates}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </ReactModal>
    </div>
  );
}

export default Synthesis;
