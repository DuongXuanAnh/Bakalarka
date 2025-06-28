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
});
