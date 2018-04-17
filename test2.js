const { spawn, spawnSync } = require('child_process');
spawnSync('adb', ['connect', '172.30.7.97']);
const child = spawn('adb', ['shell']);
let PROMPT = /^shell@[A-Za-z0-9-_.]+:\/ \$/;


let clean = (x) => x.toString().replace("\r", "");
let finish = function() {
  process.exit(0);
}

let altcap = 0;
let packages = (x) => {
  console.log("DOING SHIT");
  return x.toString().split("\n").map(x => x.split("").map(y => (altcap++ % 2 == 0) ? y.toUpperCase() : y.toLowerCase()).join(""));
}

var usable = false;
let mode = "output";

let tasks = [{cmd: "pm list packages -f", clean: clean, cb: packages }, {cmd: "exit", clean: finish}];
let current_task = {};
let temp = [];
let output = [];

let last_output_ts = Date.now();



let timeout = setTimeout(() => {
  flush();
  console.log(output);
  process.exit(1)},
  20000);

let reset_timeout = function(t=5000) {
  console.log("Timeout counter was reset!");
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    flush();
    console.log("----------------------------------------------------------------------");
    console.log(output);
    process.exit(1);
  },
  t)
}


let flush = function() {
  last_output_ts = Date.now();
  process.stdout.write("###\n");
  if ("clean" in current_task) {
    // console.log(`CALLING CB ON "${temp}", which is of type ${typeof temp}`);
    temp = current_task["clean"](temp);
  }
  console.log("" + temp);
  if (temp.join != undefined) temp = temp.join("")
  output.push(temp);
  temp = [];
  console.log(("cb" in current_task) ? current_task["cb"](output) : output);
  if ((current_task = tasks.shift()) !== undefined && "cmd" in current_task) {
    send(current_task["cmd"]);
  }
}

let process_data = function(data) {
  // console.log(`ms since last data is: ${Date.now() - last_output_ts}`);
  process.stdout.write("=");
  if ((data == undefined) || (data == null)) {
    if (Date.now() - last_output_ts > 10000) flush();
    if (Date.now() - last_output_ts > 30000) process.quit("OH GOD TIMEOUT");
    return;
  }
  if (PROMPT.test(data)) flush();
  else temp.push(data.toString());

  last_output_ts = Date.now();


  // if (PROMPT.test(data) && tasks.length > 0) {
  //   current_task = tasks.shift()
  //   if ("cmd" in current_task) send(current_task["cmd"]);
  // }
  // else if (mode == "output" && data.trim().length > 0) temp.push(data.trim());
}

let send = function(data) {
  child.stdin.write(data + "\n");
}

child.stdout.on('readable', () => {
  usable = true;
  let i = 0;
  process_data(child.stdout.read());
  // if (raw) console.log(raw.toString());
  // console.log(`${typeof raw}: "${raw}"`);
  // if (raw) console.log("line 43" + process_data(raw.toString()));
  // lines = raw ? raw.toString().split("\n") : []
  // lines.forEach(line => process_data(line));
});

child.stdout.on('end', () => {
  // console.log('end');
});

child.stdout.on('finish', () => {
  // console.log("output is------------------>\n" + output);
  console.error('All writes are now complete.');
  finish();
});

// child.stdout.pause();
// while(!usable) { child.stdin.write("ls"); console.log("waiting...")}
// child.stdin.write("ls\n");
// child.stdin.write("exit\n");
// child.stdout.resume();
// child.stdin.write("ls\n");
// child.stdout.on('readable', function() {
//   fnord = child.stdout.read();
//   console.log(fnord);
//   // console.log(data.toString());
//   // if (!sending) {
//   //   usable = (PROMPT.test(data.toString()));
//   //   console.log(usable);
//   //   writing = true;
//   //   console.log(data.toString());
//   //   result += data.toString();
//   //   writing = false;
//   // }
//   // return true;
// });
// ls = () => {
//   sending = true;
//   while(writing);
//   child.stdin.write("ls -a\n");
//   sending = false;
// }

// exit = () => {
//   sending = true;
//   while(writing);
//   // while(!usable);
//   child.stdin.write("exit\n");
//   sending = false;
// }

// ls();
// exit();

// while ((fnord = child.stdout.read()) != undefined) {
//   console.log(fnord);
// }