var blessed = require('blessed')
var fs = require('fs')
let OUTPUT_SIZE = 6;

//field labels
const PACKAGE = 'Package';
const VERSION = 'Version';
const CANOPEN = 'Can Open?';
const OPTIONS = 'Options';


class Data {
  constructor(...fieldnames) {
    this.debug = "";
    // save("data", fieldnames)q
    this.cb = (typeof fieldnames[0] == "function") ? this.cb = fieldnames.shift() : () => undefined;
    this.fieldnames = fieldnames;
    this.obj = {};
  }

  persist() {
    return save("data.json", this.obj);
  }

  restore() {
    this.obj = load("data.json");
  }

  record_complete(id) {
    // Object.keys(this.obj[id]).sort() == this.fieldnames.sort();
    // save("record.json", { record: Object.keys(this.obj[id]).sort(), base: this.fieldnames.sort() })
  }

  update(id, fieldname, value) {
    this.debug += `UPDATE CALLED WITH ID="${id}", FIELD="${fieldname}", VALUE="${value}"` + "-".repeat(25) + "\n";
    save("debug.txt", this.debug, true);
    if (!fieldname in this.fieldnames) return false;
    if (!(id in this.obj)) this.obj[id] = {};
    this.obj[id][fieldname] = value;
    if(Object.keys(this.obj[id])) this.cb(id);
    return true;
  }

  read(id) {
    if (id in this.obj) return this.fieldnames.map(fieldname => (fieldname in this.obj[id]) ? this.obj[id][fieldname] : "");
    else return this.fieldnames.map(x => "");
  }

  all() {
    let out = [];
    for (let id of Object.keys(this.obj).sort()) {
      out.push(this.read(id));
    }
    // out.sort((a, b) => a[0].localeCompare(b[0]));
    out.unshift(this.fieldnames);
    return out;
  }
}


let load = function(filename) {
  let out = {};
  try {
    out = JSON.parse(fs.readFileSync(filename));
  } catch(e) {
    console.log(e);
  } 
  return out;
}


let save = function(filename, serializable, raw=false) {
  let success = true;
  serializable = raw ? serializable : JSON.stringify(serializable)
  try {
    fs.writeFileSync(filename, serializable);
    return true;
  } catch(e) {
    console.log(e);
    return false;
  }
}

let format_rows = (x) => x.map(x => x.map(y => y.toString()));

let loop = (n=1, func, ...args) =>  {
  let out = [];
  for(let i=n; i>0; i--) out.push(func(i, n, ...args));
  return out;
}

let filter_openable = () => {
  console.log("filtering to openable stuff");
  table.setData(format_rows(data.all().filter(x => x[2])));
  screen.render();
  }


let filter = (query) => {
  table.setData(data.all().filter(x => x[0].includes(query)));
  screen.render();
  }


let clear = (row) => {
    // data.push(row);
    table.setData(data.all());
    screen.render();
  }


let add = (row) => {
    progress.setProgress(j.status());
    let selected = table.selected;
    let scroll = table.getScroll();
    table.setData(format_rows(data.all()));
    table.setScroll(scroll);
    table.selected = selected;
    screen.render();
  }



var screen = blessed.screen();

var _chose_item = () => undefined;

var table = blessed.listtable({
  parent: screen,
  scrollbar: {
      bg: 'blue',
      fg: 'green',
    },
  top: 1,
  border: false,
  valign: 'top',
  align: 'left',
  tags: true,
  keys: true,
  width: '100%',
  height: `100%-${OUTPUT_SIZE + 1}`,
  mouse: true,
  style: {
    header: {
      fg: '#006',
      bg: 'white',
      bold: true
    },
    cell: {
      fg: 'magenta',
      selected: {
        bg: 'blue'
      },
      align: 'left',
    }
  }
});

var logger = blessed.log({
  scrollOnInput: true,
  parent: screen,
  scrollable: true,
  alwaysScroll: true,
  top: `100%-${OUTPUT_SIZE}`,
  wrap: true,
  border: false,
  valign: 'bottom',
  align: 'center',
  mouse: true,
  keys: true,
  width: '100%',
  height: OUTPUT_SIZE,
  style: {
  },
  content: ""
});

log = (x) => logger.log(x);


var progress = blessed.progressbar({
  top: "100%-1",
  border: false,
  style: {
    fg: 'green',
    bg: 'blue',
    bar: {
      bg: 'green',
      fg: 'blue'
    },
    border: false,
  },
  ch: " ",
  width: '100%',
  filled: 0,
});

var title = blessed.text({ parent: screen, top: '1', tags: true, content: 'Android TV Tools, {red-fg}Yes!{/red-fg}' });





screen.key(['q', 'escape'], function() {
  console.log("Exiting...");
  setTimeout(() => process.exit(), 1000);
  return screen.destroy();
});

screen.key(['z'], function() {
  () => _chose_item(data.all()[table.selected][0]);
});

screen.key(['enter'], function() {
  let package = data.all()[table.selected][0]
  j.queue(`monkey -p ${package} 1`, (x) => { log(x.toString()); data.update(package, CANOPEN, x);}, (x) => x.indexOf("injected") > -1);
  j.play();
});


table.focus();

// table.setData(data.all());

screen.append(table);
screen.append(title);
screen.append(logger);
screen.append(progress);


screen.render();

progress.on('complete', () => data.persist());


const {Jatty, JattyDebug} =  require('./jatty');
let conf = load("config.json");
// let ip = conf ? conf.ip : "172.30.7.97"
j = Jatty(conf ? conf.ip : "172.30.7.97", logger);
j.connect();

let add_entry = (x) => add(data.read(x));

var data = new Data(add_entry, 'Package', 'Version', 'Can Open?', 'Options');
table.setData(data.all());

let pass_thru = (x) => x;

// let add_entry = (z, y) => add([y, z, [true, false][Math.floor(Math.random()*2)]]);

let clean_lines = (x) => x.split(/\r?\n/).map(y => y.trim()).filter(z => z != "");

let clean_version = (b) => b.substr(b.lastIndexOf("versionName=")).trim();

let do_all_packages = (x) => { x.filter((a) => !(/[\/ ]/.test(a))).forEach((y) => { data.update(y, PACKAGE, y); do_package_version(y); /* do_can_open(y); */ }); log("All work queued successfully!"); }

let do_package_version = (x) => j.queue(`dumpsys package ${x.trim()} | grep versionName`, (y) => { data.update(x, VERSION, y); if (y == "") do_package_version(x); }, clean_version);

let do_can_open = (x) => j.queue(`monkey -p ${x} 0`, (y) => data.update(x, CANOPEN, y), (x) => x.indexOf("No activities found to run") == -1);

let clean_package = (x) => x.substr(x.lastIndexOf("=") + 1);

let clean_everything = (x) => clean_lines(x).map(clean_package);

j.queue("pm list packages -f", do_all_packages, clean_everything);
// // j.queue("ls", (x) => x.forEach(y => j.queue(`ls ${y}`, z => console.log(z)),), clean_lines);

j.play();