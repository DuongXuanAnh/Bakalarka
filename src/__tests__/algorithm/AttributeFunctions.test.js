import { AttributeFunctions } from "../../algorithm/AttributeFunctions";

// Mock the i18n module since it's used in some functions
jest.mock("../../i18n", () => ({
  t: (key, params) => {
    // Return a simple string for testing purposes
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

describe("AttributeFunctions", () => {
  let attributeFunctions;

  beforeEach(() => {
    attributeFunctions = new AttributeFunctions();
    localStorageMock.setItem.mockClear();
  });

  describe("mixRandomlyAttributes", () => {
    test("should return array with same elements", () => {
      const attributes = ["A", "B", "C", "D"];
      const mixed = attributeFunctions.mixRandomlyAttributes(attributes);

      expect(mixed).toHaveLength(attributes.length);
      expect(mixed.sort()).toEqual(attributes.sort());
    });
  });

  describe("attributeClosure", () => {
    test("should compute closure correctly for simple case", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];
      const attributes = ["A"];

      const closure = attributeFunctions.attributeClosure(FDs, attributes);
      expect(closure.sort()).toEqual(["A", "B", "C"].sort());
    });
  });

  describe("attributeClosureL9", () => {
    test("should compute closure correctly for L9", () => {
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
      const attributes = ["s", "j", "d"];

      const closure = attributeFunctions.attributeClosure(FDs, attributes);
      expect(closure.sort()).toEqual(
        ["s", "j", "d", "p", "c", "q", "v"].sort()
      );
    });
  });

  describe("attributeClosureWithExplain", () => {
    test("should compute closure and store explanation", () => {
      const FDs = [{ left: ["A"], right: ["B"] }];
      const A = ["A", "B"];
      const attributes = ["A"];

      const closure = attributeFunctions.attributeClosureWithExplain(
        FDs,
        A,
        attributes
      );

      expect(closure.sort()).toEqual(["A", "B"].sort());
    });
  });

  describe("nonTrivialClosure", () => {
    test("should return only non-trivially derived attributes", () => {
      const FDs = [
        { left: ["A"], right: ["B"] },
        { left: ["B"], right: ["C"] },
      ];
      const attributes = ["A"];

      const nonTrivial = attributeFunctions.nonTrivialClosure(FDs, attributes);
      expect(nonTrivial.sort()).toEqual(["B", "C"].sort());
    });
  });

  describe("nonTrivialClosureL9", () => {
    test("should return only non-trivially derived attributes", () => {
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
      const attributes = ["s", "j", "d"];

      const nonTrivial = attributeFunctions.nonTrivialClosure(FDs, attributes);
      expect(nonTrivial.sort()).toEqual(["p", "c", "q", "v"].sort());
    });
  });
});
