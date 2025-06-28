// Import all test files to ensure they run as part of the test suite
import "./HelperSetFunctions.test.js";
import "./AttributeFunctions.test.js";
import "./FunctionalDependencyFunctions.test.js";
import "./NormalFormALG.test.js";
import "./FindingKeysFunctions.test.js";
import "./MinimalCoverFunction.test.js";
import "./FPlusFunctions.test.js";
import "./ShowFunctions.test.js";
import "./AlgorithmIntegration.test.js";

describe("Complete Algorithm Test Suite", () => {
  test("all algorithm test files should be loaded", () => {
    // This test ensures all test files are included in the test suite
    expect(true).toBe(true);
  });
});
