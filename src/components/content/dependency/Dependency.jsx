import React, { useState, useEffect } from "react";
import DependencyMobile from "./mobile/DependencyMobile";
import DependencyPC from "./pc/DependencyPC";
import './dependency.scss';

function Dependency() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Přidání event listeneru pro změnu velikosti okna
    window.addEventListener('resize', handleResize);

    // Odebrání event listeneru, když komponent není v DOM
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // prázdné pole závislostí znamená, že useEffect se spustí jen jednou po prvním renderu

  return (
    <div>
      {windowWidth <= 991 ? <DependencyMobile /> : <DependencyPC />}
    </div>
  );
}

export default Dependency;
