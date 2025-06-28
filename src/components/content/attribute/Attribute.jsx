import React, { useState, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useNavigate } from "react-router-dom";
import { useAttributeContext } from "../../../contexts/AttributeContext";
import { useDependencyContext } from "../../../contexts/DependencyContext";
import {
  getFirestore,
  getDoc,
  getDocs,
  doc,
  collection,
  deleteDoc,
} from "firebase/firestore";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";
import "./attributeMobile.scss";
import "./attribute.scss";
import {
  password,
  colectionName,
} from "../../../constantValues/constantValues";

export default function Attribute() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [dragDirection, setDragDirection] = useState(
    window.innerWidth <= 991 ? "vertical" : "horizontal"
  );

  const updateMaxItems = () => {
    setDragDirection(window.innerWidth <= 991 ? "vertical" : "horizontal");
  };

  const { attributes, setAttributes } = useAttributeContext();

  const { setDependencies } = useDependencyContext();

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    updateMaxItems(); // Aktualizujeme maxItems při prvním renderování

    window.addEventListener("resize", updateMaxItems);

    return () => {
      window.removeEventListener("resize", updateMaxItems);
    };
  }, []);

  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }

      const newAttributes = Array.from(attributes);
      const [reorderedItem] = newAttributes.splice(result.source.index, 1);
      newAttributes.splice(result.destination.index, 0, reorderedItem);

      setAttributes(newAttributes);
    },
    [attributes, setAttributes]
  );

  const handleAddAttribute = useCallback(() => {
    const normalizedInput = inputValue.toLowerCase();
    const normalizedAttributes = attributes.map((attr) => attr.toLowerCase());

    if (normalizedAttributes.includes(normalizedInput)) {
      Swal.fire(t("content-attribute.alert_attributeExists"), "", "warning");
      return;
    }

    if (inputValue && attributes.length < 15) {
      setAttributes((prevAttributes) => [...prevAttributes, inputValue]);
      setInputValue("");
    } else if (attributes.length >= 15) {
      Swal.fire(t("content-attribute.alert_maxAttributes"), "", "warning");
    }
  }, [attributes, inputValue]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleAddAttribute();
      }
    },
    [handleAddAttribute]
  );

  const handleRemoveAttribute = useCallback((attributeId) => {
    setDependencies([]);
    setAttributes((prevAttributes) =>
      prevAttributes.filter((attr) => attr !== attributeId)
    );
  }, []);

  const handleInputChange = useCallback((event) => {
    setInputValue(event.target.value);
  }, []);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const fileContent = e.target.result;

          // Function to validate file format
          const validateFileFormat = (content) => {
            try {
              const attributesRegex = /Attributes:\s*\[([^\]]+)\]/;
              const dependenciesRegex =
                /Dependencies:\s*(\[\s*{[\s\S]*?}\s*\])/;

              const attributesMatches = attributesRegex.exec(content);
              const dependenciesMatches = dependenciesRegex.exec(content);

              if (!attributesMatches || !dependenciesMatches) {
                return {
                  isValid: false,
                  error: t("content-attribute.alert_fileFormat_wrong"),
                };
              }

              const attributesStr = attributesMatches[1];
              if (!attributesStr || attributesStr.trim() === "") {
                return {
                  isValid: false,
                  error: "Attributes section cannot be empty",
                };
              }

              const dependenciesStr = dependenciesMatches[1];
              let dependencies;
              try {
                dependencies = JSON.parse(dependenciesStr);
              } catch (jsonError) {
                return {
                  isValid: false,
                  error: "Dependencies section contains invalid JSON",
                };
              }

              if (!Array.isArray(dependencies)) {
                return {
                  isValid: false,
                  error: "Dependencies must be an array",
                };
              }

              for (let i = 0; i < dependencies.length; i++) {
                const dep = dependencies[i];
                if (!dep || typeof dep !== "object") {
                  return {
                    isValid: false,
                    error: `Dependency ${i + 1} is not a valid object`,
                  };
                }

                if (
                  !dep.hasOwnProperty("left") ||
                  !dep.hasOwnProperty("right")
                ) {
                  return {
                    isValid: false,
                    error: `Dependency ${
                      i + 1
                    } must have both 'left' and 'right' properties`,
                  };
                }

                if (!Array.isArray(dep.left) || !Array.isArray(dep.right)) {
                  return {
                    isValid: false,
                    error: `Dependency ${
                      i + 1
                    }: 'left' and 'right' must be arrays`,
                  };
                }
              }

              return { isValid: true };
            } catch (error) {
              return {
                isValid: false,
                error: "Error parsing file content",
              };
            }
          };

          const validation = validateFileFormat(fileContent);

          if (!validation.isValid) {
            Swal.fire({
              title: t("content-attribute.alert_fileFormat_title"),
              text: validation.error,
              icon: "error",
              confirmButtonText: "OK",
            });
            event.target.value = "";
            return;
          }

          const attributesRegex = /Attributes:\s*\[([^\]]+)\]/;
          const dependenciesRegex = /Dependencies:\s*(\[\s*{[\s\S]*?}\s*\])/;

          const attributesMatches = attributesRegex.exec(fileContent);
          const dependenciesMatches = dependenciesRegex.exec(fileContent);

          if (attributesMatches && attributesMatches.length >= 2) {
            const fileAttributes = attributesMatches[1]
              .split(",")
              .map((attr) => attr.trim().replace(/"/g, ""));

            setAttributes(fileAttributes);
          }

          if (dependenciesMatches && dependenciesMatches.length >= 2) {
            const fileDependencies = JSON.parse(dependenciesMatches[1]);
            console.log(fileDependencies);
            setDependencies(fileDependencies);
          }

          Swal.fire({
            title: t("content-attribute.alert_fileFormat_correct"),
            text: t("content-attribute.alert_fileFormat_correct_text"),
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        };

        reader.readAsText(file);
      }
    },
    [setAttributes, setDependencies]
  );

  const uploadFile = () => {
    const fileInput = document.getElementById("fileInput");
    fileInput.click();
  };

  const chooseExampleInDB = async () => {
    const db = getFirestore();
    const collectionRef = collection(db, colectionName); // *konstanta (treba to pak nahradit za globalni promenu)

    try {
      const querySnapshot = await getDocs(collectionRef);
      const documentNames = [];
      querySnapshot.forEach((doc) => {
        documentNames.push(doc.id);
      });

      (async () => {
        const { value: databaseName } = await Swal.fire({
          title: t("content-attribute.select_exampleDatabase"),
          input: "select",
          inputOptions: Object.fromEntries(
            documentNames.map((name) => [name, name])
          ),
          inputPlaceholder: t(
            "content-attribute.input_placeholder_exampleNames"
          ),
          showCancelButton: true,
          showDenyButton: true, // Přidání tlačítka pro smazání
          denyButtonText: "Delete example", // Text pro tlačítko smazání
          preDeny: () => {
            const selectedOption =
              document.querySelector(".swal2-select").value;
            openDialogInputAdminPassword(selectedOption);
          },
        });
        if (databaseName) {
          readExampleFromDB(databaseName);
        }
      })();

      return documentNames;
    } catch (e) {
      console.error(`Error getting documents:`, e);
      return [];
    }
  };

  const readExampleFromDB = async (problemName) => {
    const db = getFirestore();
    const docRef = doc(db, "problems", problemName);
    try {
      const doc = await getDoc(docRef);
      if (doc.exists) {
        const attributes = doc.data().attributes;
        const dependencies = doc.data().dependencies;
        setAttributes(attributes);
        setDependencies(dependencies);
      } else {
        console.log(`Document ${problemName} not found.`);
      }
    } catch (e) {
      console.error(`Error getting document ${problemName}:`, e);
    }
  };

  const openDialogInputAdminPassword = async (databaseName) => {
    const { value: adminPasswordDialog } = await Swal.fire({
      title: t("content-attribute.dialog_deleteExample"),
      html: `
        <input id="swal-input-adminPassword" class="swal2-input" type="password" placeholder="Administrační heslo">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          adminPassword: document.getElementById("swal-input-adminPassword")
            .value,
        };
      },
    });

    if (adminPasswordDialog) {
      if (adminPasswordDialog.adminPassword === password) {
        deleteExampleFromDB(databaseName);
      } else {
        Swal.fire(t("content-attribute.alert_invalidPassword"));
      }
    }
  };

  const deleteExampleFromDB = async (problemName) => {
    const db = getFirestore();
    const docRef = doc(db, "problems", problemName);
    try {
      await deleteDoc(docRef);
      Swal.fire({
        text: t("content-attribute.alert_exampleDeleted"),
        icon: "success",
      });
    } catch (e) {
      console.error(`Error deleting document ${problemName}:`, e);
    }
  };

  return (
    <React.Fragment>
      <div className="attributeContainer">
        <h1 className="title">{t("content-attribute.h1-main-title")}</h1>

        <button
          type="button"
          className="btn-loadExample"
          onClick={() => chooseExampleInDB()}
        >
          {t("content-attribute.btn_loadFromBD")}
        </button>

        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          type="button"
          className="btn-uploadFile"
          onClick={() => uploadFile()}
        >
          {t("content-attribute.btn_loadFromComputer")}
        </button>

        <p className="label">{t("content-attribute.label_addAttributes")}</p>

        <input
          type="text"
          placeholder={t("content-attribute.input_placeholder_newAttribute")}
          className="newAttrTextBox"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          maxLength={10}
        />
        <button
          type="button"
          className="btn-addNewAttribute"
          onClick={handleAddAttribute}
        >
          +
        </button>

        <div className="area-attributes">
          {attributes.length === 0 ? (
            <p>{t("content-attribute.msg_noAttributes")}</p>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="attributes" direction={dragDirection}>
                {(provided) => (
                  <div
                    className="attribute-attributesContainer"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <h3>{t("content-attribute.list_attributes")}</h3>
                    <ul>
                      {attributes.map((attribute, index) => (
                        <Draggable
                          key={attribute}
                          draggableId={attribute}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`attribute-attrInList ${
                                snapshot.isDragging ? "dragging" : ""
                              }`}
                            >
                              <div className="wholeAttribute">
                                <div className="attributeName">{attribute}</div>
                                <button
                                  className="removeButton"
                                  onClick={() =>
                                    handleRemoveAttribute(attribute)
                                  }
                                >
                                  x
                                </button>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        <div className="schema">
          <h2>{t("content-attribute.schema_title")}</h2>
          {attributes.length > 0 ? (
            <p className="IS">IS ( {attributes.join(", ")} )</p>
          ) : (
            <p>{t("content-attribute.schema_placeholder")}</p>
          )}
        </div>

        {attributes.length > 0 && (
          <button
            type="button"
            className="btn-nextPageDependency"
            onClick={() => navigate("/dependencies")}
          >
            {t("content-attribute.btn_setDependencies")}
          </button>
        )}
      </div>
    </React.Fragment>
  );
}
