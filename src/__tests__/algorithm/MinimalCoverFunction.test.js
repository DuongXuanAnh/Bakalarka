import { MinimalCoverFunction } from "../../algorithm/MinimalCoverFunction";

describe("MinimalCoverFunction", () => {
  let minimalCoverFunction;

  beforeEach(() => {
    minimalCoverFunction = new MinimalCoverFunction();
  });

  describe("minimalCover", () => {
    test("should compute minimal cover for simple case", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];

      const minimalCover = minimalCoverFunction.minimalCover(FDs);

      expect(minimalCover).toEqual([
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ]);
    });
  });

  describe("minimalCover_Test_A_2023", () => {
    test("should compute minimal cover for Test A 2023", () => {
      const FDs = [
        { left: ["a"], right: ["b"] },
        { left: ["b"], right: ["a"] },
        { left: ["c"], right: ["d"] },
        { left: ["c", "d", "e"], right: ["a", "g"] },
        { left: ["d"], right: ["e", "f"] },
      ];

      const minimalCover = minimalCoverFunction.minimalCover(FDs);

      expect(minimalCover).toEqual([
        { left: ["a"], right: ["b"] },
        { left: ["b"], right: ["a"] },
        { left: ["c"], right: ["d"] },
        { left: ["c"], right: ["a"] },
        { left: ["c"], right: ["g"] },
        { left: ["d"], right: ["e"] },
        { left: ["d"], right: ["f"] },
      ]);
    });
  });

  describe("minimalCoverL9", () => {
    test("should compute minimal cover for L9", () => {
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

      const minimalCover = minimalCoverFunction.minimalCover(FDs);

      expect(minimalCover).toEqual([
        { left: ["c"], right: ["j"] },
        { left: ["c"], right: ["p"] },
        { left: ["c"], right: ["q"] },
        { left: ["c"], right: ["v"] },
        { left: ["s", "d"], right: ["p"] },
        { left: ["p"], right: ["d"] },
        { left: ["j", "p"], right: ["c"] },
        { left: ["j"], right: ["s"] },
      ]);
    });
  });
});
