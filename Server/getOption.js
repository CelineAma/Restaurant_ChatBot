function getOption(optionNumber) {
    const options = JSON.parse(fs.readFileSync('options.json'));
    const option = options.find(option => option.number === optionNumber);
    return option;
  }


  module.exports = getOption;