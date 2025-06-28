import { HelperSetFunctions } from "../../algorithm/HelperSetFunctions";

describe("HelperSetFunctions", () => {
  let helperSetFunctions;

  beforeEach(() => {
    helperSetFunctions = new HelperSetFunctions();
  });

  describe("subset", () => {
    test("should return true when setA is a subset of setB", () => {
      expect(helperSetFunctions.subset(["A", "B"], ["A", "B", "C"])).toBe(true);
    });
  });

  describe("onlyUnique", () => {
    test("should filter unique values from array", () => {
      const array = ["A", "B", "A", "C", "B"];
      const uniqueArray = array.filter(helperSetFunctions.onlyUnique);
      expect(uniqueArray).toEqual(["A", "B", "C"]);
    });
  });

  describe("intersection", () => {
    test("should return intersection of two arrays", () => {
      expect(
        helperSetFunctions.intersection(["A", "B", "C"], ["B", "C", "D"])
      ).toEqual(["B", "C"]);
    });
  });

  describe("difference", () => {
    test("should return elements in arr1 but not in arr2", () => {
      expect(
        helperSetFunctions.difference(["A", "B", "C"], ["B", "D"])
      ).toEqual(["A", "C"]);
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

  describe("existsInArray", () => {
    test("should find object with matching array properties", () => {
      const array = [
        { left: ["A"], right: ["B"] },
        { left: ["C", "D"], right: ["E"] },
      ];
      const searchObj = { left: ["A"], right: ["B"] };
      expect(helperSetFunctions.existsInArray(array, searchObj)).toBe(true);
    });
  });

  describe("powerSet", () => {
    test("should return power set of given array", () => {
      const result = helperSetFunctions.powerSet(["A", "B"]);
      expect(result).toEqual([["A"], ["B"], ["A", "B"]]);
    });
  });
});
