const net = require('net');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const localFilePath = process.argv.slice(2)[1];
const firstURL = process.argv.slice(2)[0];

// const pathChecker = function(fp) {
//   let solution = "";
//   let reversed = fp.split("").reverse().join("");
//   let startPath = false;
//   for (let i = 0; i < reversed.length; i++) {
//     if (startPath === true) {
//       solution += reversed[i];
//     }
//     if (reversed[i] === "/") {
//       startPath = true;
//     }
//   }
//   solution = solution.split("").reverse().join("");
//   return solution;
// };

// let pathCheck = pathChecker(localFilePath);

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

// if ((fs.existsSync(pathCheck) && fs.lstatSync(localFilePath).isDirectory()) === false) {
//   console.log("Is this a joke to you?!\nPlease provide a valid directory or file path!");
//   process.exit();
// }

function isValidURL(string) {
  let res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
  return (res !== null);
}

if (isValidURL(myURL)) {

  const conn = net.createConnection({
    host: myURL,
    port: 80
  });

  conn.setEncoding('UTF8');

  conn.on('connect', () => {
    console.log('Connection Established');

    conn.write(`GET / HTTP/1.1\r\n`);
    conn.write(`Host: ${myURL}\r\n`);
    conn.write('\r\n');
  });
  console.log("Connecting to server...");

  setTimeout(() => {
    fs.access(localFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        rl.question(`File doesn't exist yet. \nWant to create a new file? (Y/N): `, (answer) => {
          if (answer[0] === "Y" || answer[0] === 'y') {
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
              rl.close();
            });
          } else {
            conn.end();
            rl.close();
          }
        });
      } else {
        rl.question(`File Already Exists. \nWant to overwrite this file? (Y/N): `, (answer) => {
          if (answer[0] === "Y" || answer[0] === 'y') {
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
              rl.close();
            });
          } else {
            conn.end();
            rl.close();
          }
        });
      }
    });
  }, 100);
} else {
  console.log("Is this a joke to you?!\nPlease provide a valid URL!");
  process.exit();
}
