import React, { useState } from "react";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MinimalCoverFunction } from "../../../../algorithm/MinimalCoverFunction";
import { FunctionalDependencyFunctions } from "../../../../algorithm/FunctionalDependencyFunctions";
import "./redundantDependency.scss";

function RedundantDependency() {
  const { t } = useTranslation();
  const minimalCoverInstance = new MinimalCoverFunction();
  const functionalDependencyFunctionsInstance =
    new FunctionalDependencyFunctions();

  const navigate = useNavigate();

  const { dependencies } = useDependencyContext();

  const initialRewrittenFDs =
    functionalDependencyFunctionsInstance.rewriteFDSingleRHS(dependencies);
  const minimizeLHS_FDs =
    functionalDependencyFunctionsInstance.minimizeLHS(initialRewrittenFDs);

  const [displayedDependencies, setDisplayedDependencies] =
    useState(minimizeLHS_FDs);

  const [selectedFDs, setSelectedFDs] = useState({});
  const [showExpalantion, setShowExplanation] = useState(false);

  // Aktualizace výběru závislosti
  const handleSelectFD = (index) => {
    setSelectedFDs((prevSelectedFDs) => ({
      ...prevSelectedFDs,
      [index]: !prevSelectedFDs[index],
    }));
  };

  const handleCheckResult = () => {
    const selectedFDIndexes = Object.entries(selectedFDs)
      .filter(([index, isSelected]) => isSelected)
      .map(([index]) => parseInt(index));

    // Uspořádání závislostí tak, aby vybrané byly na začátku
    const reorderedDependencies = [
      // Nejprve vybrané závislosti
      ...selectedFDIndexes.map((index) => displayedDependencies[index]),
      // Pak závislosti, které nebyly vybrány
      ...displayedDependencies.filter(
        (_, index) => !selectedFDIndexes.includes(index)
      ),
    ];

    const minimalCover = minimalCoverInstance.minimalCover(
      reorderedDependencies
    );

    // Vytvoření verze reorderedDependencies bez vybraných závislostí pro porovnání
    const reorderedDependenciesWithoutSelected = displayedDependencies.filter(
      (_, index) => !selectedFDIndexes.includes(index)
    );

    // Porovnání minimalCover s reorderedDependenciesWithoutSelected
    const areEqual =
      JSON.stringify(minimalCover) ===
      JSON.stringify(reorderedDependenciesWithoutSelected);

    if (areEqual) {
      Swal.fire({
        title: t("problem-redundantDependency.congratulations"),
        text: t("problem-redundantDependency.correctSelection"),
        icon: "success",
        confirmButtonText: t("problem-redundantDependency.closeButton"),
      });
    } else {
      Swal.fire({
        title: t("problem-redundantDependency.tryAgain"),
        text: t("problem-redundantDependency.wrongSelection"),
        icon: "error",
        confirmButtonText: t("problem-redundantDependency.closeButton"),
      });
    }
  };

  const handleShowResult = () => {
    // Výpočet minimalCover po potvrzení
    const minimalCover = minimalCoverInstance.minimalCover(
      displayedDependencies
    );

    // Převod minimalCover na string pro snadné porovnání
    const minimalCoverStrings = minimalCover.map((fd) =>
      JSON.stringify({ left: fd.left, right: fd.right })
    );

    // Inicializace nového stavu pro selectedFDs
    const newSelectedFDs = {};

    let noRedundant = true;

    displayedDependencies.forEach((fd, index) => {
      // Převedení každé závislosti na string pro porovnání
      const fdString = JSON.stringify({ left: fd.left, right: fd.right });

      // Označení závislosti jako vybrané, pokud není součástí minimalCover
      if (!minimalCoverStrings.includes(fdString)) {
        newSelectedFDs[index] = true;
        noRedundant = false;
      }
    });

    if (noRedundant) {
      Swal.fire({
        title: t("problem-redundantDependency.noRedundantDependencies"),
        icon: "info",
        confirmButtonText: t("problem-redundantDependency.closeButton"),
      });
    }
    // Aktualizace stavu selectedFDs
    setSelectedFDs(newSelectedFDs);
    setShowExplanation(true);
  };

  const reverseDependencies = () => {
    setDisplayedDependencies((prevDeps) => [...prevDeps].reverse());
    setSelectedFDs({});
  };

  const mixRandomDependencies = () => {
    setSelectedFDs({});
    setDisplayedDependencies((prevFDs) => {
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

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(displayedDependencies);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDisplayedDependencies(items); // Nastavte nově uspořádané závislosti
    // Resetujte výběr závislosti po přeuspořádání
    setSelectedFDs({});
  };

  return (
    <div className="redundantDependency-container">
      <h2 className="h2Title">{t("problem-redundantDependency.title")}</h2>

      <div className="centerContent">
        <button onClick={reverseDependencies} className="reverse_btn">
          {t("problem-redundantDependency.reverseDependenciesButton")}
        </button>
        <button onClick={mixRandomDependencies} className="mixRandom_btn">
          {t("global.mixDependenciesRandomly")}
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dependencies">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {displayedDependencies.map((fd, index) => (
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
                      onClick={(e) => {
                        if (
                          e.target.type !== "checkbox" &&
                          e.target.tagName !== "LABEL"
                        ) {
                          handleSelectFD(index);
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`fd-${index}`}
                        checked={!!selectedFDs[index]}
                        onChange={() => handleSelectFD(index)}
                      />
                      <label htmlFor={`fd-${index}`}>
                        {fd.left.join(",")} → {fd.right.join(",")}
                      </label>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <div className="btnWrapper">
        <button className="btnCheckResult" onClick={handleCheckResult}>
          {t("problem-redundantDependency.checkResultButton")}
        </button>
        <button className="btnShowResult" onClick={handleShowResult}>
          {t("problem-redundantDependency.showResultButton")}
        </button>
      </div>

      {showExpalantion && (
        <div className="showRedundantDependenciesResultArea">
          <h2 className="underlineText">
            {t("problem-redundantDependency.explanation")}
          </h2>
          <div className="explainArea">
            <p>{t("problem-redundantDependency.explanation-Step1")}</p>
            <p>
              {t("problem-redundantDependency.step2-part1")}
              <span> </span>
              <span
                className="clickAbleText"
                onClick={() => navigate("/problems/attributeClosure")}
              >
                {t("global.attributeClosure")}
              </span>
              <span> </span>
              {t("problem-redundantDependency.step2-part2")}
            </p>
            <p>{t("problem-redundantDependency.explanation-Step3")}</p>
            <p>{t("problem-redundantDependency.explanation-Step4")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RedundantDependency;
