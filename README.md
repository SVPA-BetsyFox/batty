# Betsy's Android TV Tools, Yes!

Requirements:
* Python 3, ADB installed and in path, an Android TV on the same network as your machine

Caveats:
* There are still a few bits of code where I refer to IP as if it was the serial number, and vice versa.
* There's still the occasional instance where the app fails to communicate with the TV, but these are usually resolvable by restarting the app, or by checking the connection. I'm in the process of smoothing this out- the app will already retry the connection up to 3x whenever it hits an issue.