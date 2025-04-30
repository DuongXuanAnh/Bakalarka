export class ShowFunctions {
  constructor() {
    this.showKeysAsText = this.showKeysAsText.bind(this);
    this.showArrayWithBrackets = this.showArrayWithBrackets.bind(this);
    this.showTextDependencyWithArrow =
      this.showTextDependencyWithArrow.bind(this);
    this.dependenciesArrayToText = this.dependenciesArrayToText.bind(this);
  }

  showKeysAsText(keys) {
    return keys.map((key) => `{ ${key} }`).join(", ");
  }

  showArrayWithBrackets(array) {
    return `{ ${array.join(",")} }`;
  }

  showTextDependencyWithArrow(fd) {
    return fd.left.join(",") + " → " + fd.right.join(",");
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
        const depText = `${lhs.join(",")} → ${rhs.join(",")}`;

        // Append a semicolon if this isn't the last element, else nothing
        const separator = index < fds.length - 1 ? " ; " : "";

        return depText + separator;
      })
      .join("");
  }
}
