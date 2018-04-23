const {Jatty, JattyDebug} =  require('./jatty');
const UI = require('./best');

UI.chose_item = (x) => console.log(x);
// console.log(UI);
let clean_lines = (x) => x.split(/\r?\n/).map(y => y.trim()).filter(z => z != "");

j = Jatty();
// j = JattyDebug();
j.connect();

UI.chose_item((x) => console.log(x));
let pass_thru = (x) => x;

let clean_package = (x) => x.substr(x.lastIndexOf("=") + 1);
// // I'm so, so sorry, future-me. 4 layers of callbacks, and this is barely the tip. 😞
// j.queue("pm list packages -f", (x) => x.filter(a => !(/\//.test(a))).forEach(y => j.queue(`dumpsys package ${y.trim()} | grep versionName`, pass_thru, (b) => b.substr(b.lastIndexOf("versionName=")).trim())), (a) => clean_lines(a).map(clean_package));
j.queue("pm list packages -f", (x) => x.filter(a => !(/\//.test(a))).forEach(y => j.queue(`dumpsys package ${y.trim()} | grep versionName`, z => { UI.add([y, z, [true, false][Math.floor(Math.random()*2)]]) }, (b) => b.substr(b.lastIndexOf("versionName=")).trim())), (a) => clean_lines(a).map(clean_package));
// // j.queue("ls", (x) => x.forEach(y => j.queue(`ls ${y}`, z => console.log(z)),), clean_lines);

j.play();