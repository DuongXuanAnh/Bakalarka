import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { NormalFormALG } from "./NormalFormALG";
import { HelperColorFunctions } from "./HelperColorFunctions";
import { HelperSetFunctions } from "./HelperSetFunctions";
import { Trans, useTranslation } from "react-i18next";
import { ShowFunctions } from "./ShowFunctions";
import { FunctionalDependencyFunctions } from "./FunctionalDependencyFunctions";
import { FindingKeysFunctions } from "./FindingKeysFunctions";

const normalFormInstance = new NormalFormALG();
const helperColorFunctionsInstance = new HelperColorFunctions();
const helperSetFunctionsInstance = new HelperSetFunctions();
const showFunctionsInstance = new ShowFunctions();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();
const findingKeysFunctionsInstance = new FindingKeysFunctions();

// MKOP 2025/10/06
// Note: object.hasOwnProperty("propName")
// class node{
//   id: String,  ... Node ID ... "1", "2", ...
//   type: String, ... "customNode"
//   isSubset: Boolean, ... Is this node a subset of another node T/F?
//   subsetOfIndex: Integer, ... Zero-based index of the node this one is subset of
//   subsetOf: Array of Array of String, ... Set of longest nodes this one is a subset of ... TODO: Used by MergeTablesAfterDecompose.jsx, not by Decomposition.jsx.
//   data { // calss node.data
//     attributes: Array of String, ... Set of attributes
//     label: String, ... Text representation of attributes
//     FDs: Array of object {left: Array of String, right: Array of String}, ... functional dependencies (??? in canonical form ???)
//     keys: Array of Array of String, ... Set of all keys of the node, originally candidateKeys in Decomposition.jsx, keys in Synthesis.jsx
//     keysLabel: String, ... Text representation of keys, originally keys in Decomposition.jsx
//     normalForm: String, ... "1", "2", "3", "BCNF" ... (originally type)
//     faultyFDs: Array of object {
//       dependency: {left: Array of String, right: Array of String}, // TODO: check if it is correct
//       violates: String, ... "2NF", "3NF", "BCNF"
//       }, ... faulty functional dependencies (??? in canonical form ???) ... (originally faultyDependencies)
//     subsetOf: Array of Array of String, ... Set of longest nodes this one is a subset of ... TODO: Used by Decomposition.jsx. Move to node, not keep in data
//     }
//   }

export class CustomNodeFunctions {
  constructor() {
    // CustomNode functions
    this.emptyNodeData = this.emptyNodeData.bind(this);
    this.initNodeData = this.initNodeData.bind(this);
    this.emptyNode = this.emptyNode.bind(this);
    this.initNode = this.initNode.bind(this);
    this.mergeTables = this.mergeTables.bind(this);
    this.highlightSubsetNodes = this.highlightSubsetNodes.bind(this);
    this.UiModalNodeInfo_Header = this.UiModalNodeInfo_Header.bind(this);
    this.UiModalNodeInfo_AttrsKeysNF =
      this.UiModalNodeInfo_AttrsKeysNF.bind(this);
    this.UiModalNodeInfo_FDs = this.UiModalNodeInfo_FDs.bind(this);
    this.UiModalNodeInfo_FaultyFDs = this.UiModalNodeInfo_FaultyFDs.bind(this);
    this.UiModalNodeActions_FaultyFDs =
      this.UiModalNodeActions_FaultyFDs.bind(this);
    this.UiModalNodePractice_NF = this.UiModalNodePractice_NF.bind(this);
  }

  emptyNodeData = () => {
    let data = {
      attributes: [],
      label: showFunctionsInstance.attributesArrayToText([]),
      FDs: [],
      keys: [],
      keysLabel: showFunctionsInstance.showKeysAsText([]),
      normalForm: "",
      faultyFDs: [],
      subsetOf: [],
    };

    return data;
  };

  initNodeData = (attr, fPlusOrig) => {
    const fPlus =
      functionalDependencyFunctionsInstance.getAllDependenciesDependsOnAttr(
        attr,
        fPlusOrig
      );
    const normalForm = normalFormInstance.normalFormType(fPlus, attr);
    const keys = findingKeysFunctionsInstance.getAllKeys(fPlus, attr);
    let data = {
      attributes: attr,
      label: showFunctionsInstance.attributesArrayToText(attr),
      FDs: fPlus,
      keys: keys,
      keysLabel: showFunctionsInstance.showKeysAsText(keys),
      normalForm: normalForm.type,
      faultyFDs: normalForm.faultyDependencies,
      subsetOf: [],
    };

    return data;
  };

