const fs = require("fs");

function getOption(optionNumber) {
    const options = JSON.parse(fs.readFileSync('option.json'));
    const option = options.find(option => option.number === optionNumber);
    return option;
    
  }
 

  module.exports = getOption;