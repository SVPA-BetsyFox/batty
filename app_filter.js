var whitelist = ["com.android.vending", "com.google.android.youtube.tv"]
var blacklist = ["android", "com.android", "com.google.android"]
module.exports = (x) => (whitelist.includes(x) || !blacklist.reduce((acc, y) => x.startsWith(y) || acc, false))