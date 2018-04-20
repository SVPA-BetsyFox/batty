var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true
});

screen.title = 'Jatty';

// Create a window perfectly centered horizontally and vertically.
var window = blessed.box({
  top: 'top',
  left: 'left',
  width: '100%',
  height: '100%',
  // content: ' Hello {bold}world{/bold}!',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    // border: { type: 'none' },
    //   fg: '#f0f0f0'
    // },
    // hover: {
    //   bg: 'green'
    // }
  }
});

// Append our window to the screen.
screen.append(window);

var fnord = blessed.box({
  parent: window,
  scrollable: true,
  top: 'top',
  left: 'left',
  width: '50%',
  height: '100%-2',
  content: ' d',
  tags: true,
  border: {
    type: 'line'
  },
  style: {
    scrollbar: {
      bg: 'blue'
    },
    fg: 'white',
    bg: 'black',
    border: {
      fg: '#f0f0f0'
    },
    // hover: {
    //   bg: 'green'
    // }
  }
});

// If our window is clicked, change the content.
window.on('click', function(data) {
  window.setContent('{center}Some different {red-fg}content{/red-fg}.{/center}');
  screen.render();
});

// If window is focused, handle `enter`/`return` and give us some more content.
window.key('enter', function(ch, key) {
  window.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  window.setLine(1, 'bar');
  window.insertLine(1, 'foo');
  screen.render();
});

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

// for(var i=9;i>0;i++) fnord.insertBottom(i);
i = "whaaaaat"
for(var i=99;i>0;i--) fnord.insertBottom(i.toString());
// 
// Focus our element.
window.focus();


// Render the screen.
screen.render();