var spawn = require('child_process').spawn,
sh    = spawn('sh');

sh.stdout.on('readable', function () {
  console.log(String(sh.stdout.read()));
});

// sh.stderr.on('readable', function () {
//   console.log('stderr: ' + String(sh.stderr.read()));
// });

sh.on('exit', function (code) {
  console.log('child process exited with code ' + code.toString());
});

// sh.stdin.write("this is the command that never ends this is the command that never ends this is the command that never ends this is the command that never ends this is the command that never ends this is the command that never ends this is the command that never ends this is the command that never ends this is the command that never ends this is the command that never ends this is the command that never ends\nls\nexit\n");
setTimeout(() => sh.stdin.write("sh\nls -lh\nexit\n"), 5000)
