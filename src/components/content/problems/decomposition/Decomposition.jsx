import React, {
//EdgeLabelRenderer, // MKOP not needed yet
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { NormalFormALG } from "../../../../algorithm/NormalFormALG";
import { useAttributeContext } from "../../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import { useNavigate } from "react-router-dom";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import dagre from "dagre";
import ReactModal from "react-modal";
import Swal from "sweetalert2";
import { Trans, useTranslation } from "react-i18next";
import { HelperColorFunctions } from "../../../../algorithm/HelperColorFunctions";
import "reactflow/dist/style.css";
import "./decomposition.scss";
import OwnDecomposition from "./ownDecomposition/OwnDecomposition";
import OwnDecompositionPractice from "./ownDecomposition/OwnDecompositionPractice";
import MergeTablesAfterDecompose from "./mergeTablesAfterDecompose/MergeTablesAfterDecompose";
import CustomNode from "../../../../algorithm/CustomNodeFunctions";
import { CustomNodeFunctions } from "../../../../algorithm/CustomNodeFunctions";
import { FPlusFunctions } from "../../../../algorithm/FPlusFunctions";
import { AttributeFunctions } from "../../../../algorithm/AttributeFunctions";
import { MinimalCoverFunction } from "../../../../algorithm/MinimalCoverFunction";
import { FunctionalDependencyFunctions } from "../../../../algorithm/FunctionalDependencyFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";

const CustomNodeFunctionsInstance = new CustomNodeFunctions();
const fPlusFunctionsInstance = new FPlusFunctions();
const attributeFunctionsInstance = new AttributeFunctions();
const helperColorFunctionsInstance = new HelperColorFunctions();
const minimalCoverFunctionInstance = new MinimalCoverFunction();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();
const showFunctionsInstance = new ShowFunctions();

//const position = { x: 0, y: 0 };
const edgeType = "smoothstep";
const minimapStyle = {
  height: 120,
  topleft: { top: 10, left: 10 },
};
let dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 36;

let getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";

  const ranksep = 70;

  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: isHorizontal ? undefined : ranksep,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

let currLeafNodesList = [];

const Decomposition = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { attributes } = useAttributeContext();
  const { dependencies } = useDependencyContext();
  const normalFormInstance = new NormalFormALG();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const [lostFDs, setLostFDs] = useState([]);

  const [faultlyDependenciesFooter, setFaultlyDependenciesFooter] = useState(
    []
  );

  const minimalCover = minimalCoverFunctionInstance.minimalCover(dependencies);
  const fPlusOrigin = fPlusFunctionsInstance.FPlus(dependencies, attributes);
  const fPlusOriginSingleRHS =
    functionalDependencyFunctionsInstance.rewriteFDSingleRHS(fPlusOrigin);

  const [practiceMode, setPracticeMode] = useState(() => {
    const saved = localStorage.getItem("practiceMode");
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [isPracticeModalOpen, setIsPracticeModalOpen] = useState(false);

  const [isModalDecompositeOwnWayOpen, setIsModalDecompositeOwnWayOpen] =
    useState(false);

  const [
    isModalMergeTablesAfterDecomposeOpen,
    setIsModalMergeTablesAfterDecomposeOpen,
  ] = useState(false);

  const [amnoutProblemSolvedInNode, setAmountProblemSolvedInNode] = useState(0); // Počet problémů vyřešených v daném vrcholu (správné odpovědi na NF a fautly dependencies)

  const firstRender = useRef(true); // To track the first render

  useEffect(() => {
    if (firstRender.current) {
      currLeafNodesList = [];
      firstRender.current = false;
      return;
    }
  }, []);

  const nodeTypes = useMemo(
    () => ({
      customNode: (nodeData) => (
        <CustomNode node={nodeData} practiceMode={practiceMode} />
      ),
    }),
    [practiceMode]
  );

  const [nodesArray, setNodesArray] = useState([
    CustomNodeFunctionsInstance.initNode(attributes, fPlusOriginSingleRHS, "1"),
  ]); // Node id

  const [edgesArray, setEdgesArray] = useState([]);

  let { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodesArray,
    edgesArray
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Zabranuje chybě ResizeObserver loop limit exceeded
  useEffect(() => {
    window.addEventListener("error", (e) => {
      if (e.message.startsWith("ResizeObserver loop")) {
        const resizeObserverErrDiv = document.getElementById(
          "webpack-dev-server-client-overlay-div"
        );
        const resizeObserverErr = document.getElementById(
          "webpack-dev-server-client-overlay"
        );
        if (resizeObserverErr) {
          resizeObserverErr.setAttribute("style", "display: none");
        }
        if (resizeObserverErrDiv) {
          resizeObserverErrDiv.setAttribute("style", "display: none");
        }
      }
    });
  }, []);

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodesArray,
      edgesArray
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodesArray, edgesArray]);

  useEffect(() => {
    if (currLeafNodesList.length > 0) {
      //    setLostFDs([]);

      setLostFDs(
        functionalDependencyFunctionsInstance.lostDependencies(
          minimalCover, // original FDs // MKOP 2025/09/24 would work even for non-canonical set of FDs
          currLeafNodesList.map((leafNode) => leafNode.data.FDs).flat() // leafNodesFDs  // new FDs - some original FDs may be not derivable from them any more
          // MKOP 2025/09/23 canonical Fplus is not needed, attributeClosure will be the same
        )
      );
    }

    CustomNodeFunctionsInstance.highlightSubsetNodes(currLeafNodesList, true);
  }, [currLeafNodesList]);

  useEffect(() => {
    if (selectedNode) {
      setFaultlyDependenciesFooter([]);
      let faultyDependenciesTmp = [];

      selectedNode.data.faultyFDs.forEach((faultyDependency) => {
        faultyDependenciesTmp.push(faultyDependency.dependency);
      });

      selectedNode.data.faultyFDs.forEach((faultyDependency) => {
        const closure = attributeFunctionsInstance.nonTrivialClosure(
          faultyDependenciesTmp,
          faultyDependency.dependency.left
        );
        const newDependency = {
          left: faultyDependency.dependency.left,
          right: closure,
        };
        setFaultlyDependenciesFooter((prev) => {
          // Kontrola, zda už v `prev` existuje záznam s totožným `left`
          const exists = prev.some(
            (dependency) => dependency.left === newDependency.left
          );

          // Kontrola, zda `right` obsahuje více než jeden prvek
          const isSingleElement = newDependency.right.length === 1;

          // Pokud takový záznam neexistuje a `right` neobsahuje pouze jeden prvek, přidáme nový
          if (!exists && !isSingleElement) {
            return [...prev, newDependency];
          }

          // Pokud už záznam existuje nebo `right` obsahuje pouze jeden prvek, ponecháme pole beze změny
          return prev;
        });
      });
    }
  }, [selectedNode]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );

  const handleNodeDoubleClick = (event, node) => {
    setSelectedNode(node);

    if (practiceMode) {
      setIsPracticeModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const removeNodeDescendants = (nodeId) => {
    dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    currLeafNodesList = currLeafNodesList.filter((node) => {
      return !node.id.startsWith(nodeId) || node.id.length <= nodeId.length;
    });

    setNodesArray((prevNodes) =>
      prevNodes.filter((node) => {
        return !node.id.startsWith(nodeId) || node.id.length <= nodeId.length;
      })
    );

    setEdgesArray((prevEdges) =>
      prevEdges.filter((edge) => {
        const sourceIsDescendant =
          edge.source.startsWith(nodeId) && edge.source.length > nodeId.length;
        const targetIsDescendant =
          edge.target.startsWith(nodeId) && edge.target.length > nodeId.length;
        return !sourceIsDescendant && !targetIsDescendant;
      })
    );
  };

  useEffect(() => {
    const savedState = sessionStorage.getItem("decompositionState");
    if (savedState) {
      const {
        nodes,
        edges,
        lostFDs,
        practiceMode,
        selectedNode,
        isPracticeModalOpen,
      } = JSON.parse(savedState);
      setNodesArray(nodes);
      setEdgesArray(edges);
      setLostFDs(lostFDs);
      setPracticeMode(practiceMode);
      setSelectedNode(selectedNode);
      setIsPracticeModalOpen(isPracticeModalOpen);
    }
  }, []);

  const handleDependencyClick = (dependency, node) => {
    removeNodeDescendants(node.id);

    // delete node from currLeafNodesList if it is there
    let updatedLeafNodes = currLeafNodesList.filter(
      (currNode) => currNode.id !== node.id
    );

    if (dependency) {
      const newNode1 = CustomNodeFunctionsInstance.initNode(
        [...dependency.left, ...dependency.right],
        fPlusOriginSingleRHS,
        node.id + "1" // Concatenation of strings
      );
      const newNode2 = CustomNodeFunctionsInstance.initNode(
        node.data.attributes.filter(
          (item) => !dependency.right.includes(item)
          ),
        fPlusOriginSingleRHS,
        node.id + "2" // Concatenation of strings
      );

      setNodesArray((prevNodes) => [...prevNodes, newNode1, newNode2]);

      // MKOP 2025/09/09
      // Neztratila se tímto krokem dekompozice žádná FD?
      let newLowerFDs = [];
      newLowerFDs.push(...newNode1.data.FDs);
      newLowerFDs.push(...newNode2.data.FDs);

      let edgeLost = "";
      if (
        functionalDependencyFunctionsInstance.lostDependencies(
          node.data.FDs, // original FDs from parent node // MKOP 2025/09/24 works even for non-canonical set of FDs
          newLowerFDs // new FDs from its children
        ).length > 0
      ) {
        edgeLost = String.fromCharCode(0x26a0) + " "; // MKOP 2025/09/14 Warning Sign U+26A0 (&#x26A0;)
      }

      // MKOP 2025/10/20 practiceMode is false (???) in case of original showRandomDecomposition() callback implementation
      // MKOP 2025/10/21 practiceMode is set correctly in handleRandomDecompositionClick() and new version of showRandomDecomposition()
      //let isPracticeMode = localStorage.getItem("practiceMode");
      //isPracticeMode = isPracticeMode !== null ? JSON.parse(isPracticeMode) : false;

      const edgeLabel0 =
        showFunctionsInstance.showTextDependencyWithArrow(dependency);

      const newEdge1 = {
        id: newNode1.id,
        source: node.id,
        target: newNode1.id,
        type: edgeType,
        zIndex: 1, // MKOP 2025/11/05 on foreground
      //deletable: false, // MKOP 2025/11/05 not deleteable
      //selectable: false, // MKOP 2025/11/05 not selectable	
        label0: edgeLabel0,
        lost: edgeLost, // MKOP 2025/09/09
        label: practiceMode // isPracticeMode
          ? edgeLabel0
          : edgeLost + edgeLabel0, // MKOP 2025/09/20
      };

      const newEdge2 = {
        id: newNode2.id,
        source: node.id,
        target: newNode2.id,
        type: edgeType,
        zIndex: -1, // MKOP 2025/11/05 on background, not overlap newEdge1's label
      //deletable: false, // MKOP 2025/11/05 not deleteable
      //selectable: false, // MKOP 2025/11/05 not selectable
      };

      setEdgesArray((prevEdges) => [...prevEdges, newEdge1, newEdge2]);

      updatedLeafNodes.push(newNode1, newNode2);
    } else {
      // neni definovana zavislost pro rozdeleni
      updatedLeafNodes.push(node);
    }

    setIsModalOpen(false);
    setIsPracticeModalOpen(false);

    currLeafNodesList = updatedLeafNodes;
  };

  const randomDecomposition = (nodeIdPrefix, depth) => {
    // MKOP 2025/10/10 new parameter, expand only nodes with this prefix
    // MKOP 2025/10/11 new parameter, expand only limited number of levels, null means unlimited
    while (true) {
      let leafNodes = currLeafNodesList;
      let leafNodesWithFaultyDeps = [];
      for (let node of leafNodes) {
        if (
          node.data.faultyFDs &&
          node.data.faultyFDs.length > 0 &&
          node.id.startsWith(nodeIdPrefix) && // MKOP 2025/10/10
          (depth == null || node.id.length < nodeIdPrefix.length + depth) // MKOP 2025/10/11
        ) {
          leafNodesWithFaultyDeps.push(node);
        }
      }

      if (leafNodesWithFaultyDeps.length === 0) {
        break; // Ukončení, pokud již neexistují listy s chybnými závislostmi
      }

      for (let leafNode of leafNodesWithFaultyDeps) {
        const moreDependencies = normalFormInstance.moreWayHowToSplitNode(
          leafNode.data
        );
        let faultyDependencies = [];

        for (let i = 0; i < leafNode.data.faultyFDs.length; i++) {
          faultyDependencies.push(leafNode.data.faultyFDs[i].dependency);
        }

        const combinedDependencies =
          faultyDependencies.concat(moreDependencies);

        let randomIndex = Math.floor(
          Math.random() * combinedDependencies.length
        );
        let selectedDependency = combinedDependencies[randomIndex];

        handleDependencyClick(selectedDependency, leafNode);
      }
    }
  };

  // MKOP original version, making complete random tree
  //const showRandomDecomposition = useCallback(() => {
  //  const restoreGraph = async () => {
  //    setNodesArray([]);
  //    setEdgesArray([]);
  //    setLostFDs([]);
  //    const initialNodes = [
  //      CustomNodeFunctionsInstance.initNode(
  //        attributes,
  //        fPlusOriginSingleRHS,
  //        "1"
  //      ),
  //    ]; // Node id
  //    setNodesArray(initialNodes);
  //    currLeafNodesList = initialNodes;
  //  };
  //
  //  restoreGraph();
  //
  //  randomDecomposition("1", null); // MKOP 2025/10/10 expand only leaf nodes with ID starting by "1", ie. all of them
  //}, [setNodesArray, setEdgesArray]);

  // MKOP 2025/10/21 new version, creating random tree under root node
  const showRandomDecomposition = () => {
    const selectedNode = nodesArray.find((node) => node.id === "1");
    handleDependencyClick(null, selectedNode);
    // MKOP 2025/10/10 expand only leaf nodes with ID starting by node.id, ie. its subtree
    // MKOP 2025/10/10 limit expansion to given number of levels, null means unlimited
    randomDecomposition(selectedNode.id, null);
  };

  // MKOP 2025/10/10 new version, creating random tree under given node up to given depth
  const handleRandomDecompositionClick = (selectedNode, depth) => {
    handleDependencyClick(null, selectedNode);
    // MKOP 2025/10/10 expand only leaf nodes with ID starting by node.id, ie. its subtree
    // MKOP 2025/10/10 limit expansion to given number of levels, null means unlimited
    randomDecomposition(selectedNode.id, depth); // node.id
  };

  const handleNavigate = (fd) => {
    // Save current state
    const stateToSave = {
      nodes: nodesArray,
      edges: edgesArray,
      lostFDs: lostFDs,
      practiceMode: practiceMode,
      selectedNode: selectedNode,
      isPracticeModalOpen: isPracticeModalOpen,
    };
    sessionStorage.setItem("decompositionState", JSON.stringify(stateToSave));

    // Navigate
    navigate("/problems/normalForm", { state: [...fd.left, ...fd.right] });
  };

  const handleNavigateFromPracticeModal = (attributes, url) => {
    // Save current state
    const stateToSave = {
      nodes: nodesArray,
      edges: edgesArray,
      lostFDs: lostFDs,
      practiceMode: practiceMode,
      selectedNode: selectedNode,
      isPracticeModalOpen: isPracticeModalOpen,
    };
    sessionStorage.setItem("decompositionState", JSON.stringify(stateToSave));

    // Navigate
    navigate("/problems/" + url, { state: attributes });
  };

  const showSelectedNodeResult = (selectedNode) => {
    setIsPracticeModalOpen(false);
    setIsModalOpen(true);
  };

  const checkNormalFormAnswer = (selectedNode) => {
    const radioButtons = document.getElementsByName("normalFormRadioBtn");
    let selectedValue = null;

    for (let i = 0; i < radioButtons.length; i++) {
      if (radioButtons[i].checked) {
        selectedValue = radioButtons[i].value;
        break;
      }
    }

    if (selectedValue === null) {
      Swal.fire({
        title: t("problem-decomposition.chooseTheAnswerPlease"),
        icon: "warning",
        confirmButtonText: "Ok",
      });
    } else if (
      selectedValue.toString() === selectedNode.data.normalForm.toString()
    ) {
      Swal.fire({
        title: t("problem-decomposition.correct"),
        icon: "success",
        confirmButtonText: "Ok",
      });

      const radioButtons = document.getElementsByName("normalFormRadioBtn");

      // Loop through each radio button and set the 'disabled' property
      radioButtons.forEach((radioButton) => {
        radioButton.disabled = true;
      });

      const checkButton = document.getElementById("checkButton_NF");
      checkButton.disabled = true;

      if (amnoutProblemSolvedInNode === 1) {
        setAmountProblemSolvedInNode(0);
        showSelectedNodeResult(selectedNode);
      } else {
        setAmountProblemSolvedInNode((prev) => prev + 1);
      }
    } else {
      Swal.fire({
        title: t("problem-decomposition.incorrect"),
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const checkDependenciesViolateAnswer = (selectedNode) => {
    const totalCorrectAnswers = selectedNode.data.faultyFDs.length;
    let correctAnswercounter = 0;

    const violateCheckboxes =
      document.getElementsByClassName("violateCheckbox");

    const checkChosenDependencyAnswer = (dependency, violateAnswer) => {
      for (let df of selectedNode.data.faultyFDs) {
        if (
          showFunctionsInstance.showTextDependencyWithArrow(df.dependency) ===
          dependency
        ) {
          if (violateAnswer.toUpperCase() === df.violates) {
            return true;
          }
        }
      }
      return false;
    };

    for (let i = 0; i < violateCheckboxes.length; i++) {
      if (violateCheckboxes[i].checked) {
        const index = parseInt(violateCheckboxes[i].id.replace("violate", ""));

        const cbox_Chosen = document.getElementById(`cBox_normalForm${index}`);

        const dependency = document.getElementById(
          `dependency${index}`
        ).textContent;

        if (checkChosenDependencyAnswer(dependency, cbox_Chosen.value)) {
          cbox_Chosen.disabled = true;
          violateCheckboxes[i].disabled = true;
          correctAnswercounter++;
        } else {
          correctAnswercounter--;
        }
      }
    }

    if (correctAnswercounter === totalCorrectAnswers) {
      Swal.fire({
        title: t("problem-decomposition.correctFdCheck"), // "Správně!",
        icon: "success",
        confirmButtonText: "Ok",
      });

      const checkButton = document.getElementById("checkButton_FaultyDep");
      checkButton.disabled = true;

      if (amnoutProblemSolvedInNode === 1) {
        setAmountProblemSolvedInNode(0);
        showSelectedNodeResult(selectedNode);
      } else {
        setAmountProblemSolvedInNode((prev) => prev + 1);
      }
    } else {
      Swal.fire({
        title: t("problem-decomposition.incorrectFdCheck"), // "Vaše odpověď není správná!"
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };
  
  const UiModalNodePractice = ({
    problem,         // "problem-synthesis", "problem-decomposition", ...
    }) => {
      return (
          <div className="modal-content">
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
  
  const showMergeTableModal = () => {
    setIsModalMergeTablesAfterDecomposeOpen(true);
  };
  
  // MKOP 2025/11/03 recompute redundant leaf nodes when closing the dialog
  // do not keep nodes redundant with respect to added lost FDs in MergeTablesAfterDecompose.jsx
  const hideMergeTableModal = () => {
    setIsModalMergeTablesAfterDecomposeOpen(false);
    CustomNodeFunctionsInstance.highlightSubsetNodes(currLeafNodesList, true);
  };

  return (
    <div className="decomposition-container">
      <div className="header">
        <div className="lostDependenciesArea">
          <h1>{t("problem-decomposition.lostDependencies")}</h1>
          <div className="lostDependencies">
            {lostFDs.length > 0 ? (
              <ul>
                {lostFDs.map((fd, index) => {
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
                        className="howButton"
                        style={{
                          backgroundColor:
                            helperColorFunctionsInstance.nodeBackgroundColor(
                              typeNF,
                              practiceMode
                            ),
                          border: "none",
                        }}
                        onClick={() => handleNavigate(fd)}
                      >
                        {t("problem-decomposition.detail")}
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

        <div className="right">
          <div className="right-upper">
            <label className="practiceLabel">
              {t("problem-decomposition.practiceMode")}
              <input
                type="checkbox"
                checked={practiceMode}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setPracticeMode(isChecked);
                  localStorage.setItem(
                    "practiceMode",
                    JSON.stringify(isChecked)
                  );
                  // MKOP 2025/09/10 Zajistí překreslení grafu včetně změn v labelech hran
                  // MKOP TODO: zároveň se udělá nový layout a ztratí se tak případné vzájemné posuny uzlů
                  setEdgesArray((prevEdges) => {
                    // Return a new array to trigger a re-render
                    return prevEdges.map((edge) => ({
                      ...edge,
                      label: edge.label0
                        ? isChecked
                          ? `${edge.label0}`
                          : `${edge.lost}${edge.label0}`
                        : undefined,
                    }));
                  });
                }}
              />
            </label>
          </div>
          <div className="right-lower">
            <button
              className="showMergeTableModal_btn"
              onClick={() => showMergeTableModal()}
            >
              {t("problem-decomposition.showTablesAfterDecomposition")}
            </button>
            <button
              className="randomDecomposition_btn"
              onClick={() => showRandomDecomposition()}
            >
              {t("problem-decomposition.showRandomDecomposition")}
            </button>
          </div>
        </div>
      </div>

      <div className="reactFlowContainer">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          connectionLineType={ConnectionLineType.SmoothStep}
          onNodeDoubleClick={handleNodeDoubleClick}
          fitView
          attributionPosition="top-right"
          nodeTypes={nodeTypes}
        >
          <MiniMap
            style={minimapStyle}
            zoomable
            pannable
            position="top-right"
          />
          <Controls position="top-left" />
          {/* <Background color="#ffffff" variant="lines" gap={0} /> */}
          {/* MKOP 2025/09/10 pokusné jednolité světle šedé pozadí grafu */}
          {/* <Background color="#ffffff" variant="dots"  gap={1} /> */}
          {/* <Background color="#ffffff" variant="dots" gap={14} /> */}
          <Background
            color={helperColorFunctionsInstance.uiSkinProperty(
              "ReactFlowColor"
            )}
            variant={helperColorFunctionsInstance.uiSkinProperty(
              "ReactFlowVariant"
            )}
            gap={helperColorFunctionsInstance.uiSkinProperty("ReactFlowGap")}
          />
        </ReactFlow>

        <ReactModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="custom-modal"
        >
          <CustomNodeFunctionsInstance.UiModalNodeInfo_Header
            problem={"problem-decomposition"}
            label={"tableDetail"}
            onClickCallback={() => setIsModalOpen(false)}
          />  
          <CustomNodeFunctionsInstance.UiModalNodeInfo_AttrsKeysNF
            problem={"problem-decomposition"}
            node={selectedNode}
          />
          <CustomNodeFunctionsInstance.UiModalNodeActions
            problem={"ownDecomposition"}
            node={selectedNode}
            leafNodes={currLeafNodesList}
            onClickCallbackDND={handleDependencyClick}
            onClickCallbackDRNDN={handleRandomDecompositionClick}
            onClickCallbackDRNDS={handleRandomDecompositionClick}
            onClickCallbackDM={() => setIsModalDecompositeOwnWayOpen(true)}
          />  
          <CustomNodeFunctionsInstance.UiModalNodeInfo_FDs
            problem={"problem-decomposition"}
            node={selectedNode}
          />
          <CustomNodeFunctionsInstance.UiModalNodeActions_FaultyFDs
            problem={"problem-decomposition"}
            label={"unwantedDependencies"}
            node={selectedNode}
            faultyDependencies={selectedNode ? selectedNode.data.faultyFDs.map((fd) => fd.dependency) : []}
            violations={selectedNode ? selectedNode.data.faultyFDs.map((fd) => fd.violates) : []}
            onClickCallbackDN={handleDependencyClick}
          />
          <CustomNodeFunctionsInstance.UiModalNodeActions_FaultyFDs
            problem={"problem-decomposition"}
            label={"moreWayHowToDecomposite"}
            node={selectedNode}
            faultyDependencies={faultlyDependenciesFooter}
            violations={[]}
            onClickCallbackDN={handleDependencyClick}
          />
        </ReactModal>

        <ReactModal
          isOpen={isPracticeModalOpen}
          onRequestClose={() => setIsPracticeModalOpen(false)}
          className="custom-modal minimal-cover-modal practice-modal custom-scroll"
        >
          <CustomNodeFunctionsInstance.UiModalNodeInfo_Header
            problem={"problem-decomposition"}
            label={"tableDetail"}
            onClickCallback={() => setIsPracticeModalOpen(false)}
          />  
          <CustomNodeFunctionsInstance.UiModalNodeInfo_AttrsKeysNF
            problem={"problem-decomposition"}
            node={selectedNode}
            showNF={false}
          />
          <CustomNodeFunctionsInstance.UiModalNodeActions
            problem={"ownDecomposition"}
            node={selectedNode}
            leafNodes={currLeafNodesList}
            onClickCallbackDND={handleDependencyClick}
            onClickCallbackDRNDN={handleRandomDecompositionClick}
            onClickCallbackDRNDS={handleRandomDecompositionClick}
            onClickCallbackDM={() => setIsModalDecompositeOwnWayOpen(true)}
          />  

          <CustomNodeFunctionsInstance.UiModalNodePractice_NF
            problem={"problem-decomposition"}
            node={selectedNode}
            onClickCallbackCheck={checkNormalFormAnswer}
            onClickCallbackHowTo={handleNavigateFromPracticeModal}
          />

          <UiModalNodePractice
            problem={"problem-decomposition"}
          />
            
        </ReactModal>

        <ReactModal
          isOpen={isModalDecompositeOwnWayOpen}
          onRequestClose={() => setIsModalDecompositeOwnWayOpen(false)}
          className="custom-modal"
        >
          <CustomNodeFunctionsInstance.UiModalNodeInfo_Header
            problem={"problem-decomposition"}
            label={"insertYourDependency"}
            onClickCallback={() => setIsModalDecompositeOwnWayOpen(false)}
          />  

          <div className="modal-content">
            {practiceMode && (
              <OwnDecompositionPractice
                selectedNode={selectedNode}
                handleDependencyClick={handleDependencyClick}
                setIsModalDecompositeOwnWayOpen={
                  setIsModalDecompositeOwnWayOpen
                }
                setIsPracticeModalOpen={setIsPracticeModalOpen}
              />
            )}
            {!practiceMode && (
              <OwnDecomposition
                selectedNode={selectedNode}
                handleDependencyClick={handleDependencyClick}
                setIsModalDecompositeOwnWayOpen={
                  setIsModalDecompositeOwnWayOpen
                }
                setIsModalOpen={setIsModalOpen}
              />
            )}
          </div>
        </ReactModal>

        <ReactModal
          isOpen={isModalMergeTablesAfterDecomposeOpen}
          onRequestClose={() => hideMergeTableModal()} // setIsModalMergeTablesAfterDecomposeOpen(false)
          className="custom-modal"
          style={{
            content: {
              overflowX: "hidden",
            },
          }}
        >
          <CustomNodeFunctionsInstance.UiModalNodeInfo_Header
            problem={"problem-decomposition"}
            label={"tablesAfterDecomposition"}
            onClickCallback={() => hideMergeTableModal()} // setIsModalMergeTablesAfterDecomposeOpen(false)
          />  

          <div className="modal-content">
            <MergeTablesAfterDecompose
              tables={
                currLeafNodesList.length === 0 ? [nodes[0]] : currLeafNodesList
              }
              originKeys={nodes[0].data.keys}
              lostFDs={lostFDs}
            />
          </div>
        </ReactModal>
      </div>
    </div>
  );
};

//<div className="lostDependencies" hidden="hidden">
//{JSON.stringify(currLeafNodesList)}
//</div>

export default Decomposition;
