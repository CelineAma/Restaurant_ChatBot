const getOption = require('./getOption');

console.log(getOption(1)); // should return the option with number 1
console.log(getOption(2)); // should return the option with number 2
console.log(getOption(3)); // should return the option with number 3
console.log(getOption(4)); // should return null, as there is no option with number 4
