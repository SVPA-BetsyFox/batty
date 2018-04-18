

var Jatty = function(ip="172.30.7.97") {
  const { spawn, spawnSync } = require('child_process');
  const PROMPT = /shell@[A-Za-z0-9-_.]+:\/ \$/;
  const DEFAULT_TIMEOUT = 10000;

  var adb, timeout;
  var running = false;
  var temp = [];
  var output = [];

  // var clean = (x="") => x.toString().replace("\r", "");
  var finish = () => process.exit(0);
  var stop_timer = () => clearTimeout(timeout);

  var reset_timer = function(t=DEFAULT_TIMEOUT) {
    clearTimeout(timeout);
    timeout = setTimeout(() => stop(), t);
  }


  var pause = () => running = false;
  var play = () => current_task ? send(current_task["cmd"]) : send();
  var queue = (cmd, cb=(x)=>x, clean=(x)=>x) => tasks.push({cmd: cmd, cb: cb, clean: clean});


  var stop = function(stopcode=0) {
    console.log("-    -   -  - - -----= Stop was called- flushing and quitting =----- - -  -   -    -");
    flush();
    console.log("LAST OUTPUT:");
    console.log(output)
    process.exit(stopcode);
  }


  var connect = function(msg) {
    if (msg !== undefined) console.log(msg);
    status = spawnSync('adb', ['connect', ip]).toString();    
    adb = spawn('adb', ['shell']);
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
      console.log("----------------------------------------------------------------------");
      console.log(output);
      process.exit(1);
    },
    t)
  }


  var flush = function() {
    stop_timer();
    if (current_task && "clean" in current_task) {
      console.log('THERE IS A CLEAN FUNCTION, CALLING IT')
      // console.log(`CALLING CB ON "${temp}", which is of type ${typeof temp}`);
      temp = current_task["clean"](temp.join(""));
    }
    console.log("TEMP STUFF AT FLUSHING TIEM: " + temp);
    // if (temp.join != undefined) temp = temp.join("")
    output = temp;
    temp = [];
    console.log('-'.repeat(80))
    console.log((current_task && "cb" in current_task) ? current_task["cb"](output) : output);
    console.log('-'.repeat(80))
    if (running && (current_task = tasks.shift()) !== undefined && "cmd" in current_task) {
      send(current_task["cmd"]);
    }
  }


  var recieve = function(data) {
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
  }


  var send = function(data="") {
    running = true;
    reset_timer();
    adb.stdin.write(data + "\n");
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

let clean_lines = (x) => {
  console.log('CLEAN LINES WAS CALLED');
  return x.split(/\r?\n/).map(y => y.trim());
}

j = new Jatty();
j.connect();
j.queue("ls", (x)=>x, clean_lines);
j.play();
// j.stop();
// j.pause();
// j.queue();