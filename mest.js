var app_filter = require('./app_filter')
let fnord = ["com.android.bluetooth", "com.google.android.youtube.tv", "com.android", "com.android.sdfgsdfgfg", "com.fnord", "om"]
fnord.forEach(x => console.log(x, app_filter(x)));