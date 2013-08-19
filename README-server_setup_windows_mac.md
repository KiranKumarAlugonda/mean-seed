# server setup

## Windows setup / installing
### NOTE: to add things to environment variables, right click on `My Computer` from Windows Explorer and click `Properties` then `Advanced` then `Environment Variables` then `System Variables` then edit the `Path` variable.
1. install text editor of choice (i.e. Notepad++)
2. install git ( http://git-scm.com/downloads )
	1. follow the default options during installation
	2. setup your github authentication
		1. https://help.github.com/articles/set-up-git
		2. https://help.github.com/articles/generating-ssh-keys
3. Install node.js ( http://nodejs.org/download/ )
4. Install MongoDB ( http://www.mongodb.org/downloads )
	1. Follow the instructions to intall: http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/
		1. Add `[path to your mongo installation folder]\mongodb\bin` to your environmet so you can type `mongod.exe` and `mongo` from any location and it will work.
		2. NOTE: `mongod.exe` may only work when specifying the `--dbpath [path to mongodb]\data` command line option. You SHOULD be able to add that to the `mongod.cfg` file so you don't have to type it every time but for some reason it wasn't working unless typed on the command prompt sometimes... UPDATE: Try restarting your computer then opening a command prompt and typing `mongo` and it may work now! :) If not, just create the folders in the default location... create a 'data' folder on 'C:' drive then create a 'db' folder in the 'C:\data' folder and then it should work..
	2. NOTE: Windows XP is NOT supported as of MongoDB 2.2 (or actually 2.1.2?) so use 2.0.9 - http://docs.mongodb.org/ecosystem/platforms/windows
	3. NOTE: make sure to match the build (i.e. 64 bit vs 32 bit) to your computer. Ideally use a 64 bit build since the 32 bit builds of mongo/ubuntu have a 2GB memory limit! http://www.mongodb.org/downloads#32-bit-limit.
	4. install it as a service so you don't have to run 2 command windows every time (it will start when your computer starts and run in the background).
		1. MongoDB requires 2 windows to run manually - one to run the service `mongod` and another to run the actual `mongo` command to get into the database. But if you install as a service, `mongod` will always be running so you can skip that first step.
		2. restart your computer for this to work if you're having issues.. After restart you should just be able to type 'mongo' from a command prompt and it should work.
		
## Mac setup / installing
### General notes
- adding programs to 'path' (type in terminal): export PATH=$PATH:/new_path_entry
- view path: echo $PATH
- remember to type `sudo` if you get permissions errors or something doesn't work
- most/all commands will be done from Terminal (command shell prompt) so open a new terminal window

1. install text editor of choice (i.e. Sublime, Text Wrangler)
2. install git ( http://git-scm.com/downloads )
	1. follow the default options during installation
	2. setup your github authentication
		1. https://help.github.com/articles/set-up-git
		2. https://help.github.com/articles/generating-ssh-keys
3. Install node.js ( http://nodejs.org/download/ )
	1. Notes after installing:
		Node was installed at
		/usr/local/bin/node
		npm was installed at
		/usr/local/bin/npm
		Make sure that /usr/local/bin is in your $PATH.
4. Install MongoDB ( http://www.mongodb.org/downloads )
	1. IF you already have MacPorts OR Homebrew, use whichever you already have installed. Otherwise, if you have neither, pick one and install them. I used Homebrew BUT note that it requires XCode (4GB or Command Line Tools for XCode (2GB - only available for Lion & Mountain Lion)).
		1. for Homebrew
			1. use the homebrew installation at the top
			2. [commands copied from link above]
			3. you will need xcode (just the basic part "command line tools for xcode", not the full thing) - https://github.com/mxcl/homebrew/wiki/Installation
				1. try this link: http://www.moncefbelyamani.com/how-to-install-xcode-homebrew-git-rvm-ruby-on-mac/
			4. install homebrew (if you don’t already have it)
				1. `ruby -e "$(curl -fsSkL raw.github.com/mxcl/homebrew/go)"`
				2. `brew update`
				3. `brew install mongodb`
			5. add 'mongod' to your path so it can be run from any directory in terminal
				1. export PATH=$PATH:[/new_path_entry]
				2. path is listed in the output for the homebrew install mongodb command - look at the 'summary' section and there’s a path there
				3. `export PATH=$PATH:/usr/local/Cellar/mongodb`
			6. start mongod service with `mongod`
			7. if you get an error about /data/db, you need to create that directory first
				1. `sudo mkdir -p /data/db`
				2. `sudo chown 'id -u' /data/db` OR if you get an 'invalid argument' error for that command, try:
					1. http://stackoverflow.com/questions/7948789/mongodb-mongod-complains-that-there-is-no-data-db-folder
						1. `sudo chmod 0755 /data/db`
						2. `sudo chown mongod:mongod /data/db`
			8. NOTE: to manually use MongoDB, it requires running two terminal windows - one to run the service (mongod) and another for the actual `mongo` command to get into the database. EACH TIME you startup your computer and/or want to use a site, you'll need to FIRST run `mongod` to get the mongo database running.