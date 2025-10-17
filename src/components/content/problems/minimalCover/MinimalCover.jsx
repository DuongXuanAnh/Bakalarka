import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useDependencyContext } from "../../../../contexts/DependencyContext";
import ReactModal from "react-modal";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import "./minimalCover.scss";
import { FunctionalDependencyFunctions } from "../../../../algorithm/FunctionalDependencyFunctions";
import { HelperSetFunctions } from "../../../../algorithm/HelperSetFunctions";
import { ShowFunctions } from "../../../../algorithm/ShowFunctions";

const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();
const helperSetFunctionsInstance = new HelperSetFunctions();
const showFunctionsInstance = new ShowFunctions();
function MinimalCover() {
  const { t } = useTranslation();

  const { dependencies } = useDependencyContext();

  const initialRewrittenFDs =
    functionalDependencyFunctionsInstance.rewriteFDSingleRHS(dependencies);

  const [rewrittenFDs, setRewrittenFDs] = useState(initialRewrittenFDs);

  const [currentStep, setCurrentStep] = useState(0);
  const [isModalOpenStep13, setIsModalOpenStep13] = useState(false);
  const [isModalOpenStep2, setIsModalOpenStep2] = useState(false);

  const [modalContent, setModalContent] = useState({});

  const [checkedDependencies, setCheckedDependencies] = useState(new Set());

  const maxSteps = 4;

  // Remove trivial FDs (those where the RHS is also in the LHS)
  const nonTrivial_FDs =
    functionalDependencyFunctionsInstance.removeTrivialFDs(rewrittenFDs);

  // Minimize LHS of each FD.
  const minimizeLHS_FDs =
    functionalDependencyFunctionsInstance.minimizeLHS(nonTrivial_FDs);

  const removeRedundant_FDs =
    functionalDependencyFunctionsInstance.removeRedundantFDs(minimizeLHS_FDs);

  const endRef = useRef(null);
  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [currentStep]);

  useEffect(() => {
    if (!isModalOpenStep13 || !isModalOpenStep2) {
      setCheckedDependencies(new Set()); // Resetuje výběr checkboxů.
    }
  }, [isModalOpenStep13, isModalOpenStep2]);

  const showNextStep = () => {
    setCurrentStep((currentStep) => Math.min(currentStep + 1, maxSteps));
  };

  // Funkce pro zobrazení všech kroků
  const showAllSteps = () => {
    setCurrentStep(maxSteps);
  };

  const handleCheckboxChange = (index) => {
    setCheckedDependencies((prev) => {
      const newChecked = new Set(prev);
      if (newChecked.has(index)) {
        newChecked.delete(index);
      } else {
        newChecked.add(index);
      }
      return newChecked;
    });
  };

  const handleAttributeCheckboxChange = (fdIndex, attrIndex) => {
    setCheckedDependencies((prevChecked) => {
      // Vytvoření kopie předchozího stavu pro úpravu
      const newChecked = { ...prevChecked };

      // Přidání nebo odstranění attrIndex z pole na základě přítomnosti
      if (newChecked[fdIndex]) {
        // Pokud již existuje klíč pro fdIndex, aktualizujeme jeho hodnotu
        const indexPosition = newChecked[fdIndex].indexOf(attrIndex);
        if (indexPosition > -1) {
          // Odstranit, pokud už index existuje
          newChecked[fdIndex].splice(indexPosition, 1);
          // Pokud po odstranění nezůstane žádný index, odstraníme i klíč
          if (newChecked[fdIndex].length === 0) {
            delete newChecked[fdIndex];
          }
        } else {
          newChecked[fdIndex].push(attrIndex);
        }
      } else {
        // Vytvořit nový klíč s hodnotou [attrIndex], pokud klíč pro fdIndex neexistuje
        newChecked[fdIndex] = [attrIndex];
      }
      return newChecked;
    });
  };

  const practiceNextStep = () => {
    let content = {};
    switch (currentStep) {
      case 1:
        content = {
          title: t("problem-minimalCover.modalTitle.removeTrivialFDs"),
          dependencies: rewrittenFDs,
          buttonText: t("problem-minimalCover.modalButtonConfirm"),
          step: 1,
          note: t("problem-minimalCover.modalNote.selectTrivialFDs"),
        };
        setIsModalOpenStep13(true); // Otevření modálního okna

        break;
      case 2:
        content = {
          title: t("problem-minimalCover.modalTitle.removeRedundantAttributes"),
          dependencies: nonTrivial_FDs,
          buttonText: t("problem-minimalCover.modalButtonConfirm"),
          step: 2,
          note: t("problem-minimalCover.modalNote.markRedundantAttributes"),
        };
        setIsModalOpenStep2(true);
        break;
      case 3:
        content = {
          title: t("problem-minimalCover.modalTitle.removeRedundantFDs"),
          dependencies: minimizeLHS_FDs,
          buttonText: t("problem-minimalCover.modalButtonConfirm"),
          step: 3,
          note: t("problem-minimalCover.modalNote.selectRedundantFDs"),
        };
        setIsModalOpenStep13(true); // Otevření modálního okna

        break;
      // Přidat další case podle potřeby
    }
    setModalContent(content); // Nastavení obsahu modálního okna
  };

  const submitAnswer = (content) => {
    let checkCount = 0;
    if (content.step === 1) {
      if (
        nonTrivial_FDs.length === rewrittenFDs.length &&
        checkedDependencies.size > 0
      ) {
        errorAlert();
        return;
      }

      content.dependencies.forEach((dependency, index) => {
        if (checkedDependencies.has(index)) {
          if (!isNonTrivial(dependency)) {
            checkCount++;
          } else {
            checkCount = 0;
            errorAlert();
            return;
          }
        }
      });

      if (nonTrivial_FDs.length + checkCount === rewrittenFDs.length) {
        successAlert();
        setIsModalOpenStep13(false);
        showNextStep();
      } else {
        errorAlert();
      }
    } else if (content.step === 2) {
      let isError = false;

      nonTrivial_FDs.map((fd, index) => {
        if (isError) return;

        const reducedLeftSide =
          functionalDependencyFunctionsInstance.getReducedAttributes(
            nonTrivial_FDs,
            fd.left,
            fd.right
          );

        if (checkedDependencies[index] !== undefined) {
          // Smaze označené atributy na leve strane
          const newArray = fd.left.filter(
            (element, i) => !checkedDependencies[index].includes(i)
          );
          if (newArray.sort().join(",") !== reducedLeftSide.sort().join(",")) {
            errorAlert();
            isError = true;
            return;
          }
        } else {
          if (reducedLeftSide.length !== fd.left.length) {
            errorAlert();
            isError = true;
            return;
          }
        }
      });

      if (!isError) {
        successAlert();
        setIsModalOpenStep2(false);
        showNextStep();
      }
    } else if (content.step === 3) {
      if (
        removeRedundant_FDs.length === minimizeLHS_FDs.length &&
        checkedDependencies.size > 0
      ) {
        errorAlert();
        return;
      }

      content.dependencies.forEach((dependency, index) => {
        if (checkedDependencies.has(index)) {
          if (isRedundant(dependency, index)) {
            checkCount++;
          } else {
            checkCount = 0;
            errorAlert();
            return;
          }
        }
      });
      if (removeRedundant_FDs.length + checkCount === minimizeLHS_FDs.length) {
        successAlert();
        setIsModalOpenStep13(false);
        showNextStep();
      } else {
        errorAlert();
      }
    }
  };

  const successAlert = () => {
    Swal.fire({
      title: t("problem-minimalCover.successAlertTitle"),
      text: t("problem-minimalCover.successAlertText"),
      icon: "success",
      confirmButtonText: t("problem-minimalCover.continue"),
    });
  };

  const errorAlert = () => {
    Swal.fire({
      title: t("problem-minimalCover.errorAlertTitle"),
      text: t("problem-minimalCover.errorAlertText"),
      icon: "error",
      confirmButtonText: t("problem-minimalCover.close"),
    });
  };

  const onDragEnd = (result) => {
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

  // Function to check if an FD is non-trivial
  const isNonTrivial = (fd) => {
    return nonTrivial_FDs.some(
      (nonTrivialFD) =>
        nonTrivialFD.left.join(",") === fd.left.join(",") &&
        nonTrivialFD.right.join(",") === fd.right.join(",")
    );
  };
  // Function to check if an FD is redundant
  const isRedundant = (fd, index) => {
    if (
      helperSetFunctionsInstance.existsInArray(
        minimizeLHS_FDs.slice(index + 1),
        fd
      )
    ) {
      return true;
    }

    return !removeRedundant_FDs.some(
      (redundantFD) =>
        redundantFD.left.join(",") === fd.left.join(",") &&
        redundantFD.right.join(",") === fd.right.join(",")
    );
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

  return (
    <>
      <div className="MinimalCoverFinalResult">
        <h3>{t("problem-minimalCover.finalResultTitle")}</h3>
        <span className="note">
          {t("problem-minimalCover.finalResultNote")}
        </span>
        {removeRedundant_FDs.map((fd, index) => (
          <div key={index} className="functionalDependency">
            {showFunctionsInstance.showTextDependencyWithArrow(fd)}
          </div>
        ))}
      </div>

      <h2 className="center">{t("problem-minimalCover.processTitle")}</h2>

      {currentStep >= 1 && (
        <div className="DependenciesOneRigthAttrContainer">
          <h3>
            <button onClick={reverseDependencies} className="reverse_btn">
              {t("problem-minimalCover.reverseDependenciesButton")}
            </button>
            <button onClick={mixRandomDependencies} className="mixRandom_btn">
              {t("global.mixDependenciesRandomly")}
            </button>
            {t("problem-minimalCover.step1Title")}
          </h3>
          <div className="note"> {t("problem-minimalCover.step1Note")}</div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {rewrittenFDs.map((fd, index) => (
                    <Draggable
                      key={index}
                      draggableId={String(index)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="functionalDependency"
                        >
                          {showFunctionsInstance.showTextDependencyWithArrow(
                            fd
                          )}
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
      )}

      {currentStep >= 2 && (
        <div className="removedTrivialFDsContainer">
          <h3>{t("problem-minimalCover.step2Title")}</h3>
          <div className="note">{t("problem-minimalCover.step2Note")}</div>
          {rewrittenFDs.map((fd, index) => (
            <div
              key={index}
              className={`functionalDependency ${
                !isNonTrivial(fd) ? "line-through" : ""
              }`}
            >
              {showFunctionsInstance.showTextDependencyWithArrow(fd)}
            </div>
          ))}
        </div>
      )}

      {currentStep >= 3 && (
        <div className="minimizeLHS">
          <h3>{t("problem-minimalCover.step3Title")}</h3>
          {nonTrivial_FDs.map((fd, index) =>
            fd && minimizeLHS_FDs[index] ? (
              <div key={index} className="functionalDependency">
                {fd.left.map((attr, attrIndex) => {
                  const isRedundant =
                    !minimizeLHS_FDs[index].left.includes(attr);
                  const isLastAttr = attrIndex === fd.left.length - 1;
                  return (
                    <span
                      key={attrIndex}
                      className={isRedundant ? "redundant" : ""}
                    >
                      {attr + (isLastAttr ? "" : ",")}
                    </span>
                  );
                })}
                <span>
                  {" "}
                  <span>→</span> {fd.right}
                </span>
              </div>
            ) : null
          )}
        </div>
      )}

      {currentStep === maxSteps && (
        <div className="removeRedundantFDs">
          <h3>{t("problem-minimalCover.step4Title")}</h3>
          {minimizeLHS_FDs.map((fd, index) => (
            <div
              key={index}
              className={`functionalDependency ${
                isRedundant(fd, index) ? "line-through" : ""
              }`}
            >
              {showFunctionsInstance.showTextDependencyWithArrow(fd)}
            </div>
          ))}
        </div>
      )}

      <div className="controlButtons">
        {currentStep < 4 && (
          <button className="showStepByStep_btn" onClick={showNextStep}>
            {t("problem-minimalCover.showStepByStepButton")}
          </button>
        )}
        {currentStep >= 1 && currentStep < 4 && (
          <button className="practiceNextStep_btn" onClick={practiceNextStep}>
            {t("problem-minimalCover.practiceNextStepButton")}
          </button>
        )}
        {currentStep < 4 && (
          <button className="showAllStep_btn" onClick={showAllSteps}>
            {t("problem-minimalCover.showAllStepsButton")}
          </button>
        )}
      </div>

      <ReactModal
        isOpen={isModalOpenStep13}
        onRequestClose={() => setIsModalOpenStep13(false)}
        className="custom-modal minimal-cover-modal"
      >
        <h2 className="modalTitle">{modalContent.title}</h2>
        <span className="note">{modalContent.note}</span>
        <div className="dependency-checkbox-container">
          {modalContent.dependencies?.map((dependency, index) => (
            <div key={index} className="dependency-checkbox">
              <input
                type="checkbox"
                id={`dependency-${index}`}
                name={`dependency-${index}`}
                onChange={() => handleCheckboxChange(index)}
              />
              <label htmlFor={`dependency-${index}`} className="checkbox-label">
                {showFunctionsInstance.showTextDependencyWithArrow(dependency)}
              </label>
            </div>
          ))}
        </div>

        <button
          onClick={() => submitAnswer(modalContent)}
          className="submitAnswerButton"
        >
          {modalContent.buttonText || t("problem-minimalCover.close")}
        </button>
      </ReactModal>

      <ReactModal
        isOpen={isModalOpenStep2}
        onRequestClose={() => setIsModalOpenStep2(false)}
        className="custom-modal minimal-cover-modal"
      >
        <h2 className="modalTitle">{modalContent.title}</h2>
        <span className="note">{modalContent.note}</span>
        <div className="dependency-checkbox-container">
          {modalContent.dependencies?.map((dependency, fdIndex) => (
            <div key={fdIndex} className="dependency-group">
              {dependency.left.map((attribute, attrIndex) => (
                <div
                  key={`${fdIndex}-${attrIndex}`}
                  className="dependency-checkbox"
                >
                  <input
                    type="checkbox"
                    id={`dependency-${fdIndex}-${attrIndex}`}
                    name={`dependency-${fdIndex}-${attrIndex}`}
                    onChange={() =>
                      handleAttributeCheckboxChange(
                        fdIndex,
                        attrIndex,
                        attribute
                      )
                    }
                  />
                  <label
                    htmlFor={`dependency-${fdIndex}-${attrIndex}`}
                    className="checkbox-label"
                  >
                    {attribute}
                  </label>
                </div>
              ))}
              <span className="dependency-right">
                {" "}
                → {showFunctionsInstance.dependencySideArrayToText(dependency.right)}
              </span>
            </div>
          ))}
        </div>
        <button
          onClick={() => submitAnswer(modalContent)}
          className="submitAnswerButton"
        >
          {modalContent.buttonText || t("problem-minimalCover.close")}
        </button>
      </ReactModal>

      <div ref={endRef} />
    </>
  );
}

export default MinimalCover;
