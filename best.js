var blessed = require('blessed')
var fs = require('fs')
var app_filter = require('./app_filter')

let OUTPUT_SIZE = 6;

//field labels
const PACKAGE = 'Package';
const VERSION = 'Version';
const CANOPEN = 'Can Open?';
const IGNORE = 'Ignored';

const SERIAL_PROPNAME = 'ro.serialno';


class Data {
  constructor(...fieldnames) {
    this.name = "data";
    this.debug = "";
    this.cb = (typeof fieldnames[0] == "function") ? this.cb = fieldnames.shift() : () => undefined;
    this.fieldnames = fieldnames;
    this.obj = {};
    this.meta = {};
  }

  set_name(new_name) {
    // this.name = "device";
    if (new_name !== undefined) this.name = new_name.replace(/\W/ig, "");
  }

  get_name() {
    return this.name;
  }

  persist() {
    return (save(`${this.name}.json`, this.obj) && save(`${this.name}.meta.json`, this.meta));
  }

  restore() {
    this.obj = load(`${this.name}.json`);
  }

  record_complete(id) {
    return (Object.keys(this.obj[id]).length == this.fieldnames.length);
    // Object.keys(this.obj[id]).sort() == this.fieldnames.sort();
    // save("record.json", { record: Object.keys(this.obj[id]).sort(), base: this.fieldnames.sort() })
  }

  update(id, fieldname, value) {
    if (!fieldname in this.fieldnames) return false;
    if (!(id in this.obj)) this.obj[id] = {};
    this.obj[id][fieldname] = value;
    this.obj[id]["_sortkey"] = `${(this.obj[id][CANOPEN] === true) ? 0 : (this.obj[id][CANOPEN] === false) ? 1 : 2}${this.obj[id][PACKAGE]}`;
    if(Object.keys(this.obj[id])) this.cb(id);
    return true;
  }

  read(id) {
    if (id in this.obj) return this.fieldnames.map(fieldname => (fieldname in this.obj[id]) ? this.obj[id][fieldname] : "");
    else return this.fieldnames.map(x => "");
  }

  update_meta(key, value) {
    this.meta[key] = value;
    if ((key == SERIAL_PROPNAME) && (value != null) && (value != undefined)) {
      this.set_name(value);
      this.restore();
    }
    return true;
  }

  read_meta(key) {
    return (key in Object.keys(this.meta)) ? this.meta[key] : "";
  }

  all() {
    let out =[]
    let tmp = Object.keys(this.obj).map(x => this.obj[x]).sort((a, b) => a["_sortkey"].localeCompare(b["_sortkey"]));
    tmp.forEach(x => out.push(this.fieldnames.map(fieldname => (fieldname in x) ? x[fieldname] : "")));
    out.unshift(this.fieldnames);
    return out;
  }

  all_meta() {
    return this.meta;
  }

  count() {
    return Object.keys(this.obj).length;
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
  filled: 1,
});



var title = blessed.text({ parent: screen, top: '1', tags: true, content: 'Android TV Tools, {red-fg}Yes!{/red-fg}' });



var log = (...x) => logger ? logger.log(...x) : console.log(...x);



screen.key(['q', 'escape'], function() {
  console.log("Exiting...");
  setTimeout(() => process.exit(), 1000);
  return screen.destroy();
});

screen.key(['z'], function() {
  () => _chose_item(data.all()[table.selected][0]);
});

screen.key(['enter'], function() {
  let [package, version, canopen, ignored] = data.all()[table.selected];
  if (canopen) {
    j.queue(`monkey -p ${package} 1`, (x) => { log(x.toString()); data.update(package, CANOPEN, x);}, (x) => x.indexOf("injected") > -1);
    j.queue('content insert --uri content://settings/system --bind name:s:accelerometer_rotation --bind value:i:0');
    j.play();
  } else {
    log(`Attempted to open ${package}, but the package has no activities that can be launched interactively.`);
  }
});


table.focus();

// table.setData(data.all());
// screen.append(prompt);
screen.append(table);
screen.append(title);
screen.append(logger);
screen.append(progress);

// table.hide();
// logger.hide();


screen.render();

const {Jatty, JattyDebug} =  require('./jatty');
let conf = load("config.json");
// let ip = conf ? conf.ip : "172.30.7.97"
j = Jatty(conf ? conf.ip : "172.30.7.66", "4321", logger);
j.connect();

let add_entry = (x) => add(data.read(x));

var data = new Data(add_entry, PACKAGE, VERSION, CANOPEN, IGNORE);
table.setData(data.all());

progress.on('complete', () => { title.content = `Android TV Tools, Yes!  Serial: ${data.get_name()}`; data.persist(); });

let is_ignored = (x) => (data.read(x)[3] != "") ? data.read(x)[3] : false;

let pass_thru = (x) => x;

let clean_lines = (x) => x.split(/\r?\n/).map(y => y.trim()).filter(z => z != "");

let clean_version = (x) => x.substr(x.lastIndexOf("versionName=")).trim().substring(12);

let do_props = (x) => { x.forEach((y) => data.update_meta(...y)); data.set_name(); };

let do_all_packages = (x) => { x.filter((a) => !(/[\/ ]/.test(a))).forEach((y) => { data.update(y, PACKAGE, y); do_package_version(y); if (app_filter(y)) do_can_open(y); }); log("All work queued successfully!"); }

let do_package_version = (x) => j.queue(`dumpsys package ${x.trim()} | grep versionName`, (y) => { data.update(x, VERSION, y); if (y == "") do_package_version(x); }, clean_version);

let do_can_open = (x) => (data.read(x)[2] != "") ? data.read(x)[2] : j.queue(`monkey -p ${x} 0`, (y) => data.update(x, CANOPEN, y), (x) => x.indexOf("No activities found to run") == -1);

let clean_package = (x) => x.substr(x.lastIndexOf("=") + 1);
let clean_prop = (x) => { let raw = x.substr(1,x.length-2).split("]: ["); return [raw.shift(), raw.join("]: [")]; }

let clean_everything = (x) => clean_lines(x).map(clean_package);
let clean_props = (x) => clean_lines(x).map(clean_prop);

j.queue("date");
j.queue("getprop", do_props, clean_props);
j.queue("pm list packages -f", do_all_packages, clean_everything);
// // j.queue("ls", (x) => x.forEach(y => j.queue(`ls ${y}`, z => console.log(z)),), clean_lines);

j.play();