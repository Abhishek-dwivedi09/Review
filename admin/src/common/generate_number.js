/**
 * Generate Service Request Number
 */
const generateNumber = (length = 7) => {
    var text = "";
    var possible = "0123456789";
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  };
  
  export default { generateNumber };
  