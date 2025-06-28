import { NormalFormALG } from "../../algorithm/NormalFormALG";

describe("NormalFormALG", () => {
  let normalFormALG;

  beforeEach(() => {
    normalFormALG = new NormalFormALG();
  });

  describe("isSuperKey", () => {
    test("should return true for super key", () => {
      const keys = [["A"]];
      const attribute = ["A", "B"];

      const result = normalFormALG.isSuperKey(keys, attribute);
      expect(result).toBe(true);
    });
  });

  describe("isPartOfKey", () => {
    test("should return true for prime attribute", () => {
      const keys = [["A", "B"]];
      const attribute = ["A"];

      const result = normalFormALG.isPartOfKey(keys, attribute);
      expect(result).toBe(true);
    });
  });

  describe("isTrivialFD", () => {
    test("should return true for trivial FD", () => {
      const FD = { left: ["A", "B"], right: ["A"] };

      const result = normalFormALG.isTrivialFD(FD);
      expect(result).toBe(true);
    });
  });

  describe("areAllAttributesPrime", () => {
    test("should return true when all attributes are prime", () => {
      const candidateKeys = [["A", "B"]];
      const rightSide = ["A"];

      const result = normalFormALG.areAllAttributesPrime(
        candidateKeys,
        rightSide
      );
      expect(result).toBe(true);
    });
  });

  describe("check_2NF", () => {
    test("should return true for relation in 2NF", () => {
      const FDs = [{ left: ["A", "B"], right: ["C"] }];
      const A = ["A", "B", "C"];

      const result = normalFormALG.check_2NF(FDs, A);
      expect(result.result).toBe(true);
    });
  });

  describe("check_3NF", () => {
    test("should return true for relation in 3NF", () => {
      const FDs = [{ left: ["A"], right: ["B"] }];
      const A = ["A", "B"];

      const result = normalFormALG.check_3NF(FDs, A);
      expect(result.result).toBe(true);
    });
  });

  describe("check_BCNF", () => {
    test("should return true for relation in BCNF", () => {
      const FDs = [{ left: ["A"], right: ["B"] }];
      const A = ["A", "B"];

      const result = normalFormALG.check_BCNF(FDs, A);
      expect(result.result).toBe(true);
    });
  });

  describe("normalFormType", () => {
    test("should identify BCNF correctly", () => {
      const FDs = [{ left: ["A"], right: ["B"] }];
      const A = ["A", "B"];

      const result = normalFormALG.normalFormType(FDs, A);
      expect(result.type).toBe("BCNF");
    });
  });
});
