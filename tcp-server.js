const net = require('net');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const port = 8124;
let seed = 0;
let separator = "|||||";
let workers = [];

const server = net.createServer((client) => {
  console.log(`Client connected`);
  client.setEncoding('utf8');

  client.on('data', handler);
  client.on('end', () => {
      console.log(`Client disconnected`);
  });

  function handler(data, err) {
    if (!err) {
        switch (data.toString().split(separator)[0]) {
            case "getWorkers" : {
                let res = getWorkers();
                client.write(`getWorkers${separator}${JSON.stringify(res)}`);
                break;
            }
            case "add" : {
                startWorker(data.toString().split(separator)[1]);
                client.write(`add${separator }${workers[workers.length - 1].pid}${separator}${workers[workers.length - 1].startedOn}`);
                break;
            }
            case "remove" : {
                let index = workers.findIndex(worker => worker.pid == data.toString().split(separator)[1]);
                let numbers = getNumbers(workers[index]);
                client.write(`remove${separator}${workers[index].pid}${separator}${workers[index].startedOn}${separator}${numbers}`);
                fs.appendFile(workers[index].filename,  "]");
                process.kill(workers[index].pid);
                workers.splice(index, 1);
                break;
            }
        }
    }
    else console.error(err);
  }
});

server.listen(port, () => {
  console.log(`Server listening on localhost: ${port}\n`);
});

function startWorker(interval) {
    let filename = `json/${Date.now() + seed++}.json`;
    let worker = child_process.spawn('node', ['worker.js', filename, `${interval}`], {detached : true});
    let date = new Date;
    worker.startedOn = date.toDateString() + " " + date.toTimeString();
    worker.filename = 'D:/3-ий курс/ПСКП/Мои лабораторные/cwp-08/' + filename;
    workers.push(worker);
}

function getNumbers(worker) {
    let numbers = fs.readFileSync(worker.filename).data;
    return numbers;
}

function getWorkers() {
    let res = [];
    for (i = 0; i < workers.length; i++) {
        let numbers = getNumbers (workers[i]);
        res.push({
            "pid" : workers[i].pid,
            "startedOn" : workers[i].startedOn,
            "numbers" : numbers
        });
    }
    return res;
}