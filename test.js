const {Jatty, JattyDebug} =  require('./jatty');


let clean_lines = (x) => x.split(/\r?\n/).map(y => y.trim()).filter(z => z != "");

// j = new Jatty();
j = JattyDebug();
j.connect();

let clean_package = (x) => x.substr(x.lastIndexOf("=") + 1);
// I'm so, so sorry, future-me. 4 layers of callbacks, and this is barely the tip. 😞
// j.queue("pm list packages -f", (x) => x.filter(a => !(/\//.test(a))).forEach(y => j.queue(`dumpsys package ${y.trim()} | grep versionName`, z => console.log("I AM THE NESTED ONE " + y.trim() + z), (b) => b.substr(b.lastIndexOf("versionName=")).trim())), (a) => clean_lines(a).map(clean_package));
j.queue("pm list packages -f", (x) => x.filter(a => !(/\//.test(a))).forEach(y => j.queue(`dumpsys package ${y.trim()} | grep versionName`, z => console.log(JSON.stringify([y, z])), (b) => b.substr(b.lastIndexOf("versionName=")).trim())), (a) => clean_lines(a).map(clean_package));
// j.queue("ls", (x) => x.forEach(y => j.queue(`ls ${y}`, z => console.log(z)),), clean_lines);

j.play();