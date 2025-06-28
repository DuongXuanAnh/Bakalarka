import { FindingKeysFunctions } from "../../algorithm/FindingKeysFunctions";

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

describe("FindingKeysFunctions", () => {
  let findingKeysFunctions;

  beforeEach(() => {
    findingKeysFunctions = new FindingKeysFunctions();
    localStorageMock.setItem.mockClear();
  });

  describe("findFirstKey", () => {
    test("should find a minimal key for simple case", () => {
      const F = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];
      const schema = ["A", "B", "C"];

      const key = findingKeysFunctions.findFirstKey(F, schema);
      expect(key).toEqual(["A"]);
    });
  });

  describe("getAllKeys", () => {
    test("should find all candidate keys for simple case", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];
      const A = ["A", "B", "C"];

      const keys = findingKeysFunctions.getAllKeys(FDs, A);

      expect(keys).toContainEqual(["A"]);
    });
  });
});
