import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./problems.scss";
import { useDependencyContext } from "../../../contexts/DependencyContext";
import { useAttributeContext } from "../../../contexts/AttributeContext";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { ShowFunctions } from "../../../algorithm/ShowFunctions";
import { password } from "../../../constantValues/constantValues";
import { db } from "../../../config/firebase";

// Funkce pro kontrolu speciálních znaků v názvu dokumentu
const containsSpecialCharacters = (name) => {
  // Regulární výraz pro kontrolu speciálních znaků jako jsou `/`, `\`, `->` apod.
  const regex = /[\/\\\->]/g;
  return regex.test(name);
};

export default function Problems() {
  const { t } = useTranslation();
  const { attributes } = useAttributeContext();
  const { dependencies } = useDependencyContext();
  const navigate = useNavigate();

  const showFunctionsInstance = new ShowFunctions();

  const directTo = (path) => {
    navigate(path);
  };

  useEffect(() => {
    sessionStorage.removeItem("decompositionState");
    sessionStorage.removeItem("normalFormState");
  }, []);

  useEffect(() => {
    let everythingOk = true;

    dependencies.map((dep) => {
      if (dep.left.length === 0 || dep.right.length === 0) {
        everythingOk = false;
        return;
      }
    });

    if (everythingOk) {
      navigate("/problems");
    } else {
      Swal.fire({
        icon: "warning",
        title: t("content-dependencies.unfinishedDependency"),
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/dependencies");
      });
    }
  }, []);

  const saveProblem = () => {
    // Vytvoříme textový obsah s atributy a závislostmi
    const attributesText = attributes.join(", ");
    const dependenciesText = JSON.stringify(dependencies, null, 2);
    const content = `Attributes: [${attributesText}]\nDependencies: ${dependenciesText}`;

    // Vytvoříme funkci pro vytvoření a stažení souboru
    const downloadFile = (content, fileName) => {
      const blob = new Blob([content], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    downloadFile(content, "problem.txt");
  };

  const showSavingDatabasePopup = async () => {
    const { value: formValues } = await Swal.fire({
      title: t("content-problems.saveToServer"),
      html: `
          <input id="swal-input-databaseName" class="swal2-input" placeholder="${t(
            "content-problems.input_placeholder_databaseName"
          )}">
          <input id="swal-input-adminPassword" class="swal2-input" type="password" placeholder="${t(
            "content-problems.input_placeholder_adminPassword"
          )}">
        `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          databaseName: document.getElementById("swal-input-databaseName")
            .value,
          adminPassword: document.getElementById("swal-input-adminPassword")
            .value,
        };
      },
    });

    if (formValues) {
      if (formValues.adminPassword === password) {
        // Zobrazení názvu databáze
        const databaseName = formValues.databaseName;
        saveProblemAsAdmin(databaseName);
      } else {
        Swal.fire(t("content-problems.alert_invalidPassword"));
      }
    }
  };

  const saveProblemAsAdmin = async (documentName) => {
    const db = getFirestore();

    // Zkontrolujte, zda `documentName` obsahuje nepovolené znaky
    if (containsSpecialCharacters(documentName)) {
      Swal.fire({
        title: t("content-problems.invalidDocumentName"),
        text: t("content-problems.alert_invalidDocumentName"),
        icon: "error",
        confirmButtonText: "OK",
      });
      return; // Ukončí funkci, pokud byly nalezeny nepovolené znaky
    }

    // Reference na dokument
    const docRef = doc(db, "problems", documentName);

    // Kontrola, zda dokument již existuje
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // Dokument již existuje
      Swal.fire({
        title: t("content-problems.warning_title"),
        text: t("content-problems.warning_text"),
        icon: "warning",
      });
    } else {
      // Dokument neexistuje, vytvoření objektu problému
      const problemData = {
        attributes,
        dependencies,
      };

      // Uložení problému do kolekce 'problems' s dokumentem pojmenovaným podle documentName
      try {
        await setDoc(doc(db, "problems", documentName), problemData);
        Swal.fire({
          text: t("content-problems.alert_saveSuccess"),
          icon: "success",
        });
      } catch (e) {
        console.error(`Error saving problem document '${documentName}':`, e);
      }
    }
  };

  return (
    <div className="problemContainer">
      <h1>{t("content-problems.title_problem")}</h1>
      <h2>{t("content-problems.title_schema")}</h2>
      {attributes.length > 0 ? (
        <p className="IS">IS ( {attributes.join(", ")} )</p>
      ) : (
        <p>{t("content-problems.schema_placeholder")}</p>
      )}

      <h2>{t("content-problems.title_dependencies")}</h2>
      <p className="dependencies">
        F = &#123; {showFunctionsInstance.dependenciesArrayToText(dependencies)}
        &#125;
      </p>

      <button onClick={() => saveProblem()} className="saveButton">
        {t("content-problems.saveExample")}
      </button>
      <button onClick={() => showSavingDatabasePopup()} className="saveButton">
        {t("content-problems.saveToServer")}
      </button>

      <div className="problemButtonsContainer">
        <button onClick={() => directTo("attributeClosure")}>
          {t("content-problems.attributeClosure")}
        </button>
        <button onClick={() => directTo("redundantAttribute")}>
          {t("content-problems.redundantAttribute")}
        </button>
        <button onClick={() => directTo("redundantDependency")}>
          {t("content-problems.redundantDependency")}
        </button>
        <button onClick={() => directTo("minimalCover")}>
          {t("content-problems.minimalCover")}
        </button>
        <button onClick={() => directTo("firstKey")}>
          {t("content-problems.firstKey")}
        </button>
        <button onClick={() => directTo("allKeys")}>
          {t("content-problems.allKeys")}
        </button>
        <button onClick={() => directTo("derivablity")}>
          {t("content-problems.derivability")}
        </button>
        <button onClick={() => directTo("normalForm")}>
          {t("content-problems.normalForm")}
        </button>
        <button onClick={() => directTo("decomposition")}>
          {t("content-problems.decomposition")}
        </button>
        <button onClick={() => directTo("synthesis")}>
          {t("content-problems.synthesis")}
        </button>
      </div>
    </div>
  );
}
