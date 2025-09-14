import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { HelperColorFunctions } from "../../../../algorithm/HelperColorFunctions";
import { useTranslation } from "react-i18next";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";

const helperColorFunctionsInstance = new HelperColorFunctions();

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
        background: helperColorFunctionsInstance.nodeBackgroundColor(node.data.type, practiceMode),
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
