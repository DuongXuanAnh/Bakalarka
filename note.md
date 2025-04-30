### 1. AllKeys

#### Methods from `algoInstance`:

- **FPlus(contextDependencies, attributes)**
- **rewriteFDSingleRHS(simplifyFplus)**
- **mergeSingleRHSFDs(removeTrivialFDs)**
- **removeTrivialFDs(initialRewrittenFDs)**
- **getAllKeysWithExplain(simplifyFplus, attributes)**
- **showTextDependencyWithArrow(dependency)**

### 2. AttributeClosure

#### K vyhledání uzávěru množiny atributů se využívají následující metody z Algorithm.js

- **attributeClosureWithExplain(dependencies, attributes, attributesArea)**
- **attributeClosure(dependencies, attributesArea)**
- **subset(closure, attributeClosurePractice)**
- **dependenciesArrayToText(dependencies)**

### 3. Decomposition

#### K minimalizaci množiny závislostí se využívají následující metody z Algorithm.js

- **minimalCover(dependencies)**
- **FPlus(dependencies, attributes)**
- **rewriteFDSingleRHS(fPlusOrigin)**
- **getAllKeys(fPlus, attr)**
- **showKeysAsText(candidateKeys)**
- **attributeClosure(dependencies, subset)**
- **subset(attr1, attr2)**
- **nonTrivialClosure(faultyDependenciesTmp, left)**
- **showTextDependencyWithArrow(dependency)**
- **mergeSingleRHSFDs(FDs)**
- **difference(dependency.right, key)**
- **getReducedAttributes(dependencies, dependency.left, dependency.right)**

#### K určení typu normální formy se využívají následující metody z NormalFormALG.js

- **normalFormType(fPlus, attr)**
- **moreWayHowToSplitNode(data)**

### 4. Derivability

#### K určení odvozitelnosti závislosti se využívají následující metody z Algorithm.js

- **attributeClosure(dependencies, leftSideAttributes)**
- **subset(rightSideAttributes, attrClosure)**
- **FPlus(dependencies, attributesAreaFplus)**
- **powerSet(attributesAreaFplus)**
- **difference(dependency.right, key)**
- **getReducedAttributes(dependencies, dependency.left, dependency.right)**
- **dependenciesArrayToText(dependencies)**
- **showTextDependencyWithArrow(dependency)**
- **mergeDependenciesWithTheSameLHS(fPlusForStep4)**

### 5.FirstKey

#### K určení prvního klíče se využívají následující metody z Algorithm.js

- **findFirstKeyWithExplain(dependencies, attributes)**
- **mixRandomlyAttributes(attributes)**

### 6. Minimal Cover

#### K minimalizaci množiny závislostí se využívají následující metody z Algorithm.js

- **rewriteFDSingleRHS(dependencies)**
- **removeTrivialFDs(rewrittenFDs)**
- **minimizeLHS(nonTrivial_FDs)**
- **removeRedundantFDs(minimizeLHS_FDs)**
- **showTextDependencyWithArrow(fd)**
- **getReducedAttributes(nonTrivial_FDs, fd.left, fd.right)**
- **existsInArray(minimizeLHS_FDs, fd)**

### 7. Normal Form

#### K určení typu normální formy se využívají následující metody z Algorithm.js

- **FPlus(dependencies, attributesArea)**
- **getAllKeys(fPlus, attributesArea)**
- **dependenciesArrayToText(dependencies)**
- **showTextDependencyWithArrow(fd)**
- **showKeysAsText(result.keys)**

#### K určení typu normální formy se využívají následující metody z NormalFormALG.js

- **normalFormType(fPlus, attributesArea)**

### 8. Redundant Attribute

#### K určení redundantního atributu se využívají následující metody z Algorithm.js

- **attributeClosure(dependencies, leftSideAttributes)**
- **subset(redundantAttributes, checked)**
- **dependenciesArrayToText(dependencies)**
- **mixRandomlyAttributes(leftSideAttributes)**

### 9. Redundant Dependency

#### K určení redundantních závislostí se využívají následující metody z Algorithm.js

- **rewriteFDSingleRHS(dependencies)**
- **minimizeLHS(initialRewrittenFDs)**
- **minimalCover(reorderedDependencies)**

### 10. Synthesis

#### K syntéze se využívají následující metody z Algorithm.js

