const http = require('http');
const net = require('net');
const hostname = '127.0.0.1';
const port = 3000;
const tcp_port = 8124;
const tcpConnection = new net.Socket();
tcpConnection.setEncoding('utf-8');

const handlers = {
    '/workers': workers.getWorkers,
    '/workers/add': workers.add,
    '/workers/remove': workers.remove
};

tcpConnection.connect(tcp_port, '127.0.0.1',  (err) => {
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
        extras.logRequest(req.url, body, new Date().toISOString());
        console.log("body : " +body);
        if (body !== "") {
            params = JSON.parse(body);
            cb(null, params);
        }
        else {
            cb(null, null);
        }
    });
}