import { AttributeFunctions } from "../../algorithm/AttributeFunctions";
import { FunctionalDependencyFunctions } from "../../algorithm/FunctionalDependencyFunctions";
import { HelperSetFunctions } from "../../algorithm/HelperSetFunctions";
import { FindingKeysFunctions } from "../../algorithm/FindingKeysFunctions";
import { NormalFormALG } from "../../algorithm/NormalFormALG";
import { MinimalCoverFunction } from "../../algorithm/MinimalCoverFunction";

// Mock the i18n module
jest.mock("../../i18n", () => ({
  t: (key, params) => {
    if (params) {
      return `${key}_${JSON.stringify(params)}`;
    }
    return key;
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe("Algorithm Integration Tests", () => {
  let attributeFunctions;
  let fdFunctions;
  let helperSetFunctions;
  let findingKeysFunctions;
  let normalFormALG;
  let minimalCoverFunction;

  beforeEach(() => {
    attributeFunctions = new AttributeFunctions();
    fdFunctions = new FunctionalDependencyFunctions();
    helperSetFunctions = new HelperSetFunctions();
    findingKeysFunctions = new FindingKeysFunctions();
    normalFormALG = new NormalFormALG();
    minimalCoverFunction = new MinimalCoverFunction();
    localStorageMock.setItem.mockClear();
  });

  describe("Complete Database Normalization Workflow", () => {
    test("should process simple relation through basic workflow", () => {
      const FDs = [{ left: ["A"], right: ["B"] }];
      const attributes = ["A", "B"];

      // Step 1: Find candidate keys
      const keys = findingKeysFunctions.getAllKeys(FDs, attributes);
      expect(keys).toHaveLength(1);
      expect(keys[0]).toEqual(["A"]);

      // Step 2: Check normal forms
      const bcnf = normalFormALG.check_BCNF(FDs, attributes);
      expect(bcnf.result).toBe(true);

      // Step 3: Compute minimal cover
      const minimalCover = minimalCoverFunction.minimalCover(FDs);
      expect(minimalCover.length).toBeGreaterThan(0);

      // Step 4: Test attribute closure
      const closure = attributeFunctions.attributeClosure(FDs, ["A"]);
      expect(closure.sort()).toEqual(["A", "B"].sort());
    });
  });
});
