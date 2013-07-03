# phonegap/cordova setup

- In general, follow these guides below. This readme is only for gotchas during the process.
	- http://docs.phonegap.com/en/2.9.0/guide_cli_index.md.html#The%20Cordova%20Command-line%20Interface
		- Actually SKIP the above; just use your specific platform guide!
	- http://docs.phonegap.com/en/2.9.0/guide_getting-started_index.md.html#Platform%20Guides

1. ensure you have a recent version of node.js (i.e. v0.10.12 or higher) since you'll get "no method 'tmpdir'" error later on otherwise.
	1. check node version with `node -v`
	2. upgrade
		1. Windows: by redownloading the installer from the nodejs website and re-running it.
		2. Mac/Linux: ? I think you can run commands from terminal to do this but I'm not sure.
2. `[sudo] npm install -g cordova`


From here, instructions are platform specific

## Android
1. update your Android SDK to the most recent version (EVEN if you'll be using a lower (min) version, Cordova will only work with the most recent SDK installed). http://stackoverflow.com/questions/11058816/using-apache-cordova-phonegap-with-android-2-x
	1. For Windows I open the "Android SDK Manager" program and then upgrade/install things from there.
		1. There's a bunch of packages but they seem to install one at a time and only the "SDK Platform Android 4.2.2" is required so just skip the rest..?
2. Once you get to the Eclipse part/steps, right click on your project, go to 'Properties' then the 'Android' nav on the left, then for 'Project Build Target' select the one that matches you device then press the 'OK' button.
	1. if you went to an older SDK version, you'll likely now have errors (i.e. in the 'AndroidManifest.xml' file) because the older SDK version doesn't support new properties; remove them then refresh the app / do a 'clean' and the errors should go away.