  emptyNode = () => {
    const nodeData = this.emptyNodeData();
    const position = { x: 0, y: 0 };

    const node = {
      id: "",
      type: "customNode",
      isSubset: false,
      subsetOf: [],
      data: nodeData,
      position,
    };
    return node;
  };

  initNode = (attr, fPlusOrig, id) => {
    const nodeData = this.initNodeData(attr, fPlusOrig);
    const position = { x: 0, y: 0 };

    const node = {
      id: id, // MKOP 2025/10/08 was "1"
      type: "customNode",
      isSubset: false, // MKOP newly initialized
      subsetOf: [], // MKOP new
      data: nodeData,
      position,
    };
    return node;
  };

  // MKOP 2025/10/09 mpved from MergeTablesAfterDecompose and simplified
  mergeTables(table1, table2, fPlusOrig) {
    const attr = Array.from(
      new Set([...table1.data.attributes, ...table2.data.attributes])
    );

    return this.initNode(attr, fPlusOrig, table1.id);
  }

  // MKOP 2025/10/04 Rewritten to match to Synthesis code as much as possible
  // MKOP 2025/10/06 Rewritten to unify code in Synthesis, Decomposition and MergeTablesAfterDecompose
  // MKOP 2025/10/06 Moved to CustomNodeFunctiosn.jsx
  highlightSubsetNodes = (tablesInfo, onlyBCNF = false) => {
    tablesInfo.forEach((table, index) => {
      let isSubset = false;
      let subsetOfIndex = null;
      let longestSubsets = [];
      let maxLength = 0;

      tablesInfo.forEach((otherTable, otherIndex) => {
        // Skip non-BCNF tables in Decomposition tree
        if (
          onlyBCNF &&
          (table.data.normalForm !== "BCNF" ||
            otherTable.data.normalForm !== "BCNF")
        )
          return;

        const tableAttributes = table.data.attributes;
        const otherAttributes = otherTable.data.attributes;
        if (
          helperSetFunctionsInstance.isRedundant(
            tableAttributes,
            index,
            otherAttributes,
            otherIndex
          )
        ) {
          isSubset = true;
          // MKOP 2025/10/03 Synthesis uses index
          subsetOfIndex = otherIndex; // Uložení indexu nadřazené tabulky
          // MKOP 2025/10/03 Decomposition uses longestSubsets array
          const length = otherAttributes.length;
          if (length > maxLength) {
            maxLength = length;
            longestSubsets = [otherAttributes];
          } else if (length === maxLength) {
            longestSubsets.push(otherAttributes);
          }
        }
      });

      table.isSubset = isSubset;
      table.subsetOfIndex = subsetOfIndex; // MKOP 2025/10/03 Synthesis uses index
      table.data.subsetOf = longestSubsets; // MKOP 2025/10/03 Decomposition uses longestSubsets array
      table.subsetOf = longestSubsets; // MKOP 2025/10/07 MergeTablesAfterDecompose uses this array
    });
  };

  // MKOP 2025/10/22 User Interface fragments - unified rendering of screens
  // Header of node info modal window
  UiModalNodeInfo_Header = ({
    problem, // "problem-synthesis", "problem-decomposition", ...
    label, // "tableDetail"
    onClickCallback, // {() => setIsModalOpen(false)}
    prefillAttributes = [],
    prefillDependencies = [],
    prefillTargetPath = "/",
  }) => {
    const { t } = useTranslation();
    const handleCreateNewExample = () => {
      onCreateNewExample({
        attributes: prefillAttributes,
        dependencies: prefillDependencies,
        targetPath: prefillTargetPath,
      });
    };
    return (
      <div className="modal-header">
        <h2 className="black">{t(problem + "." + label)}</h2>
        <button onClick={handleCreateNewExample}>Create new example</button>
        <button onClick={onClickCallback} className="close-button">
          X
        </button>
      </div>
    );
  };

