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

  describe("isNotSuperKey", () => {
    test("should return false for super key", () => {
      const keys = [["A"]];
      const attribute = ["C", "D"];

      const result = normalFormALG.isSuperKey(keys, attribute);
      expect(result).toBe(false);
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

  describe("isNotPartOfKey", () => {
    test("should return true for prime attribute", () => {
      const keys = [["A", "B"]];
      const attribute = ["C"];

      const result = normalFormALG.isPartOfKey(keys, attribute);
      expect(result).toBe(false);
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

  describe("check_2NF_L9", () => {
    test("should return true for relation in 2NF", () => {
      const FDs = [
        {
          right: ["c", "s", "j", "d", "p", "q", "v"],
          left: ["c"],
        },
        {
          right: ["p"],
          left: ["s", "d"],
        },
        {
          right: ["d"],
          left: ["p"],
        },
        {
          right: ["c"],
          left: ["j", "p"],
        },
        {
          right: ["s"],
          left: ["j"],
        },
      ];
      const A = ["c", "s", "j", "d", "p", "q", "v"];

      const result = normalFormALG.check_2NF(FDs, A);
      expect(result.result).toBe(false);
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

  describe("check_3NF_L9", () => {
    test("should return true for relation in 3NF", () => {
      const FDs = [
        {
          right: ["c"],
          left: ["j", "d", "p", "q", "v"],
        },
        {
          right: ["p"],
          left: ["d"],
        },
        {
          right: ["j", "d"],
          left: ["p", "c", "q", "v"],
        },
        {
          right: ["j", "p"],
          left: ["d", "c", "q", "v"],
        },
      ];
      const A = ["c", "j", "d", "p", "q", "v"];

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

  describe("check_BCNF_L9", () => {
    test("should return true for relation in BCNF", () => {
      const FDs = [
        { left: ["c"], right: ["j", "d", "q", "v"] },
        { left: ["j", "d"], right: ["c", "p", "v"] },
      ];
      const A = ["c", "j", "d", "q", "v"];

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
