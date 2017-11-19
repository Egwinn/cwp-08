const net = require('net');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const port = 8124;
let seed = 0;

const server = net.createServer((client) => {
  console.log(`Client ${client.id} connected`);
  client.setEncoding('utf8');

  client.on('data', handler);
  client.on('end', () => {
      console.log(`Client ${client.id} disconnected`);
  });

  function handler(data, err) {
    
  }
});

server.listen(port, () => {
  console.log(`Server listening on localhost: ${port}\n`);
});
