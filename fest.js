var { spawnSync } = require('child_process');

console.log('start adb connect');
var adb = spawnSync('adb', ['connect', '172.30.7.66:4321']);
console.log(adb.stdout.toString());
console.log('end adb connect');

process.on('exit', function() {
    console.log('lol done.')
});