let tasks = ["pm list packages -f"];

let debug = (...x) => console.log(...x)

const { spawn, spawnSync } = require('child_process');
let connection = spawn('adb', ['connect', "172.30.7.66:4321"]);
connection.stdout.on('data', (x) => console.log("DATAAAAAA: ", x.toString()));

adb = spawn('adb', ['shell']);
// console.log(adb);
// process.exit();


adb.on('exit', () => console.log("exit!"));

adb.stdout.on('data', (x) => console.log("DATA STUFF HAPPENING:", String(adb.stdout.read())));
adb.stdout.on('readable', () => console.log("READABLE STUFF HAPPENING:", String(adb.stdout.read())));
adb.stdout.on('end', () => console.log("end!"));
adb.stdout.on('finish', () => console.log("finish!"));

adb.stdin.write("\n");