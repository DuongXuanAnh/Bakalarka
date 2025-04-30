import { FunctionalDependencyFunctions } from "./FunctionalDependencyFunctions";

const functionalDependencyFunctionsInstance =
  new FunctionalDependencyFunctions();

export class MinimalCoverFunction {
  constructor() {
    this.minimalCover = this.minimalCover.bind(this);
  }

  minimalCover(FDs) {
    const initialRewrittenFDs =
      functionalDependencyFunctionsInstance.rewriteFDSingleRHS(FDs);
    const nonTrivial_FDs =
      functionalDependencyFunctionsInstance.removeTrivialFDs(
        initialRewrittenFDs
      );
    const minimizeLHS_FDs =
      functionalDependencyFunctionsInstance.minimizeLHS(nonTrivial_FDs);
    return functionalDependencyFunctionsInstance.removeRedundantFDs(
      minimizeLHS_FDs
    );
  }
}
