const net = require('net');
const fs = require('fs');

const localFilePath = process.argv.slice(2)[1];
const firstURL = process.argv.slice(2)[0];

const urlRepair = function(url) {
  let myURL = "";
  let startOfUrl = false;
  for (let i = 0; i < url.length; i++) {
    if ((i === url.length - 1) && url[i] === "/") {
      break;
    }
    if (startOfUrl) {
      myURL += url[i];
    }
    if (url[i] === ".") {
      startOfUrl = true;
    }
  }
  return myURL;
};

let myURL = urlRepair(firstURL);

console.log(myURL);

const conn = net.createConnection({
  host: myURL,
  port: 80
});

conn.setEncoding('UTF8');

conn.on('connect', () => {
  console.log('Connected to server');

  conn.write(`GET / HTTP/1.1\r\n`);
  conn.write(`Host: ${myURL}\r\n`);
  conn.write('\r\n');
});
console.log("Connecting to server...");

conn.on('data', (data) => {
  const content = data;
  fs.writeFile(`${localFilePath}`, content, err => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Downloaded and saved ${content.length} bytes to ${localFilePath}`);
  });
  conn.end();
});

