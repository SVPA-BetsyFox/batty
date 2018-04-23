var blessed = require('blessed')
let format_row = (x) => x.map(x => x.map(y => y.toString()));

let filter_openable = () => {
  console.log("filtering to openable shit");
  table.setData(format_row(data2.filter(x => x[2])));
  screen.render();
  }

let filter = (query) => {
  table.setData(data2.filter(x => x[0].includes(query)));
  screen.render();
  }

var screen = blessed.screen({
  autoPadding: false,
});

var _chose_item = () => undefined;

var table = blessed.listtable({
  //parent: screen,
  top: 'center',
  left: 'center',
  data: null,
  border: false,
  align: 'center',
  tags: true,
  keys: true,
  width: '100%',
  // width: 'shrink',
  height: '100%-2',
  vi: true,
  mouse: true,
  style: {
    header: {
      fg: 'blue',
      bold: true
    },
    cell: {
      fg: 'magenta',
      selected: {
        bg: 'blue'
      }
    }
  }
});

var title = blessed.text({
  parent: screen,
  top: 0,
  left: 0,
  width: '100%',
  content: 'Test'
});


var data2 = [
  [ 'Package',  'Version',  'Can Open?',   'Options' ],
];



// data2[1][0] = '{red-fg}' + data2[1][0] + '{/red-fg}';


screen.key(['q', 'escape'], function() {
  return screen.destroy();
});

screen.key(['z'], function() {
  () => _chose_item(data2[table.selected][0]);
});

screen.key(['enter'], function() {
  filter_openable();
});


table.focus();

table.setData(data2);

screen.append(table);

// data2.push(["what", "what", "what","what"])
// data2.push([])
table.setData(data2);

screen.render();

// var chose_item = () => undefined;

module.exports = {
  chose_item: (xxx) => _chose_item = xxx,
  clear: (row) => {
    data2.push(row);
    table.setData(data2);
    screen.render();
  },
  add: (row) => {
    data2.push(row);
    table.setData(format_row(data2));
    screen.render();
  },
  filter: filter,
  filter_openable: filter_openable
}