- **rewriteFDSingleRHS(dependencies)**
- **FPlus(dependencies, attributes)**
- **removeTrivialFDs(rewrittenFDs)**
- **minimizeLHS(nonTrivial_FDs)**
- **removeRedundantFDs(minimizeLHS_FDs)**
- **getAllKeys(singleRHS_fPlus, attributes)**
- **showTextDependencyWithArrow(fd)**
- **dependenciesArrayToText(removeRedundant_FDs)**
- **subset(table1.attributes, table2.attributes)**
- **isDependencyInClosure(singleRHS_fPlus, K1, K2)**

#### K určení typu normální formy se využívají následující metody z NormalFormALG.js

- **normalFormType(FDs, mergedAttributes)**

### Detailní popis funkcí Algorithm.js:

- **subset(set1, set2)**
  - Vstup: Dvě pole set1 a set2
  - Výstup: Boolean (true/false)
  - Popis: Kontroluje, zda je set1 podmnožinou set2
- **onlyUnique(value, index, array)**
  - Vstup: Hodnota, index a pole
  - Výstup: Boolean
  - Popis: Pomocná funkce pro filtrování unikátních hodnot v poli
- **intersection(arr1, arr2)**
  - Vstup: Dvě pole arr1 a arr2
  - Výstup: Pole obsahující průnik vstupních polí
  - Popis: Najde společné prvky dvou polí
- **difference(arr1, arr2)**
  - Vstup: Dvě pole arr1 a arr2
  - Výstup: Pole obsahující prvky z arr1, které nejsou v arr2
  - Popis: Vypočítá rozdíl množin (A - B)
- **isDependencyInClosure(dependencies, attributes, dependency)**
  - Vstup: Pole závislostí, pole atributů, závislost ke kontrole
  - Výstup: Boolean
  - Popis: Kontroluje, zda je daná závislost v uzávěru
- **isAttributeRedundant(dependencies, attributes, attribute)**
  - Vstup: Pole závislostí, pole atributů, atribut ke kontrole
  - Výstup: Boolean
  - Popis: Zjišťuje, zda je atribut nadbytečný v dané množině
- **rewriteFDSingleRHS(dependencies)**
  - Vstup: Pole funkčních závislostí
  - Výstup: Pole přepsaných závislostí
  - Popis: Přepíše závislosti tak, aby měly na pravé straně pouze jeden atribut
- **attributeClosure(dependencies, attributes)**
  - Vstup: Pole závislostí a pole atributů
  - Výstup: Pole atributů (uzávěr)
  - Popis: Vypočítá uzávěr množiny atributů
- **attributeClosureWithExplain(dependencies, schema, attributes)**
  - Vstup: Pole závislostí, schéma a pole atributů
  - Výstup: Pole atributů s vysvětlením kroků
  - Popis: Vypočítá uzávěr a poskytne vysvětlení procesu
- **attributeClosure(dependencies, attributes)**
  - Vstup: Pole závislostí a pole atributů
  - Výstup: Pole atributů (uzávěr)
  - Popis: Vypočítá uzávěr množiny atributů
- **attributeClosureWithExplain(dependencies, schema, attributes)**
  - Vstup: Pole závislostí, schéma a pole atributů
  - Výstup: Pole atributů s vysvětlením kroků
  - Popis: Vypočítá uzávěr a poskytne vysvětlení procesu
- **minimizeLHS(dependencies)**
  - Vstup: Pole závislostí
  - Výstup: Pole závislostí s minimalizovanou levou stranou
  - Popis: Minimalizuje levou stranu každé závislosti
- **removeRedundantFDs(dependencies)**
  - Vstup: Pole závislostí
  - Výstup: Pole bez redundantních závislostí
  - Popis: Odstraní nadbytečné závislosti
- **findFirstKey(dependencies, schema)**
  - Vstup: Pole závislostí a schéma
  - Výstup: Pole atributů (klíč)
  - Popis: Najde první klíč relačního schématu
- **getAllKeys(dependencies, schema)**
  - Vstup: Pole závislostí a schéma
  - Výstup: Pole všech klíčů
  - Popis: Najde všechny klíče relačního schématu
- **FPlus(dependencies, schema)**
  - Vstup: Pole závislostí a schéma
  - Výstup: Pole všech odvozených závislostí (F+)
  - Popis: Vypočítá uzávěr množiny funkčních závislostí
- **mergeSingleRHSFDs(dependencies)**
  - Vstup: Pole závislostí
  - Výstup: Pole sloučených závislostí
  - Popis: Sloučí závislosti se stejnou levou stranou
- **showTextDependencyWithArrow(dependency)**
  - Vstup: Objekt závislosti
  - Výstup: String
  - Popis: Formátuje závislost do textové podoby s šipkou
- **mixRandomlyAttributes(attributes)**

  - Vstup: Pole atributů
  - Výstup: Náhodně přeuspořádané pole atributů
  - Popis: Náhodně zamíchá pořadí atributů v poli

