import React, { useState, useEffect } from "react";
import DependencyMobile from "./mobile/DependencyMobile";
import DependencyPC from "./pc/DependencyPC";
import "./dependency.scss";

function Dependency() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>{windowWidth <= 991 ? <DependencyMobile /> : <DependencyPC />}</div>
  );
}

export default Dependency;
