import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { normalFormColor } from "../../../../constantValues/constantValues";
import { useTranslation } from "react-i18next";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";

const nodeWidth = "200px"; // Nastavení šířky

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
        background: nodeBackgroundColor(node.data.type, practiceMode),
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