  UiModalNodeInfo_AttrsKeysNF = ({
    problem, // "problem-synthesis", "problem-decomposition", ...
    node,
    showNF = true,
  }) => {
    const { t } = useTranslation();
    return (
      <div className="modal-content">
        {node && (
          <>
            <p>
              <b>{t(problem + ".attributes")}:</b> {node.data.label}
            </p>
            <p>
              <b>{t(problem + ".keys")}:</b>{" "}
              {showFunctionsInstance.showKeysAsText(node.data.keys)}{" "}
            </p>
            {showNF && (
              <p>
                <b>{t(problem + ".normalForm")}:</b>{" "}
                {node.data.normalForm === "BCNF"
                  ? "BCNF"
                  : node.data.normalForm + " NF"}
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  UiModalNodeInfo_FDs = ({
    problem, // "problem-synthesis", "problem-decomposition", ...
    node,
  }) => {
    const { t } = useTranslation();
    return (
      <div className="modal-middle">
        {node && (
          <>
            <p>
              <b>{t(problem + ".dependencies")}:</b>{" "}
            </p>
            {functionalDependencyFunctionsInstance
              .mergeSingleRHSFDs(node.data.FDs)
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
    );
  };

  UiModalNodeInfo_FaultyFDs = (
    problem, // "problem-synthesis", "problem-decomposition", ...
    node
  ) => {
    const { t } = useTranslation();
    return (
      <>
        {node && node.data.faultyFDs.length > 0 && (
          <div className="modal-middle">
            <p>
              <b>{t(problem + ".unwantedDependencies")}:</b>{" "}
            </p>
            {node.data.faultyFDs.map((faultyDependency, index) => {
              return (
                <p key={index}>
                  {showFunctionsInstance.showTextDependencyWithArrow(
                    faultyDependency.dependency
                  )}{" "}
                  - {t(problem + ".violates")} {faultyDependency.violates}
                </p>
              );
            })}
          </div>
        )}
      </>
    );
  };

  UiModalNodeActions_FaultyFDs = ({
    problem, // "problem-synthesis", "problem-decomposition", ...
    label,
    node,
    faultyDependencies,
    violations,
    onClickCallbackDN, // Decompose Node
  }) => {
    const { t } = useTranslation();
    return (
      <>
        {node && faultyDependencies.length > 0 && (
          <div className="modal-middle">
            <p>
              <b>
                <Trans
                  i18nKey={problem + "." + label}
                  components={[<sup></sup>]}
                />
                :
              </b>
            </p>
            {faultyDependencies.map((faultyDependency, index) => {
              const handleOnClickEvent = (event) => {
                onClickCallbackDN(faultyDependency, node);
              };
              const violationInfo =
                violations.length > 0
                  ? " - " + t(problem + ".violates") + " " + violations[index]
                  : "";
              return (
                <p key={index}>
                  <button onClick={handleOnClickEvent}>
                    {showFunctionsInstance.showTextDependencyWithArrow(
                      faultyDependency
                    )}
                  </button>
                  {violationInfo}
                </p>
              );
            })}
          </div>
        )}
      </>
    );
  };

  UiModalNodeActions = ({
    problem, // "problem-synthesis", "problem-decomposition", ...
    node,
    leafNodes, // MKOP TODO: set isLeaf flag in nodes instead
    onClickCallbackDND, // Do Not Necompose
    onClickCallbackDRNDN, // Decompose RaNDomly Node
    onClickCallbackDRNDS, // Decompose RaNDomly Subtree
    onClickCallbackDM, // Decompose Manually
  }) => {
    const { t } = useTranslation();
    const handleOnClickEventDND = (event) => {
      onClickCallbackDND(null, node); // handleDependencyClick - Do Not Necompose
    };
    const handleOnClickEventDRNDN = (event) => {
      onClickCallbackDRNDN(node, 1); // handleRandomDecompositionClick - Decompose RaNDomly Node
    };
    const handleOnClickEventDRNDS = (event) => {
      onClickCallbackDRNDS(node, null); // handleRandomDecompositionClick - Decompose RaNDomly Subtree
    };
    return (
      <div className="modal-content">
        {node && (
          <>
            {leafNodes.length > 0 &&
              !leafNodes.some((leafNode) => leafNode.id === node.id) && (
                <p key="dnd">
                  <button onClick={handleOnClickEventDND}>
                    {t(problem + ".doNotDecompose")}
                  </button>
                </p>
              )}
            {node.data.normalForm !== "BCNF" && (
              <p key="drndn">
                <button onClick={handleOnClickEventDRNDN}>
                  {t(problem + ".decomposeRandomlyNode")}
                </button>
              </p>
            )}
            {node.data.normalForm !== "BCNF" && (
              <p key="drndt">
                <button onClick={handleOnClickEventDRNDS}>
                  {t(problem + ".decomposeRandomlySubtree")}
                </button>
              </p>
            )}
            {node.data.normalForm !== "BCNF" && (
              <p key="dm">
                <button onClick={onClickCallbackDM}>
                  {t(problem + ".decomposeManually")}
                </button>
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  UiModalNodePractice_labelNF = ({
    rbLabel, // "1NF", "2NF", "3NF", "BCNF"
    rbValue, // "1", "2", "3", "BCNF"
  }) => {
    return (
      <label className="radioBtn">
        <input type="radio" name="normalFormRadioBtn" value={rbValue} />
        {rbLabel}
      </label>
    );
  };

  UiModalNodePractice_NF = ({
    problem, // "problem-synthesis", "problem-decomposition", ...
    node,
    onClickCallbackCheck, // Check
    onClickCallbackHowTo, // How to achieve normal form
  }) => {
    const { t } = useTranslation();
    const handleOnClickEventCheck = (event) => {
      onClickCallbackCheck(node); // checkNormalFormAnswer - Check
    };
    const handleOnClickEventHowTo = (event) => {
      onClickCallbackHowTo(node.data.attributes, "normalForm"); // handleNavigateFromPracticeModal - How to achieve normal form
    };
    return (
      <div className="modal-content">
        <div className="modal-content-header">
          {node && (
            <div className="normalFormPracticeArea">
              <div className="radioButtonsArea">
                <b>{t(problem + ".normalForm")}:</b>{" "}
                <this.UiModalNodePractice_labelNF
                  rbLabel={"1NF"}
                  rbValue={"1"}
                />
                <this.UiModalNodePractice_labelNF
                  rbLabel={"2NF"}
                  rbValue={"2"}
                />
                <this.UiModalNodePractice_labelNF
                  rbLabel={"3NF"}
                  rbValue={"3"}
                />
                <this.UiModalNodePractice_labelNF
                  rbLabel={"BCNF"}
                  rbValue={"BCNF"}
                />
              </div>
              <div className="buttonsArea">
                <button
                  className="checkButton"
                  id="checkButton_NF"
                  onClick={handleOnClickEventCheck}
                >
                  {t("problem-decomposition.check")}
                </button>
                <button className="howButton" onClick={handleOnClickEventHowTo}>
                  {t("problem-decomposition.howToIdentifyNormalForm")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  /*  
  const UiModalNodePractice = ({
    problem,         // "problem-synthesis", "problem-decomposition", ...
    }) => {
      return (
          <div className="modal-content">
            <div className="modal-content-header">
              {selectedNode && (
                  <div className="normalFormPracticeArea">
                    <div className="radioButtonsArea">
                      <b>{t("problem-decomposition.normalForm")}:</b>{" "}
                      <label className="radioBtn">
                        <input
                          type="radio"
                          name="normalFormRadioBtn"
                          value="1"
                        />
                        1NF
                      </label>
                      <label className="radioBtn">
                        <input
                          type="radio"
                          name="normalFormRadioBtn"
                          value="2"
                        />
                        2NF
                      </label>
                      <label className="radioBtn">
                        <input
                          type="radio"
                          name="normalFormRadioBtn"
                          value="3"
                        />
                        3NF
                      </label>
                      <label className="radioBtn">
                        <input
                          type="radio"
                          name="normalFormRadioBtn"
                          value="BCNF"
                        />
                        BCNF
                      </label>
                    </div>

                    <div className="buttonsArea">
                      <button
                        className="checkButton"
                        id="checkButton_NF"
                        onClick={() => checkNormalFormAnswer(selectedNode)}
                      >
                        {t("problem-decomposition.check")}
                      </button>
                      <button
                        className="howButton"
                        onClick={() =>
                          handleNavigateFromPracticeModal(
                            selectedNode.data.attributes,
                            "normalForm"
                          )
                        }
                      >
                        {t("problem-decomposition.howToIdentifyNormalForm")}
                      </button>
                    </div>
                  </div>
              )}
            </div>

            <div className="practiceDependenciesArea">
              <p>{t("problem-decomposition.rewrittenDependenciesRHS")}</p>
              <button
                className="howButton"
                onClick={() =>
                  handleNavigateFromPracticeModal(
                    selectedNode.data.attributes,
                    "derivablity"
                  )
                }
              >
                <Trans
                  i18nKey="problem-decomposition.howToIdentifyFplus"
                  components={[<sup></sup>]}
                />
              </button>

              {selectedNode && (
                <ul className="practiceDependenisWrapperUL">
                  {selectedNode.data.FDs.map((dependency, index) => {
                    return (
                      <li key={index} className="practiceDependencyRow">
                        <div>
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "center",
                            }}
                          >
                            <p
                              className="practiceDependency"
                              id={`dependency${index}`}
                            >
                              {showFunctionsInstance.showTextDependencyWithArrow(
                                dependency
                              )}
                            </p>
                            <label>
                              <div className="practiceCheckBoxViolate">
                                <input
                                  type="checkbox"
                                  className={"violateCheckbox"}
                                  id={`violate${index}`}
                                  onChange={() => {
                                    document.getElementById(
                                      `violateComboBox${index}`
                                    ).style.display = document.querySelector(
                                      `#violate${index}`
                                    ).checked
                                      ? "inline-block"
                                      : "none";
                                  }}
                                  style={{ marginLeft: "5px" }}
                                />
                                <span>
                                  {t("problem-decomposition.violates")}
                                </span>
                                <div
                                  id={`violateComboBox${index}`}
                                  style={{ display: "none" }}
                                >
                                  <select
                                    name="cBox_normalForm"
                                    id={`cBox_normalForm${index}`}
                                  >
                                    <option value="2NF">2NF</option>
                                    <option value="3NF">3NF</option>
                                    <option value="BCNF">BCNF</option>
                                  </select>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <button
                className="checkButton"
                id="checkButton_FaultyDep"
                onClick={() => checkDependenciesViolateAnswer(selectedNode)}
              >
                {t("problem-decomposition.checkChosenDependencies")}
              </button>
            </div>
          </div>
      );
  };
*/
}

// Rendering of nodes in ReactFlow
const onCreateNewExample = ({
  attributes = [],
  dependencies = [],
  targetPath = "/",
} = {}) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const { localStorage, location, open } = window;
    if (!localStorage || !open) {
      return;
    }

    const safeAttributes = Array.isArray(attributes) ? attributes : [];
    const safeDependencies = Array.isArray(dependencies) ? dependencies : [];

    localStorage.setItem("prefillAttributes", JSON.stringify(safeAttributes));
    localStorage.setItem(
      "prefillDependencies",
      JSON.stringify(safeDependencies)
    );

    const sanitizedPath =
      typeof targetPath === "string" && targetPath.length > 0
        ? targetPath.startsWith("/")
          ? targetPath
          : `/${targetPath}`
        : "/";

    const destinationUrl = `${location.origin}${sanitizedPath}`;
    const newWindow = open(destinationUrl, "_blank", "noopener");

    if (newWindow && typeof newWindow.focus === "function") {
      newWindow.focus();
    }
  } catch (error) {
    console.error("Failed to create new example", error);
  }
};

const nodeWidth = "200px"; // Nastavení šířky

export default memo(({ node, practiceMode }) => {
  const { t } = useTranslation();
  const showFunctionsInstance = new ShowFunctions();

  return (
    <div
      className={`customeNode customeNode-${node.id}`}
      id={`x-${node.id}`}
      style={{
        border: "1px solid #000",
        padding: "10px",
        borderRadius: "5px",
        width: nodeWidth, // Použití šířky z proměnné
        display: "flex",
        flexDirection: "column",
        alignItems: "center", // Vycentrování obsahu
        background: helperColorFunctionsInstance.nodeBackgroundColor(
          node.data.normalForm,
          practiceMode
        ),
        opacity: node.data.subsetOf.length > 0 ? 0.5 : 1,
        color: "#000",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div>
        <div
          style={{
            fontWeight: "bold",
            textAlign: "center",
            width: "200px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {node.data.label}
        </div>
        <div
          style={{
            fontSize: "x-small",
            textAlign: "center",
            width: "200px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {t("problem-decomposition.customeNode.keys")} [ {node.data.keysLabel}{" "}
          ]
        </div>

        {node.data.subsetOf.length > 0 && (
          <div
            style={{
              fontSize: "x-small",
              textAlign: "center",
              width: "200px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "red",
            }}
          >
            {t("problem-decomposition.customeNode.isSubsetOf")}{" "}
            {showFunctionsInstance.showKeysAsText(node.data.subsetOf)}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
