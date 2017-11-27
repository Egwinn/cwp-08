const http = require('http');
const net = require('net');
const hostname = '127.0.0.1';
const port = 3000;
const tcp_port = 8124;
const separator = "|||||";
const tcpConnection = new net.Socket();
tcpConnection.setEncoding('utf-8');

const workers = {
    "getWorkers": function (req, res, payload, cb) {
        tcpConnection.write("getWorkers");
        tcpConnection.on('data', (data, error) => {
            if (!error) {
                if (data.toString().split(separator)[0] === "getWorkers") {
                    cb(null, JSON.parse(data.toString().split(separator)[1]));
                }
            }
            else console.error(error);
        });
    },

    "add": function (req, res, payload, cb) {
        if (payload.x !== undefined) {
            tcpConnection.write(`add${separator}${payload.x}`);
            tcpConnection.on('data', (data, error) => {
                if (!error) {
                    if (data.toString().split(separator)[0] === "add") {
                        cb(null, {
                            pid: data.toString().split(separator)[1],
                            startedOn: data.toString().split(separator)[2],
                        });
                    }
                }
                else console.error(error);
            });
        }
        else cb({code: 405, message: 'Worker not found'});
    },

    "remove": function (req, res, payload, cb) {
        if (payload.id !== undefined) {
            tcpConnection.write(`remove${separator}${payload.id}`);
            tcpConnection.on('data', (data, error) => {
                if (!error) {
                    if (data.toString().split(separator)[0] === "remove") {
                        cb(null, {
                            pid: data.toString().split(separator)[1],
                            startedOn: data.toString().split(separator)[2],
                            numbers: data.toString().split(separator)[3],
                        });
                    }
                }
                else console.error(error);
            });
        }
        else cb({code: 405, message: 'Worker not found'});
    },
};

const handlers = {
    '/workers': workers.getWorkers,
    '/workers/add': workers.add,
    '/workers/remove': workers.remove
};

tcpConnection.connect(tcp_port, hostname,  (err) => {
    if (err) console.error("Connection not established");
    else console.log('Connected to the TCP server')   
});

const server = http.createServer((req, res) => {
    parseBodyJson(req, (err, payload) => {
        const handler = getHandler(req.url);
        handler(req, res, payload, (err, result) => {
            if (err) {
                res.writeHead(err.code, {'Content-Type' : 'application/json'});
                res.end( JSON.stringify(err) );
                return;
            }
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result, null, "\t"));
        });
    });
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});


function getHandler(url) {
    return handlers[url] || notFound;
}

function notFound(req, res, payload, cb) {
    cb({ code: 404, message: 'Not found'});
}

function parseBodyJson(req, cb) {
    let body = [];
    req.on('data', function (chunk) {
        body.push(chunk);
    }).on('end', function () {
        body = Buffer.concat(body).toString();
        if (body !== "") {
            params = JSON.parse(body);
            cb(null, params);
        }
        else {
            cb(null, null);
        }
    });
}