import { ShowFunctions } from "../../algorithm/ShowFunctions";

describe("ShowFunctions", () => {
  let showFunctions;

  beforeEach(() => {
    showFunctions = new ShowFunctions();
  });

  describe("showKeysAsText", () => {
    test("should format keys as text", () => {
      const keys = [["A"], ["B", "C"]];
      const result = showFunctions.showKeysAsText(keys);
      expect(result).toBe("{ A }, { B,C }");
    });
  });

  describe("showArrayWithBrackets", () => {
    test("should format array with curly brackets", () => {
      const array = ["A", "B", "C"];
      const result = showFunctions.showArrayWithBrackets(array);
      expect(result).toBe("{ A,B,C }");
    });
  });

  describe("showTextDependencyWithArrow", () => {
    test("should format functional dependency with arrow", () => {
      const dependency = {
        left: ["A", "B"],
        right: ["C"],
      };
      const result = showFunctions.showTextDependencyWithArrow(dependency);
      expect(result).toBe("A,B → C");
    });
  });

  describe("dependenciesArrayToText", () => {
    test("should format array of dependencies", () => {
      const dependencies = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];
      const result = showFunctions.dependenciesArrayToText(dependencies);
      expect(result).toBe("A → B ; B → C");
    });
  });
});
