var blessed = require('blessed')
var fs = require('fs')
let OUTPUT_SIZE = 5;



class Data {
  constructor(...fieldnames) {
    this.fieldnames = fieldnames;
    this.obj = {};
  }

  update(id, fieldname, value) {
    if (!fieldname in this.fieldnames) return false;
    if (!(id in this.obj)) this.obj[id] = {};
    this.obj[id][fieldname] = value;
    return true;
  }

  read(id) {
    if (id in this.obj) return this.fieldnames.map(fieldname => (fieldname in this.obj[id]) ? this.obj[id][fieldname] : "");
    else return this.fieldnames.map(x => "");
  }

  all() {
    let out = [this.fieldnames];
    for (let id of Object.keys(this.obj)) {
      out.push(this.read(id));
    }
    return out;
  }
}



let save = function(filename, data) {
  let success = true;
  fs.writeFile(filename, JSON.stringify(data), (err) => success = false);
  return success;
}

let format_row = (x) => x.map(x => x.map(y => y.toString()));

let loop = (n=1, func, ...args) =>  {
  let out = [];
  for(let i=n; i>0; i--) out.push(func(i, n, ...args));
  return out;
}

let filter_openable = () => {
  console.log("filtering to openable stuff");
  table.setData(format_row(data.filter(x => x[2])));
  screen.render();
  }


let filter = (query) => {
  table.setData(data.filter(x => x[0].includes(query)));
  screen.render();
  }


let clear = (row) => {
    data.push(row);
    table.setData(data);
    screen.render();
  }


let add = (row) => {
    progress.setProgress(j.status());
    data.push(row);
    table.setData(format_row(data));
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
  height: '100%-7',
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
  top: "100%-6",
  wrap: true,
  border: false,
  valign: 'bottom',
  align: 'center',
  mouse: true,
  keys: true,
  width: '100%',
  height: OUTPUT_SIZE - 1,
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


var data = [ [ 'Package',  'Version',  'Can Open?',   'Options' ] ];


screen.key(['q', 'escape'], function() {
  console.log("Exiting...");
  setTimeout(() => process.exit(), 1000);
  return screen.destroy();
});

screen.key(['z'], function() {
  () => _chose_item(data[table.selected][0]);
});

screen.key(['enter'], function() {
  log(data[table.selected][0]);
});


table.focus();

table.setData(data);

screen.append(table);
screen.append(title);
screen.append(logger);
screen.append(progress);


table.setData(data);

screen.render();

progress.on('complete', () => save('data.json', data));


const {Jatty, JattyDebug} =  require('./jatty');


j = Jatty("172.30.7.97", logger);
j.connect();

let pass_thru = (x) => x;
let add_entry = (z, y) => add([y, z, [true, false][Math.floor(Math.random()*2)]]);
let clean_lines = (x) => x.split(/\r?\n/).map(y => y.trim()).filter(z => z != "");
let clean_version = (b) => b.substr(b.lastIndexOf("versionName=")).trim();
let clean_package = (x) => x.substr(x.lastIndexOf("=") + 1);
let can_open_package = (x) => j.queue(`monkey -p ${x} 0`, (x) => add_entry(x, y), clean_version);
let do_package_version = (y) => j.queue(`dumpsys package ${y.trim()} | grep versionName`, (x) => add_entry(x, y), clean_version);
let do_all_package_versions = (x) => { x.filter(a => !(/[\/ ]/.test(a))).forEach(do_package_version); log("All work queued successfully!"); }
let clean_everything = (a) => clean_lines(a).map(clean_package);

j.queue("pm list packages -f", do_all_package_versions, clean_everything);
// // j.queue("ls", (x) => x.forEach(y => j.queue(`ls ${y}`, z => console.log(z)),), clean_lines);

j.play();