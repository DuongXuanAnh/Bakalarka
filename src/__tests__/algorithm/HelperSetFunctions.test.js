import { HelperSetFunctions } from "../../algorithm/HelperSetFunctions";

describe("HelperSetFunctions", () => {
  let helperSetFunctions;

  beforeEach(() => {
    helperSetFunctions = new HelperSetFunctions();
  });

  describe('subset (["A", "B"], ["A", "B", "C"])', () => {
    test("should return true when setA is a subset of setB", () => {
      expect(helperSetFunctions.subset(["A", "B"], ["A", "B", "C"])).toBe(
        true
      );
    });
  });

  describe('subset (["C", "B", "A"], ["A", "B", "C"])', () => {
    test("should return true when setA is equal to setB", () => {
      expect(helperSetFunctions.subset(["C", "B", "A"], ["A", "B", "C"])).toBe(
        true
      );
    });
  });

  describe('subset ["A", "E"], ["A", "B", "C"]', () => {
    test("should return false when setA is not a subset of setB", () => {
      expect(helperSetFunctions.subset(["A", "E"], ["A", "B", "C"])).toBe(
        false
      );
    });
  });

  describe('subsetNEQ (["A", "B"], ["A", "B", "C"])', () => {
    test("should return true when setA is a direct subset of setB", () => {
      expect(helperSetFunctions.subset(["A", "B"], ["A", "B", "C"])).toBe(
        true
      );
    });
  });

  describe('subsetNEQ (["C", "B", "A"], ["A", "B", "C"])', () => {
    test("should return false when setA is equal to setB", () => {
      expect(helperSetFunctions.subsetNEQ(["C", "B", "A"], ["A", "B", "C"])).toBe(
        false
      );
    });
  });

  describe('subsetNEQ ["A", "E"], ["A", "B", "C"]', () => {
    test("should return false when setA is not a subset of setB", () => {
      expect(helperSetFunctions.subsetNEQ(["A", "E"], ["A", "B", "C"])).toBe(
        false
      );
    });
  });

  describe('onlyUnique ["A", "B", "A", "C", "B"]', () => {
    test("should filter unique values from array", () => {
      const array = ["A", "B", "A", "C", "B"];
      const uniqueArray = array.filter(helperSetFunctions.onlyUnique);
      expect(uniqueArray).toEqual(["A", "B", "C"]);
    });
  });

  describe('intersection ["A", "B", "C"], ["B", "C", "D"]', () => {
    test("should return intersection of two arrays", () => {
      expect(
        helperSetFunctions.intersection(["A", "B", "C"], ["B", "C", "D"])
      ).toEqual(["B", "C"]);
    });
  });

  describe('difference ["A", "B", "C"], ["B", "D"]', () => {
    test("should return elements in arr1 but not in arr2", () => {
      expect(
        helperSetFunctions.difference(["A", "B", "C"], ["B", "D"])
      ).toEqual(["A", "C"]);
    });
  });


  describe('isRedundant ["A", "B"], 1, ["A", "B", "C"], 2', () => {
    test("should return true, as the other is a strict superset of current", () => {
      expect(
        helperSetFunctions.isRedundant(["A", "B"], 1, ["A", "B", "C"], 2)
      ).toBe(true);
    });
  });

  describe('isRedundant ["A", "B"], 2, ["A", "B", "C"], 1', () => {
    test("should return true, as the other is a strict superset of current", () => {
      expect(
        helperSetFunctions.isRedundant(["A", "B"], 2, ["A", "B", "C"], 1)
      ).toBe(true);
    });
  });

  describe('isRedundant ["A", "B"], 2, ["A", "B"], 1', () => {
    test("should return true, as the other is equal and precedes current", () => {
      expect(
        helperSetFunctions.isRedundant(["A", "B"], 2, ["A", "B"], 1)
      ).toBe(true);
    });
  });

  describe('isRedundant ["A", "B"], 1, ["A", "B"], 2', () => {
    test("should return false, as the other is equal and follows current", () => {
      expect(
        helperSetFunctions.isRedundant(["A", "B"], 1, ["A", "B"], 2)
      ).toBe(false);
    });
  });

  describe('isRedundant ["A", "B"], 1, ["A", "B"], 1', () => {
    test("should return false, as both are the same", () => {
      expect(
        helperSetFunctions.isRedundant(["A", "B"], 1, ["A", "B"], 1)
      ).toBe(false);
    });
  });

  describe('isRedundant ["A", "C"], 1, ["A", "B"], 2', () => {
    test("should return false, as the other is not comparable with current", () => {
      expect(
        helperSetFunctions.isRedundant(["A", "B"], 1, ["A", "B", "C"], 2)
      ).toBe(true);
    });
  });

  describe("intersectionOfArrays", () => {
    test("should return common sub-arrays between two arrays of arrays", () => {
      const arr1 = [["A"], ["B"], ["C"], ["D"]];
      const arr2 = [["C"], ["D"], ["E"]];
      const result = helperSetFunctions.intersectionOfArrays(arr1, arr2);
      expect(result).toEqual([["C"], ["D"]]);
    });
  });

  describe('existsInArray {"A"->"B"} in [{"A"->"B"}, {"C,D"->"E"}]', () => {
    test("should find object with matching array properties", () => {
      const array = [
        { left: ["A"], right: ["B"] },
        { left: ["C", "D"], right: ["E"] },
      ];
      const searchObj = { left: ["A"], right: ["B"] };
      expect(helperSetFunctions.existsInArray(array, searchObj)).toBe(true);
    });
  });

  describe('existsInArray {"D,C"->"E"} in [{"A"->"B"}, {"C,D"->"E"}]', () => {
    test("should find object with matching array properties", () => {
      const array = [
        { left: ["A"], right: ["B"] },
        { left: ["C", "D"], right: ["E"] },
      ];
      const searchObj = { left: ["C", "D"], right: ["E"] };
      expect(helperSetFunctions.existsInArray(array, searchObj)).toBe(true);
    });
  });

  describe('existsInArray {"A"->"E"} in [{"A"->"B"}, {"C,D"->"E"}]', () => {
    test("should not find object with matching array properties", () => {
      const array = [
        { left: ["A"], right: ["B"] },
        { left: ["C", "D"], right: ["E"] },
      ];
      const searchObj = { left: ["A"], right: ["E"] };
      expect(helperSetFunctions.existsInArray(array, searchObj)).toBe(false);
    });
  });

  describe('powerSet ["A", "B"]', () => {
    test("should return power set of given array", () => {
      const result = helperSetFunctions.powerSet(["A", "B"]);
      expect(result).toEqual([["A"], ["B"], ["A", "B"]]);
    });
  });

  describe('powerSet ["A", "B", "C"]', () => {
    test("should return power set of given array", () => {
      const result = helperSetFunctions.powerSet(["A", "B", "C"]);
      expect(result).toEqual([
        ["A"],
        ["B"],
        ["C"],
        ["A", "B"],
        ["A", "C"],
        ["B", "C"],
        ["A", "B", "C"],
      ]);
    });
  });
});
