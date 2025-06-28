import { FunctionalDependencyFunctions } from "../../algorithm/FunctionalDependencyFunctions";

describe("FunctionalDependencyFunctions", () => {
  let fdFunctions;

  beforeEach(() => {
    fdFunctions = new FunctionalDependencyFunctions();
  });

  describe("isAttributeRedundant", () => {
    test("should identify redundant attribute correctly", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];
      const X = ["A", "B"];
      const Y = ["C"];
      const a = "A";

      const result = fdFunctions.isAttributeRedundant(FDs, X, Y, a);
      expect(result).toBe(true);
    });

    test("should identify non-redundant attribute correctly", () => {
      const FDs = [
        { left: ["A"], right: ["D"] },
        { left: ["B"], right: ["C"] },
      ];
      const X = ["A", "B"];
      const Y = ["C"];
      const a = "B";

      const result = fdFunctions.isAttributeRedundant(FDs, X, Y, a);
      expect(result).toBe(false);
    });
  });

  describe("isDependencyInClosure", () => {
    test("should return true when dependency is in closure", () => {
      const F = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];
      const X = ["A"];
      const Y = ["C"];

      const result = fdFunctions.isDependencyInClosure(F, X, Y);
      expect(result).toBe(true); // A -> C is derivable
    });

    test("should return false when dependency is not in closure", () => {
      const F = [{ left: ["A"], right: ["B"] }];
      const X = ["A"];
      const Y = ["C"];

      const result = fdFunctions.isDependencyInClosure(F, X, Y);
      expect(result).toBe(false);
    });

    test("should handle empty Y (trivial dependency)", () => {
      const F = [{ left: ["A"], right: ["B"] }];
      const X = ["A"];
      const Y = [];

      const result = fdFunctions.isDependencyInClosure(F, X, Y);
      expect(result).toBe(true);
    });
  });

  describe("getReducedAttributes", () => {
    test("should remove redundant attributes from left side", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];
      const X = ["A", "B"];
      const Y = ["C"];

      const result = fdFunctions.getReducedAttributes(FDs, X, Y);
      expect(result).toEqual(["B"]);
    });

    test("should keep all attributes when none are redundant", () => {
      const FDs = [
        { left: ["A"], right: ["C"] },
        { left: ["B"], right: ["D"] },
      ];
      const X = ["A", "B"];
      const Y = ["C", "D"];

      const result = fdFunctions.getReducedAttributes(FDs, X, Y);
      expect(result.sort()).toEqual(["A", "B"].sort());
    });

    test("should handle single attribute case", () => {
      const FDs = [{ left: ["A"], right: ["B"] }];
      const X = ["A"];
      const Y = ["B"];

      const result = fdFunctions.getReducedAttributes(FDs, X, Y);
      expect(result).toEqual(["A"]);
    });
  });

  describe("rewriteFDSingleRHS", () => {
    test("should split FDs with multiple RHS attributes", () => {
      const FDs = [
        { left: ["A"], right: ["B", "C"] },
        { left: ["D"], right: ["E"] },
      ];

      const result = fdFunctions.rewriteFDSingleRHS(FDs);
      expect(result).toEqual([
        { left: ["A"], right: ["B"] },
        { left: ["A"], right: ["C"] },
        { left: ["D"], right: ["E"] },
      ]);
    });

    test("should handle FDs that already have single RHS", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["C"], right: ["D"] },
      ];

      const result = fdFunctions.rewriteFDSingleRHS(FDs);
      expect(result).toEqual([
        { left: ["A"], right: ["B"] },
        { left: ["C"], right: ["D"] },
      ]);
    });

    test("should handle empty FDs array", () => {
      const FDs = [];
      const result = fdFunctions.rewriteFDSingleRHS(FDs);
      expect(result).toEqual([]);
    });
  });

  describe("removeTrivialFDs", () => {
    test("should remove trivial functional dependencies", () => {
      const FDs = [
        { left: ["A"], right: ["A"] },
        { left: ["A"], right: ["B"] },
      ];

      const result = fdFunctions.removeTrivialFDs(FDs);
      expect(result).toEqual([{ left: ["A"], right: ["B"] }]);
    });

    test("should handle case with no trivial FDs", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];

      const result = fdFunctions.removeTrivialFDs(FDs);
      expect(result).toEqual(FDs);
    });

    test("should handle empty array", () => {
      const FDs = [];
      const result = fdFunctions.removeTrivialFDs(FDs);
      expect(result).toEqual([]);
    });
  });

  describe("minimizeLHS", () => {
    test("should minimize left-hand side of dependencies", () => {
      const FDs = [
        { left: ["A", "B"], right: ["C"] },
        { left: ["A"], right: ["B"] },
      ];

      const result = fdFunctions.minimizeLHS(FDs);
      expect(result.length).toBeGreaterThan(0);
    });

    test("should handle dependencies that cannot be minimized", () => {
      const FDs = [{ left: ["A", "B"], right: ["C"] }];

      const result = fdFunctions.minimizeLHS(FDs);
      expect(result).toEqual([{ left: ["A", "B"], right: ["C"] }]);
    });

    test("should skip trivial dependencies", () => {
      const FDs = [{ left: ["A", "B"], right: ["A"] }];

      const result = fdFunctions.minimizeLHS(FDs);
      expect(result).toEqual([{ left: ["A", "B"], right: ["A"] }]);
    });
  });

  describe("removeRedundantFDs", () => {
    test("should remove redundant functional dependencies", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
        { left: ["A"], right: ["C"] },
      ];

      const result = fdFunctions.removeRedundantFDs(FDs);
      expect(result).toHaveLength(2);
    });

    test("should remove duplicate FDs", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["A"], right: ["B"] },
        { left: ["C"], right: ["D"] },
      ];

      const result = fdFunctions.removeRedundantFDs(FDs);
      expect(result).toHaveLength(2);
      expect(
        result.filter(
          (fd) =>
            JSON.stringify(fd.left) === JSON.stringify(["A"]) &&
            JSON.stringify(fd.right) === JSON.stringify(["B"])
        )
      ).toHaveLength(1);
    });

    test("should handle case with no redundant FDs", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["C"], right: ["D"] },
      ];

      const result = fdFunctions.removeRedundantFDs(FDs);
      expect(result).toEqual(FDs);
    });
  });

  describe("mergeSingleRHSFDs", () => {
    test("should merge FDs with same LHS", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["A"], right: ["C"] },
        { left: ["D"], right: ["E"] },
      ];

      const result = fdFunctions.mergeSingleRHSFDs(FDs);
      expect(result).toEqual([
        { left: ["A"], right: ["B", "C"] },
        { left: ["D"], right: ["E"] },
      ]);
    });

    test("should handle FDs with different LHS", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["C"], right: ["D"] },
      ];

      const result = fdFunctions.mergeSingleRHSFDs(FDs);
      expect(result).toEqual([
        { left: ["A"], right: ["B"] },
        { left: ["C"], right: ["D"] },
      ]);
    });

    test("should handle empty input", () => {
      const FDs = [];
      const result = fdFunctions.mergeSingleRHSFDs(FDs);
      expect(result).toEqual([]);
    });
  });

  describe("mergeDependenciesWithTheSameLHS", () => {
    test("should merge dependencies with same left-hand side", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["A"], right: ["C"] },
      ];

      const result = fdFunctions.mergeDependenciesWithTheSameLHS(FDs);
      expect(result).toHaveLength(1);
      expect(result[0].right.sort()).toEqual(["B", "C"].sort());
    });

    test("should handle complex left-hand sides", () => {
      const FDs = [
        { left: ["A", "B"], right: ["C"] },
        { left: ["A", "B"], right: ["D"] },
        { left: ["E"], right: ["F"] },
      ];

      const result = fdFunctions.mergeDependenciesWithTheSameLHS(FDs);
      expect(result).toHaveLength(2);

      const abFD = result.find(
        (fd) => JSON.stringify(fd.left) === JSON.stringify(["A", "B"])
      );
      expect(abFD.right.sort()).toEqual(["C", "D"].sort());
    });

    test("should handle empty input", () => {
      const FDs = [];
      const result = fdFunctions.mergeDependenciesWithTheSameLHS(FDs);
      expect(result).toEqual([]);
    });

    test("should remove duplicates in right-hand side", () => {
      const FDs = [
        { left: ["A"], right: ["B", "C"] },
        { left: ["A"], right: ["B", "D"] },
      ];

      const result = fdFunctions.mergeDependenciesWithTheSameLHS(FDs);
      expect(result).toHaveLength(1);
      expect(result[0].right.sort()).toEqual(["B", "C", "D"].sort());
    });
  });
});
