var debug = {
    get: function(obj, prop, receiver) {
      // console.log(`===== [DEBUG] "${prop}" was called`);
      if (prop in obj) {
        if (typeof obj[prop] != "function") {
          return obj[prop];
        } else {
          return (...args) => {
            // if (prop == "queue") console.log(prop + " was called with " + args[0]);
            return obj[prop](...args);
          }
        }
      } else {
        return undefined;
      }
      }
  }

var Jatty = function(ip="172.30.7.97") {
  const { spawn, spawnSync } = require('child_process');
  const PROMPT = /shell@[A-Za-z0-9-_.]+:\/ \$/;
  const DEFAULT_TIMEOUT = 10000;
  const PROCESS_TIMEOUT = 30000;

  var adb, timeout;
  var running = false;
  var temp = [];
  var output = [];
  // var _debug = true;

  // var clean = (x="") => x.toString().replace("\r", "");
  // var debug = (x) => _debug ? console.log(x) : null;
  var finish = () => process.exit(0);
  var stop_timer = () => clearTimeout(timeout);

  var pause = () => running = false;
  var play = () => current_task ? send(current_task["cmd"]) : send();
  var queue = (cmd, cb=(x)=>x, clean=(y)=>y) => { let _running = running; running = false; tasks.push({cmd: cmd, cb: cb, clean: clean}); running = _running; };


  var stop = function(stopcode=0) {
    console.log("-    -   -  - - -----= Stop was called- flushing and quitting =----- - -  -   -    -");
    flush();
    console.log("LAST OUTPUT:");
    console.log(output)
    // process.exit(stopcode);
  }


  var connect = function(msg) {
    // if (msg !== undefined) console.log(msg);
    status = spawnSync('adb', ['connect', ip]).toString();    
    adb = spawn('adb', ['shell']);
    // adb.stdout.pipe(process.stdout);
    adb.on('exit', () => connect());
    adb.stdout.on('readable', () => recieve(adb.stdout.read()));
    adb.stdout.on('end', () => connect("RECONNECTING..."));
    adb.stdout.on('finish', () => console.error('All writes are now complete.'));
  }


  var tasks = [];//[{cmd: "pm list packages -f", clean: clean }, {cmd: "exit", clean: finish}];
  var current_task = {};
  var output = [];

  var last_output_ts = Date.now();

  var reset_timer = function(t=10000) {
    // console.log("Timeout counter was reset!");
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      flush();
      // console.log("----------------------------------------------------------------------");
      // console.log(output);
      process.exit(1);
    },
    t)
  }


  var flush = function() {
    stop_timer();
    if (current_task && "clean" in current_task) {
      temp = current_task["clean"](temp.join(""));
    }
    output = temp;
    temp = [];
    (current_task && "cb" in current_task) ? current_task["cb"](output) : null;
    if (running && (current_task = tasks.shift()) !== undefined && "cmd" in current_task) {
      send(current_task["cmd"]);
    }
    return output;
  }


  var recieve = function(data) {
    process.stdout.write(".");
    if ((data == undefined) || (data == null)) {
      if (Date.now() - last_output_ts > DEFAULT_TIMEOUT) flush();
      if (Date.now() - last_output_ts > PROCESS_TIMEOUT) process.exit("OH GOD TIMEOUT");
      return;
    }
    if (PROMPT.test(data)) flush();
    else temp.push(data.toString());

    last_output_ts = Date.now();
  }


  var send = function(data="") {
    running = false;
    reset_timer();
    // setTimeout(() => running = false, 100);
    adb.stdin.write(data + "\n");
    running = true;
    if (data == "exit") stop();
  }

  return {
    connect: connect,
    send: send,
    recieve: recieve,
    flush: flush,
    stop_timer: stop_timer,
    pause: pause,
    play: play,
    queue: queue,
    stop: stop,
    finish: finish,

    reset_timer: reset_timer,
  }
}

let clean_lines = (x) => x.split(/\r?\n/).map(y => y.trim()).filter(z => z != "");

// j = new Jatty();
j = new Proxy(new Jatty(), debug);
j.connect();

let clean_package = (x) => x.substr(x.lastIndexOf("=") + 1);
// I'm so, so sorry, future-me. 4 layers of callbacks, and this is barely the tip. 😞
// j.queue("pm list packages -f", (x) => x.filter(a => !(/\//.test(a))).forEach(y => j.queue(`dumpsys package ${y.trim()} | grep versionName`, z => console.log("I AM THE NESTED ONE " + y.trim() + z), (b) => b.substr(b.lastIndexOf("versionName=")).trim())), (a) => clean_lines(a).map(clean_package));
j.queue("pm list packages -f", (x) => x.filter(a => !(/\//.test(a))).forEach(y => j.queue(`dumpsys package ${y.trim()} | grep versionName`, z => console.log(JSON.stringify([y, z])), (b) => b.substr(b.lastIndexOf("versionName=")).trim())), (a) => clean_lines(a).map(clean_package));
// j.queue("ls", (x) => x.forEach(y => j.queue(`ls ${y}`, z => console.log(z)),), clean_lines);

j.play();
// j.stop();
// j.pause();
// j.queue();