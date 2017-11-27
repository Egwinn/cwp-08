const fs = require('fs');

let filepath = process.argv[2];
let interval = process.argv[3];
let min = 0;
let max = 100;

setInterval(function() {
    fs.appendFile(filepath, 
        fs.existsSync(filepath) ?
        "," + JSON.stringify(Math.round(Math.random() * (max - min)) + min, null, "\t") :
        "[" + JSON.stringify(Math.round(Math.random() * (max - min)) + min, null, "\t"), 
        (err) => {
            if(err) console.error(err);
        });
}, interval)