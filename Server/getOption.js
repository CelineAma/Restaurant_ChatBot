const fs = require("fs");

function getOption(optionNumber) {
    const options = JSON.parse(fs.readFileSync('./Data/option.json'));
    const option = options.find(option => option.number === optionNumber);
    return option;
    
  }
 

  module.exports = getOption;