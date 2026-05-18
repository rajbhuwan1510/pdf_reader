const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('uploads/somefile'); // I'll need a real file

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
});
