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

  describe("findFirstKeyL9", () => {
    test("should find a minimal key for L9", () => {
      const F = [
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
      const schema = ["c", "s", "j", "d", "p", "q", "v"];

      const key = findingKeysFunctions.findFirstKey(F, schema);
      expect(key).toEqual(["j", "p"]);
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

  describe("getAllKeysL9", () => {
    test("should find all candidate keys for L9", () => {
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

      const keys = findingKeysFunctions.getAllKeys(FDs, A);

      expect(keys).toContainEqual(["j", "p"], ["c"], ["j", "d"]);
    });
  });
});
