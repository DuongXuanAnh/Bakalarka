import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { HelperColorFunctions } from "./HelperColorFunctions";
import { HelperSetFunctions } from "./HelperSetFunctions";
import { useTranslation } from "react-i18next";
import { ShowFunctions } from "./ShowFunctions";

const helperColorFunctionsInstance = new HelperColorFunctions();
const helperSetFunctionsInstance = new HelperSetFunctions();

// MKOP 2025/10/06
// Note: object.hasOwnProperty("propName")
// class node{
//   id: String,  ... Node ID ... "1", "2", ...
//   type: String, ... "customNode"
//   isSubset: Boolean, ... Is this node a subset of another node T/F?
//   subsetOfIndex: Integer, ... Zero-based index of the node this one is subset of
//   subsetOf: Array of Array of String, ... Set of longest nodes this one is a subset of ... TODO: Used by MergeTablesAfterDecompose.jsx, not by Decomposition.jsx. 
//   data { // Node data
//     attributes: Array of String, ... Set of attributes
//     label: String, ... Text representation of attributes
//     FDs: Array of object {left: Array of String, right: Array of String}, ... functional dependencies (??? in canonical form ???)
//     candidateKeys: Array of Array of String, ... Set of all keys of the node
//     keys: String, ... Text representation of candidateKeys
//     normalForm: String, ... "1", "2", "3", "BCNF" ... (originally type)
//     faultyFDs: Array of object {left: Array of String, right: Array of String}, ... faulty functional dependencies (??? in canonical form ???) ... (originally faultyDependencies)
//     subsetOf: Array of Array of String, ... Set of longest nodes this one is a subset of ... TODO: Used by Decomposition.jsx. Move to node, not keep in data 
//     }
//   }

export class CustomNodeFunctions {
  constructor() {
    // CustomNode functions
    this.highlightSubsetNodes = this.highlightSubsetNodes.bind(this);
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
        if ( onlyBCNF
             && ( table.data.normalForm != "BCNF" 
                  || otherTable.data.normalForm != "BCNF" ) ) return;

        const tableAttributes = table.data.attributes;
        const otherAttributes = otherTable.data.attributes;
        if ( helperSetFunctionsInstance.isRedundant(
               tableAttributes, index,
               otherAttributes, otherIndex
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
}

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
        background: helperColorFunctionsInstance.nodeBackgroundColor(node.data.normalForm, practiceMode),
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
          {t("problem-decomposition.customeNode.keys")} [ {node.data.keys} ]
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
