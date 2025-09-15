export class HelperSetFunctions {
  constructor() {
    // Helper set functions
    this.subset = this.subset.bind(this);
    this.subsetNEQ = this.subsetNEQ.bind(this);
    this.isEqual = this.isEqual.bind(this);
    this.onlyUnique = this.onlyUnique.bind(this);
    this.intersection = this.intersection.bind(this);
    this.difference = this.difference.bind(this);
    this.isRedundant = this.isRedundant.bind(this);
    this.intersectionOfArrays = this.intersectionOfArrays.bind(this); // MKOP 2025/09/15 NOT USED
    this.existsInArray = this.existsInArray.bind(this);
    this.powerSet = this.powerSet.bind(this);
  }

  // A is a subset of or equal to B -> true
  subset(setA, setB) {
    if (!Array.isArray(setA)) {
      setA = [setA];
    }
    if (!Array.isArray(setB)) {
      setB = [setB];
    }
    return setA.every((value) => setB.includes(value));
  }

  // A is a direct subset of (not equal to) B -> true
  subsetNEQ(setA, setB) {
    return this.subset(setA, setB) && !this.subset(setB, setA);
  }

  // A is equal to B -> true
  isEqual(setA, setB) {
    return this.subset(setA, setB) && this.subset(setB, setA);
  }

  // Removes duplicates in a set
  // The value on given index is the first occurence of the value in the set -> true 
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  // A intersect B
  intersection(setA, setB) {
    return setA.filter((value) => setB.includes(value));
  }

  // A subtract of B (odecitani mnozin setA - setB)
  difference(setA, setB) {
    return setA.filter((value) => !setB.includes(value));
  }

  // Is current set (relation with given attributes) redundant
  // due to other set (relation) -> true
  isRedundant(currentAttrSet, currentIndex, otherAttrSet, otherIndex) {
    return (
      (currentIndex !== otherIndex) &&
      this.subset(currentAttrSet, otherAttrSet) &&
      (!this.subset(otherAttrSet, currentAttrSet) || (currentIndex > otherIndex))
      );
  }

  // Common sub-arrays between two arrays of arrays
  // 2025/09/15 NOT USED anywhere
  intersectionOfArrays(arr1, arr2) {
    // Pomocná funkce pro převod podpole na seřazený string
    const sortedArrayToString = (subArr) => JSON.stringify(subArr.sort());
    // Převedení každého podpole prvního pole na seřazený string a uchování ve množině
    const set1 = new Set(arr1.map(sortedArrayToString));
    // Filtrace druhého pole: zahrnutí pouze těch podpolí, které se nachází v množině set1
    return arr2.filter((subArr) => set1.has(sortedArrayToString(subArr)));
  }

  // Is searched object with array properties like {left: [...], right: [...]} ie. a FD
  // in array of objects [{...}, {...}, ...] ie. set of FDS -> true
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
