# phonegap/cordova setup

## seed/app specific setup
NOTE: do this AFTER you've got the default phonegap app running successfully - SEE BELOW FIRST for general setup!

1. `git pull` to get updated files (if you're working and changing files locally you can skip this step)
	1. if app config files changed, you'll have to update your local versions accordingly - @todo - document this better
2. run `grunt phonegap`
	1. this build then copies over the following folders/files to the phonegap app `assets/www` folder you created (it will put it in ALL the specific platforms - i.e. `platforms/android`, `platforms/ios`, etc.). NOTE: only android and ios are automatically copied over currently!
		1. `app/src/index.html`
		2. `app/src/build` folder
		3. `app/src/common/font` and `app/src/common/img` folders (you may or may not need the `img` folder depending on if you're using images in the mobile version - when in doubt leave it copied but if you're NOT using some/all images, remove them to reduce the Phonegap packaged file size)
3. refresh then run the app in Phonegap (i.e. in Eclipse for Android or xCode for iOS)



## general setup (not seed/app specific - i.e. to just get the default phonegap app running successfully)

- In general, follow these guides below. This readme is only for gotchas during the process.
	- http://docs.phonegap.com/en/2.9.0/guide_cli_index.md.html#The%20Cordova%20Command-line%20Interface
		- Actually SKIP the above; just use your specific platform guide!
	- http://docs.phonegap.com/en/2.9.0/guide_getting-started_index.md.html#Platform%20Guides

1. ensure you have a recent version of node.js (i.e. v0.10.12 or higher) since you'll get "no method 'tmpdir'" error later on otherwise.
	1. check node version with `node -v`
	2. upgrade
		1. Windows: by redownloading the installer from the nodejs website and re-running it.
		2. Mac/Linux: I think you can run commands from terminal to do this but I'm not sure and I just re-downloaded & re-installed it from the nodejs website and that worked.
2. `[sudo] npm install -g cordova`


From here, instructions are platform specific

### Android
- short version of instructions (copied from http://docs.phonegap.com/en/2.9.0/guide_getting-started_android_index.md.html#Android%20Platform%20Guide )
	- [cd to directory you want to put phonegap - for this seed use a new `app/src/deploys` folder]
	- `cordova create phonegap com.[project] "[Project Name]"`
	- `cd phonegap`
	- `cordova platform add android`
	- `cordova build`
	- Open Eclipse and create new project from existing code then browse to this folder and the platforms/android subdirectory then press 'ok'
		- clean project & fix any errors
		- run on Android device
- to build your actual project (i.e. once you've got it working with the default phonegap app files)
	- delete all files/folders in the `assets/www` directory EXCEPT:
		- `res` folder
		- `config.xml`, `cordova.js`, `cordova_plugins.json` files
	- add in your HTML, CSS, JS, image, etc. files (should be production ready versions ideally - concatenated, minified, etc.)
	- run the app and it should work! debug any issues your code may have :(
	- integrate phonegap plugins (i.e. Facebook Connect)
	
1. update your Android SDK to the most recent version (EVEN if you'll be using a lower (min) version, Cordova will only work with the most recent SDK installed). http://stackoverflow.com/questions/11058816/using-apache-cordova-phonegap-with-android-2-x
	1. For Windows I open the "Android SDK Manager" program and then upgrade/install things from there.
		1. There's a bunch of packages but they seem to install one at a time and only the "SDK Platform Android 4.2.2" is required so just skip the rest..?
2. Once you get to the Eclipse part/steps, right click on your project, go to 'Properties' then the 'Android' nav on the left, then for 'Project Build Target' select the one that matches you device then press the 'OK' button.
	1. if you went to an older SDK version, you'll likely now have errors (i.e. in the 'AndroidManifest.xml' file) because the older SDK version doesn't support new properties; remove them then refresh the app / do a 'clean' and the errors should go away.
		1. for example, for Android 2.3 'hardwareAccelerated' and 'screenSize' are not supported so remove them
		

### iOS
- do NOT use the beginning parts of the ios platform guide; you can just install and use the cordova command line tools instead:
	- install them: `sudo npm install -g cordova`
	- create app:
		- [cd to directory you want to put phonegap - for this seed use a new `app/src/deploys` folder]
		- `cordova create phonegap com.[project] "[Project Name]"`
		- `cd phonegap`
		- `cordova platform add ios`
		- `cordova build`
- after you've built the ios app, open/import it to xCode by going to the phonegap `platforms/ios` folder and double clicking the `.xcodeproj` file
	- run it in xCode (you'll need Apple Developer credentials, provisioning profiles, etc. to run on an actual device)