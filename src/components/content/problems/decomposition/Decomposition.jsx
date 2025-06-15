import React, {
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
import { normalFormColor } from "../../../../constantValues/constantValues";
import "reactflow/dist/style.css";
import "./decomposition.scss";
import CustomNode from "./CustomNode";
import OwnDecomposition from "./ownDecomposition/OwnDecomposition";
import OwnDecompositionPractice from "./ownDecomposition/OwnDecompositionPractice";
import MergeTablesAfterDecompose from "./mergeTablesAfterDecompose/MergeTablesAfterDecompose";
import { FPlusFunctions } from "../../../../algorithm/FPlusFunctions";
import { AttributeFunctions } from "../../../../algorithm/AttributeFunctions";
import { HelperSetFunctions } from "../../../../algorithm/HelperSetFunctions";
import { MinimalCoverFunction } from "../../../../algorithm/MinimalCoverFunction";
import { FunctionalDependencyFunctions } from "../../../../algorithm/FunctionalDependencyFunctions";
import { FindingKeysFunctions } from "../../../../algorithm/FindingKeysFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";
const fPlusFunctionsInstance = new FPlusFunctions();
const attributeFunctionsInstance = new AttributeFunctions();
const helperSetFunctionsInstance = new HelperSetFunctions();
const minimalCoverFunctionInstance = new MinimalCoverFunction();
const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();
const findingKeysFunctionsInstance = new FindingKeysFunctions();
const showFunctionsInstance = new ShowFunctions();

const position = { x: 0, y: 0 };
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

  const [amnoutProblemSolvedInNode, setAmountProblemSolvedInNode] = useState(0); // Počet problémů vyřešených v daném vrcholu (sprvne odpovědi na NF a fautly dependencies)

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

  const getAllDependenciesDependsOnAttr = (attr) => {
    let dependenciesDependsOnAttr = [];
    for (let i = 0; i < fPlusOriginSingleRHS.length; i++) {
      // Zkontrolujeme, že všechny prvky na levé i pravé straně jsou obsaženy v `attr`
      let leftSideValid = fPlusOriginSingleRHS[i].left.every((element) =>
        attr.includes(element)
      );
      let rightSideValid = fPlusOriginSingleRHS[i].right.every((element) =>
        attr.includes(element)
      );

      if (leftSideValid && rightSideValid) {
        dependenciesDependsOnAttr.push(fPlusOriginSingleRHS[i]);
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

  const initialNode = (attr) => {
    const initialNodeData = nodeData(attr);

    const node = {
      id: "1",
      type: "customNode",
      data: initialNodeData,
      position,
    };
    return node;
  };

  const [nodesArray, setNodesArray] = useState([initialNode(attributes)]);

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
      setLostFDs([]);
      let leafNodesFDs = [];
      currLeafNodesList.forEach((leafNode) => {
        leafNodesFDs.push(...leafNode.data.FDs);
      });

      const newFplus = fPlusFunctionsInstance.FPlus(leafNodesFDs, attributes);
      const newFplusSingleRHS =
        functionalDependencyFunctionsInstance.rewriteFDSingleRHS(newFplus);

      const lostFDsList = [];
      // fPlusOriginSingleRHS pokud chci i ztraccene odvozené závislosti
      minimalCover.map((fd, index) => {
        const attrClosure = attributeFunctionsInstance.attributeClosure(
          newFplusSingleRHS,
          fd.left
        );
        if (!attrClosure.includes(fd.right[0])) {
          lostFDsList.push(fd);
        }
      });

      setLostFDs(lostFDsList);
    }

    currLeafNodesList.forEach((node, i) => {
      node.data.subsetOf = [];
    });

    highlightSubsetNodes();
  }, [currLeafNodesList]);

  const highlightSubsetNodes = () => {
    // Helper function to check if set1 and set2 are identical
    function areSetsEqual(set1, set2) {
      return JSON.stringify(set1) === JSON.stringify(set2);
    }

    currLeafNodesList.forEach((node, i) => {
      node.data.subsetOf = [];
    });

    let sameNodesNotSubSetOther = [];

    currLeafNodesList.forEach((node1, i) => {
      currLeafNodesList.forEach((node2, j) => {
        // Skip same node or identical attributes
        if (
          i !== j &&
          node1.id !== node2.id &&
          node1.data.type == "BCNF" &&
          node2.data.type == "BCNF"
        ) {
          const attr1 = node1.data.originalAttr;
          const attr2 = node2.data.originalAttr;

          if (
            helperSetFunctionsInstance.subset(attr1, attr2) &&
            helperSetFunctionsInstance.subset(attr2, attr1)
          ) {
            sameNodesNotSubSetOther.push(node1);
          }

          // Check if node1 is a strict subset of node2
          if (
            helperSetFunctionsInstance.subset(attr1, attr2) &&
            !areSetsEqual(attr1, attr2)
          ) {
            node1.data.subsetOf.push(attr2);
            sameNodesNotSubSetOther = [];
          }
        }
      });
    });

    if (sameNodesNotSubSetOther.length > 0) {
      for (let i = 0; i < sameNodesNotSubSetOther.length - 1; i++) {
        sameNodesNotSubSetOther[i].data.subsetOf.push(
          sameNodesNotSubSetOther[i].data.originalAttr
        );
      }
    }
  };

  useEffect(() => {
    if (selectedNode) {
      setFaultlyDependenciesFooter([]);
      let faultyDependenciesTmp = [];

      selectedNode.data.faultyDependencies.forEach((faultyDependency) => {
        faultyDependenciesTmp.push(faultyDependency.dependency);
      });

      selectedNode.data.faultyDependencies.forEach((faultyDependency) => {
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

  const removeNodeAndDescendants = (nodeId) => {
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
    removeNodeAndDescendants(node.id);

    // delete node from currLeafNodesList if it is there
    let updatedLeafNodes = currLeafNodesList.filter(
      (currNode) => currNode.id !== node.id
    );

    if (dependency) {
      const dataNode1 = nodeData([...dependency.left, ...dependency.right]);
      const dataNode2 = nodeData(
        node.data.originalAttr.filter(
          (item) => !dependency.right.includes(item)
        )
      );

      const newNode1 = {
        id: node.id + 1,
        type: "customNode",
        data: dataNode1,
        position,
      };

      const newNode2 = {
        id: node.id + 2,
        type: "customNode",
        data: dataNode2,
        position,
      };

      setNodesArray((prevNodes) => [...prevNodes, newNode1, newNode2]);

      const newEdge1 = {
        id: newNode1.id,
        source: node.id,
        target: newNode1.id,
        type: edgeType,
        label: showFunctionsInstance.showTextDependencyWithArrow(dependency),
      };

      const newEdge2 = {
        id: newNode2.id,
        source: node.id,
        target: newNode2.id,
        type: edgeType,
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

  const nodeBackgroundColor = (type, practiceMode) => {
    if (practiceMode) {
      return normalFormColor.practice; // White color when in practice mode
    }

    if (type === "BCNF") {
      return normalFormColor.BCNF; // Zelená
    } else if (type === "3") {
      return normalFormColor["3NF"]; // Zelená
    } else if (type === "2") {
      return normalFormColor["2NF"]; // Oranžová
    } else if (type === "1") {
      return normalFormColor["1NF"]; // Červená
    }
  };

  const randomDecomposition = () => {
    while (true) {
      let leafNodes = currLeafNodesList;
      let leafNodesWithFaultyDeps = [];
      for (let node of leafNodes) {
        if (
          node.data.faultyDependencies &&
          node.data.faultyDependencies.length > 0
        ) {
          leafNodesWithFaultyDeps.push(node);
        }
      }

      if (leafNodesWithFaultyDeps.length === 0) {
        break; // Ukonečení, pokud již neexistují listy s chybnými závislostmi
      }

      for (let leafNode of leafNodesWithFaultyDeps) {
        const moreDependencies = normalFormInstance.moreWayHowToSplitNode(
          leafNode.data
        );
        let faultyDependencies = [];

        for (let i = 0; i < leafNode.data.faultyDependencies.length; i++) {
          faultyDependencies.push(
            leafNode.data.faultyDependencies[i].dependency
          );
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

  const showRandomDecomposition = useCallback(() => {
    const restoreGraph = async () => {
      setNodesArray([]);
      setEdgesArray([]);
      setLostFDs([]);
      const initialNodes = [initialNode(attributes)];
      setNodesArray(initialNodes);
      currLeafNodesList = initialNodes;
    };

    restoreGraph();

    randomDecomposition();
  }, [setNodesArray, setEdgesArray]);

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
    } else if (selectedValue.toString() === selectedNode.data.type.toString()) {
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
    const totalCorrectAnswers = selectedNode.data.faultyDependencies.length;
    let correctAnswercounter = 0;

    const violateCheckboxes =
      document.getElementsByClassName("violateCheckbox");

    const checkChosenDependencyAnswer = (dependency, violateAnswer) => {
      for (let df of selectedNode.data.faultyDependencies) {
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
        title: "Správně!",
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
        title: "Vaše odpověď není správná!",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const showMergeTableModal = () => {
    setIsModalMergeTablesAfterDecomposeOpen(true);
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
                          backgroundColor: nodeBackgroundColor(
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
          <Background color="#ffffff" variant="lines" gap={0} />
        </ReactFlow>

        <ReactModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="custom-modal"
        >
          <div className="modal-header">
            <h2>{t("problem-decomposition.nodeDetail")}</h2>

            <button
              onClick={() => setIsModalOpen(false)}
              className="close-button"
            >
              X
            </button>
          </div>

          <div className="modal-content">
            {selectedNode && (
              <>
                <p>
                  <b>{t("problem-decomposition.attributes")}</b>{" "}
                  {selectedNode.data.label}
                </p>
                <p>
                  <b>{t("problem-decomposition.keys")}</b>{" "}
                  {showFunctionsInstance.showKeysAsText(
                    selectedNode.data.candidateKeys
                  )}{" "}
                </p>
                <p>
                  <b>{t("problem-decomposition.normalForm")}</b>{" "}
                  {selectedNode.data.type === "BCNF"
                    ? "BCNF"
                    : selectedNode.data.type + " NF"}
                </p>
                <ul>
                  {currLeafNodesList.length > 0 &&
                    !currLeafNodesList.some(
                      (node) => node.id === selectedNode.id
                    ) && (
                      <li key="dnd">
                        <button
                          onClick={() =>
                            handleDependencyClick(null, selectedNode)
                          }
                        >
                          {t("ownDecomposition.doNotDecompose")}
                        </button>
                      </li>
                    )}
                  {selectedNode.data.type !== "BCNF" && (
                    <li key="dm">
                      <button
                        onClick={() => setIsModalDecompositeOwnWayOpen(true)}
                      >
                        {t("ownDecomposition.decomposeManually")}
                      </button>
                    </li>
                  )}
                </ul>
              </>
            )}
          </div>

          <div className="modal-middle">
            {selectedNode && (
              <>
                <p>
                  <b>{t("problem-decomposition.dependencies")}</b>
                </p>
                {functionalDependencyFunctionsInstance
                  .mergeSingleRHSFDs(selectedNode.data.FDs)
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
            {selectedNode && (
              <>
                <div>
                  <b>{t("problem-decomposition.unwantedDependencies")}</b>
                  <ul>
                    {selectedNode.data.faultyDependencies.map(
                      (faultyDependency, index) => (
                        <li key={index}>
                          <button
                            onClick={() =>
                              handleDependencyClick(
                                faultyDependency.dependency,
                                selectedNode
                              )
                            }
                          >
                            {showFunctionsInstance.showTextDependencyWithArrow(
                              faultyDependency.dependency
                            )}{" "}
                            - porušuje {faultyDependency.violates}
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            {selectedNode && (
              <>
                <div>
                  <b>
                    <Trans
                      i18nKey="problem-decomposition.moreWayHowToDecomposite"
                      components={[<sup></sup>]}
                    />
                  </b>
                  <ul>
                    {faultlyDependenciesFooter.map(
                      (faultyDependency, index) => (
                        <li key={index}>
                          <button
                            onClick={() =>
                              handleDependencyClick(
                                faultyDependency,
                                selectedNode
                              )
                            }
                          >
                            {showFunctionsInstance.showTextDependencyWithArrow(
                              faultyDependency
                            )}
                          </button>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </ReactModal>

        <ReactModal
          isOpen={isPracticeModalOpen}
          onRequestClose={() => setIsPracticeModalOpen(false)}
          className="custom-modal minimal-cover-modal practice-modal custom-scroll"
        >
          <div className="modal-header">
            <h2>{t("problem-decomposition.nodeDetail")}</h2>

            <button
              onClick={() => setIsPracticeModalOpen(false)}
              className="close-button"
            >
              X
            </button>
          </div>

          <div className="modal-content">
            <div className="modal-content-header">
              {selectedNode && (
                <>
                  <p>
                    <b>{t("problem-decomposition.attributes")}</b>{" "}
                    {selectedNode.data.label}
                  </p>
                  <p>
                    <b>{t("problem-decomposition.keys")}</b>{" "}
                    {showFunctionsInstance.showKeysAsText(
                      selectedNode.data.candidateKeys
                    )}
                  </p>
                  <ul>
                    {currLeafNodesList.length > 0 &&
                      !currLeafNodesList.some(
                        (node) => node.id === selectedNode.id
                      ) && (
                        <li id="dnd">
                          <button
                            onClick={() =>
                              handleDependencyClick(null, selectedNode)
                            }
                          >
                            {t("ownDecomposition.doNotDecompose")}
                          </button>
                        </li>
                      )}
                    {selectedNode.data.type !== "BCNF" && (
                      <li id="dm">
                        <button
                          onClick={() => setIsModalDecompositeOwnWayOpen(true)}
                        >
                          {t("ownDecomposition.decomposeManually")}
                        </button>
                      </li>
                    )}
                  </ul>

                  <div className="normalFormPracticeArea">
                    <div className="radioButtonsArea">
                      <b>{t("problem-decomposition.normalForm")}</b>
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
                            selectedNode.data.originalAttr,
                            "normalForm"
                          )
                        }
                      >
                        {t("problem-decomposition.howToIdentifyNormalForm")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="practiceDependenciesArea">
              <p>{t("problem-decomposition.rewrittenDependenciesRHS")}</p>
              <button
                className="howButton"
                onClick={() =>
                  handleNavigateFromPracticeModal(
                    selectedNode.data.originalAttr,
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
        </ReactModal>

        <ReactModal
          isOpen={isModalDecompositeOwnWayOpen}
          onRequestClose={() => setIsModalDecompositeOwnWayOpen(false)}
          className="custom-modal"
        >
          <div className="modal-header">
            <h2>{t("problem-decomposition.insertYourDependency")}</h2>

            <button
              onClick={() => setIsModalDecompositeOwnWayOpen(false)}
              className="close-button"
            >
              X
            </button>
          </div>

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
          onRequestClose={() => setIsModalMergeTablesAfterDecomposeOpen(false)}
          className="custom-modal"
          style={{
            content: {
              overflowX: "hidden",
            },
          }}
        >
          <div className="modal-header">
            <h2>{t("problem-decomposition.tablesAfterDecomposition")}</h2>

            <button
              onClick={() => setIsModalMergeTablesAfterDecomposeOpen(false)}
              className="close-button"
            >
              X
            </button>
          </div>

          <div className="modal-content">
            <MergeTablesAfterDecompose
              tables={
                currLeafNodesList.length === 0 ? [nodes[0]] : currLeafNodesList
              }
              originKeys={nodes[0].data.candidateKeys}
              lostFDs={lostFDs}
            />
          </div>
        </ReactModal>
      </div>
    </div>
  );
};

export default Decomposition;
