export class HelperSetFunctions {
  constructor() {
    // Helper set functions
    this.subset = this.subset.bind(this);
    this.onlyUnique = this.onlyUnique.bind(this);
    this.intersection = this.intersection.bind(this);
    this.difference = this.difference.bind(this);
    this.intersectionOfArrays = this.intersectionOfArrays.bind(this);
    this.existsInArray = this.existsInArray.bind(this);
    this.powerSet = this.powerSet.bind(this);
  }

  // A is a subset of B -> true
  subset(setA, setB) {
    if (!Array.isArray(setA)) {
      setA = [setA];
    }
    if (!Array.isArray(setB)) {
      setB = [setB];
    }
    return setA.every((val) => setB.includes(val));
  }

  // Removes duplicates in a set
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  intersection(arr1, arr2) {
    return arr1.filter((value) => arr2.includes(value));
  }

  // Typicky odecitani mnozin arr1 - arr2
  difference(arr1, arr2) {
    let difference = arr1.filter((x) => !arr2.includes(x));
    return difference;
  }

  intersectionOfArrays(arr1, arr2) {
    // Pomocná funkce pro převod podpole na seřazený string
    const sortedArrayToString = (subArr) => JSON.stringify(subArr.sort());

    // Převedení každého podpole prvního pole na seřazený string a uchování ve množině
    const set1 = new Set(arr1.map(sortedArrayToString));

    // Filtrace druhého pole: zahrnutí pouze těch podpolí, které se nachází v množině set1
    return arr2.filter((subArr) => set1.has(sortedArrayToString(subArr)));
  }

  existsInArray(array, searchedObject) {
    return array.some((obj) => {
      return Object.keys(searchedObject).every(
        (key) =>
          Array.isArray(obj[key]) &&
          Array.isArray(searchedObject[key]) &&
          obj[key].length === searchedObject[key].length &&
          obj[key].every((val, index) => val === searchedObject[key][index])
      );
    });
  }

  // množina všech podmnožin
  powerSet(array) {
    const result = [];
    const f = function (prefix, array) {
      for (let i = 0; i < array.length; i++) {
        result.push(prefix.concat(array[i]));
        f(prefix.concat(array[i]), array.slice(i + 1));
      }
    };
    f([], array);

    // Uspořádání výsledků podle počtu atributů v každé podmnožině
    result.sort((a, b) => a.length - b.length);
    return result;
  }
}
