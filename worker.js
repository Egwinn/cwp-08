const fs = require('fs');

let filepath = process.argv[2];
let interval = process.argv[3];

setInterval(function() {
    fs.appendFile(filepath, 
        fs.existsSync(filepath) ?
        "," + JSON.stringify(Math.round(Math.random() * 100), null, "\t") :
        "[" + JSON.stringify(Math.round(Math.random() * 100), null, "\t"), 
        (err) => {
            if(err) console.error(err);
        });
}, interval)