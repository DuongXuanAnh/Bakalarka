import React, { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Attribute from "./components/content/attribute/Attribute";
import {
  AttributeProvider,
  useAttributeContext,
} from "./contexts/AttributeContext";
import EditDependency from "./components/content/dependency/mobile/EditDependency";
import Dependency from "./components/content/dependency/Dependency";
import { DependencyProvider } from "./contexts/DependencyContext";
import AddDependency from "./components/content/dependency/mobile/AddDependency";
import Problems from "./components/content/problems/Problems";
import Swal from "sweetalert2";
import {
  AttributeClosure,
  AllKeys,
  Decomposition,
  FirstKey,
  MinimalCover,
  RedundantDependency,
  RedundantAttribute,
  Synthesis,
  Derivability,
  NormalForm,
} from "./components/content/problems";
import { useTranslation } from "react-i18next";

function InnerApp() {
  const navigate = useNavigate();
  const { attributes } = useAttributeContext();
  const { t } = useTranslation();

  const firstRender = useRef(true); // To track the first render

  useEffect(() => {
    if (firstRender.current) {
      // If it's the first render, mark it as complete and return
      firstRender.current = false;
      return;
    }

    // Show alert if no attributes initially and it's not the first render
    if (attributes.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: t("App.addAttributeFirst"),
      });
      navigate("/");
    }
  }, [attributes, navigate]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Attribute />} />
        <Route path="/dependencies" element={<Dependency />} />
        <Route path="/addDependency" element={<AddDependency />} />
        <Route path="/editDependency/:id" element={<EditDependency />} />
        <Route path="/problems" element={<Problems />} />
        <Route
          path="/problems/attributeClosure"
          element={<AttributeClosure />}
        />
        <Route path="/problems/allKeys" element={<AllKeys />} />
        <Route path="/problems/decomposition" element={<Decomposition />} />
        <Route path="/problems/firstKey" element={<FirstKey />} />
        <Route path="/problems/minimalCover" element={<MinimalCover />} />
        <Route path="/problems/derivablity" element={<Derivability />} />
        <Route
          path="/problems/redundantDependency"
          element={<RedundantDependency />}
        />
        <Route
          path="/problems/redundantAttribute"
          element={<RedundantAttribute />}
        />
        <Route path="/problems/synthesis" element={<Synthesis />} />
        <Route path="/problems/normalForm" element={<NormalForm />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AttributeProvider>
      <DependencyProvider>
        <Router>
          <InnerApp />
        </Router>
      </DependencyProvider>
    </AttributeProvider>
  );
}

export default App;