- **existsInArray(array, searchedObject)**
  - Vstup: Pole a hledaný objekt
  - Výstup: Boolean
  - Popis: Kontroluje, zda je objekt v poli

### Detailní popis funkcí NormalFormALG.js:

- **isSuperKey(dependencies, attributes, key)**
  - Vstup:
    - dependencies: Pole funkčních závislostí
    - attributes: Pole všech atributů schématu
    - key: Pole atributů ke kontrole
  - Výstup: Boolean (true/false)
  - Popis: Kontroluje, zda zadaná množina atributů je nadklíčem (její uzávěr obsahuje všechny atributy schématu)
- **isPartOfKey(dependencies, attributes, attribute)**
  - Vstup:
    - dependencies: Pole funkčních závislostí
    - attributes: Pole všech atributů schématu
    - attribute: Atribut ke kontrole
  - Výstup: Boolean (true/false)
  - Popis: Zjišťuje, zda je daný atribut součástí nějakého klíče (je primární)
- **isTrivialFD(dependency)**
  - Vstup:
    - dependency: Objekt reprezentující funkční závislost
  - Výstup: Boolean (true/false)
  - Popis: Kontroluje, zda je funkční závislost triviální (pravá strana je podmnožinou levé strany)
- **areAllAttributesPrime(dependencies, attributes, attributesToCheck)**
  - Vstup:
    - dependencies: Pole funkčních závislostí
    - attributes: Pole všech atributů schématu
    - attributesToCheck: Pole atributů ke kontrole
  - Výstup: Boolean (true/false)
  - Popis: Ověřuje, zda jsou všechny zadané atributy primární
- **check_2NF(dependencies, attributes)**
  - Vstup:
    - dependencies: Pole funkčních závislostí
    - attributes: Pole všech atributů schématu
  - Výstup: Objekt obsahující:
    - is2NF: Boolean
    - faultyDependencies: Pole problematických závislostí
  - Popis: Kontroluje splnění podmínek 2. normální formy
- **check_3NF(dependencies, attributes)**
  - Vstup:
    - dependencies: Pole funkčních závislostí
    - attributes: Pole všech atributů schématu
  - Výstup: Objekt obsahující:
    - is3NF: Boolean
    - faultyDependencies: Pole problematických závislostí
  - Popis: Kontroluje splnění podmínek 3. normální formy
- **check_BCNF(dependencies, attributes)**
  - Vstup:
    - dependencies: Pole funkčních závislostí
    - attributes: Pole všech atributů schématu
  - Výstup: Objekt obsahující:
    - isBCNF: Boolean
    - faultyDependencies: Pole problematických závislostí
  - Popis: Kontroluje splnění podmínek Boyce-Coddovy normální formy
- **normalFormType(dependencies, attributes)**
  - Vstup:
    - dependencies: Pole funkčních závislostí
    - attributes: Pole všech atributů schématu
  - Výstup: Objekt obsahující:
    - type: String ("1", "2", "3", nebo "BCNF")
    - faultyDependencies: Pole problematických závislostí
  - Popis: Určuje nejvyšší normální formu, kterou schéma splňuje
- **moreWayHowToSplitNode(data)**
  - Vstup:
  - data: Objekt obsahující informace o schématu (atributy, závislosti)
  - Výstup: Pole možných funkčních závislostí pro dekompozici
  - Popis: Generuje různé možnosti rozdělení schématu pro dosažení vyšší normální formy

1.  attribute, kde se skládá Attribute.jsx a attibute.scss a attributeMobile.scss.
    Tato stránka slouží k zadání atributů v programu. Atributy budou uloženy do kontextu, aby bylo možné je použít všude v aplikaci.
2.  dependency, kde se skládá ze složek mobile a pc. (protože vzhled je jiný pro mobil a pc)
    Tato stránka slouží k zadání závislostí v programu. Závislosti budou uloženy do kontextu, aby bylo možné je použít všude v aplikaci.
3.  problems, kde zobrazuji problémy, které chceme řešit.
    ve složce problems jsou složky, které reprezentují jednotlivé problémy.
    Každý problém má svou stránku, která je v složce problem.
    v kazde slozce problem je soubor .jsx a .scss

Problémy používají funkce ze tříd algorithm.js a normalFormInstance.js. Problémy jsou řešeny tak, jako bychom to dělali na papíře.
Soubory algorithm.js a normalFormInstance.js jsou ve složce algorithm. Jsou to veřejné třídy, které se používají v souborech, kde stačí použít import a vytvořit instanci.
