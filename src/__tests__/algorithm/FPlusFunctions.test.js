import { FPlusFunctions } from "../../algorithm/FPlusFunctions";

describe("FPlusFunctions", () => {
  let fPlusFunctions;

  beforeEach(() => {
    fPlusFunctions = new FPlusFunctions();
  });

  describe("FPlus", () => {
    test("should compute F+ for simple functional dependencies", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];
      const attributes = ["A", "B", "C"];

      const fPlus = fPlusFunctions.FPlus(FDs, attributes);

      expect(fPlus).toEqual([
        { left: ["A"], right: ["B", "C"] },
        { left: ["B"], right: ["C"] },
      ]);
    });
  });

  describe("FPlusL9", () => {
    test("should compute F+ for L9", () => {
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
      const attributes = ["j", "s", "v", "d"];

      const fPlus = fPlusFunctions.FPlus(FDs, attributes);

      expect(fPlus).toEqual([
        { left: ["j"], right: ["s"] },
        { left: ["j", "d"], right: ["s", "v"] },
      ]);
    });
  });
});
