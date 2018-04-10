# Betsy's Android TV Tools, Yes!

Requirements:
* Python 3, ADB installed and in path, an Android TV on the same network as your machine

Caveats:
* There are still a few bits of code where I refer to IP as if it was the serial number, and vice versa.
* There's still the occasional instance where the app fails to communicate with the TV, but these are usually resolvable by restarting the app, or by checking the connection. I'm in the process of smoothing this out- the app will already retry the connection up to 3x whenever it hits an issue.

Instructions for use:
* Unzip the contents of the repository to a folder of your choosing- currently all saved data is stored in the same folder as the script, so you'll need read/write permissions to this folder.
* From a command prompt in the folder, run `python auditapps.py`, and you should be presented with a little window prompting you for an IP address
* Enter the IP address of the Android TV (or any other Android device) you wish to work with, and click the yoink button to grab an interactive report *NB: the device must have remote debugging enabled*
* If any apps have changed version numbers since the last time you ran a report, they will be highlighted in red
* Click the open app button next to any app to open it. *NB: apps/packages that report NOT having an interactive launchable activity cannot be launched directly*