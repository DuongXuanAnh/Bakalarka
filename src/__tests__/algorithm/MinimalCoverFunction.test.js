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
});
