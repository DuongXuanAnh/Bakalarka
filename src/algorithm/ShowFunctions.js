export class ShowFunctions {
  constructor() {
    this.showKeysAsText = this.showKeysAsText.bind(this);
    this.showArrayWithBrackets = this.showArrayWithBrackets.bind(this);
    this.attributesArrayToText = this.attributesArrayToText.bind(this);
    this.dependencySideArrayToText = this.dependencySideArrayToText.bind(this);
    this.showTextDependencyWithArrow =
      this.showTextDependencyWithArrow.bind(this);
    this.dependenciesArrayToText = this.dependenciesArrayToText.bind(this);
  }

  showKeysAsText(keys) {
    return keys.map((key) => `{ ${key.join(", ")} }`).join(", ");
  }

  showArrayWithBrackets(array) {
    return `{ ${array.join(", ")} }`;
  }

  attributesArrayToText(attr) {
    return attr.join(", ");
  }

  dependencySideArrayToText(attr) {
    return attr.join(",");
  }

  showTextDependencyWithArrow(fd) {
    return this.dependencySideArrayToText(fd.left) + " → " + this.dependencySideArrayToText(fd.right);
  }

  dependenciesArrayToText(fds) {
    return fds
      .map((dep, index) => {
        // Determine if the current element is an object or array of arrays
        const isObjectFormat =
          dep.hasOwnProperty("left") && dep.hasOwnProperty("right");

        // Extract LHS and RHS based on the format
        const lhs = isObjectFormat ? dep.left : dep[0];
        const rhs = isObjectFormat ? dep.right : dep[1];

        // Format the dependency as text
        const depText = `${this.dependencySideArrayToText(lhs)} → ${this.dependencySideArrayToText(rhs)}`;

        // Append a semicolon if this isn't the last element, else nothing
        const separator = index < fds.length - 1 ? " ; " : "";

        return depText + separator;
      })
      .join("");
  }
}
