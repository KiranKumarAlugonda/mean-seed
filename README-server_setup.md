# server setup

## Ubuntu setup / installing
For a remote server, SSH in to login with `ssh [user]@[ip address or domain of server]` - i.e. `ssh root@111.111.111.111` then type the password for that user.
1. add users
	- `adduser lmadera` (then follow prompts)
	- give sudo privilges `adduser lmadera sudo`
	- optional but recommended - add group and add user to group
		- `groupadd developers`
		- add user to group: `usermod -a -G developers lmadera`
2. log out of root then re-login as the user you just created
3. `sudo apt-get update`
4. Install git: `sudo apt-get install git-core`
5. Install node.js
	- https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
		- scroll down to the 'Ubuntu' section and follow the instructions / commands there
		- instructions say to symlink at the end but this didn't work / it wasn't necessary?
			- `sudo ln -s /usr/bin/nodejs /usr/bin/node`
			- http://stackoverflow.com/questions/18130164/nodejs-vs-node-on-ubuntu-12-04
			- UPDATE: got an error: `failed to create symbolic link `/usr/bin/node': File exists` - so maybe it's already done / don't need to do this?
	- optional but recommended
		1. run on port 80 (assuming node runs on port 3000 - change according to config) `sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000`. This is only if using one server/domain on this host and want to be able to access it without typing in a port number at the end of the url - i.e. 'http://mydomain.com' instead of 'http://mydomain.com:3000'
			- see more details: http://stackoverflow.com/questions/7929563/node-js-express-app-wont-start-listening-on-port-80
		2. create 'node' user for using with things like 'forever' (since it's user specific so whatever user started it is the only one who can stop it..)
			- use `su node` to switch to node users
6. Install MongoDB - NOTE: maybe want to use hosted service (i.e. MongoLab or MongoHQ) to save on diskspace - see below
	- (NOTE: use a 64 bit build since the 32 bit builds of mongo/ubuntu have a 2GB memory limit! http://www.mongodb.org/downloads#32-bit-limit )
	- http://docs.mongodb.org/manual/tutorial/install-mongodb-on-debian-or-ubuntu-linux/ (have to go through some setup steps before can run the standard apt-get install command..)
		- Use "touch" to create a new file
		
## Note on file sizes / server space (may want to use MongoLab or MongoHQ or another hosted/cloud MongoDB solution since MongoDB can easily take up 6GB - journal of 3ish GB (apparently it doesn't go past this though?) plus the data itself plus log files plus some other stuff).
- MongoDB and node forever took up space; here's one of my servers that maxed out with 20GB - forever though was mostly log files and while `forever cleanlogs` didn't seem to work, I was able to just delete the file(s) that were large:
- / 18G
	- /var 11G
		- /lib 6.4G
			- /mongodb 6.1G
				- /journal 3.1G
		- /log 1.2G
			- /mongodb 1.2G
		- /www 2.4G
	- /home 5.1G
		- /luke 2.0G
			- /.forever 1.3G
		- /node 2.3G
			- /.forever 2.3G
	- /usr 2.1G
- after I cleared the forever and mongodb logs though I got it down to 14GB, so that was good.


## Getting files on server
1. setup git config on server for your user
	- git config --global user.name "<your name>"
	- git config --global user.email "<your email>"
	- git config --global --add color.ui true
2. make `git` directory & initialize bare repo
	- `sudo mkdir /var/git`
	- `sudo mkdir -p /var/git/project.git`
	- `sudo git init --bare /var/git/project.git`
	- set group permissions
		- `sudo chgrp -R developers /var/git/project.git`
		- `sudo chmod -R g+swX /var/git/project.git`
3. clone the local repo
	- `git clone /var/git/project.git /var/www`
4. [from local computer (where existing files are) - open a NEW terminal/command window and `cd` to the local copy of the website on your computer] add a remote (from local machine) to the server repo then push to it
	- `git remote add prod ssh://lmadera@111.111.111.111/var/git/project.git`
	- `git push prod master`
5. [back on server] set permissions for /var/www folder then pull from local repo we just pushed to
	- `sudo chown -R ubuntu:developers /var/www` - NOTE: this assumes a 'ubuntu' user exists - if it doesn't try 'root' instead OR your username (i.e. `sudo chown -R root:developers /var/www`)
	- `sudo chmod -R g+w /var/www`
	- `cd /var/www`
	- `git pull origin master`
6. setup site as normal (see main README for steps - set config, npm install -g, grunt, etc.).
7. start server and keep it running with forever. NOTE: if did NOT create a node user, user your current user. ALSO: if using Continuous Integration (recommended), it should handle starting and stopping forever so you can skip this step.
	- `su node` (password n0de)
	- `cd /var/www`
	- `sudo forever start -w run.js`


## AWS (Amazon Web Services) setup
1. create new (EC2) instance
	- Ubuntu (most recent - 12.04, 64bit)
2. Create or use existing keypair. SSH public key will be generated and private key (as .pem file) will be available for download. We'll use this for SSH access later.
3. Create or use existing security group
	1. open ports
		- 22 for SSH
		- 80 for HTTP
		- any other needed ports: 3000-3100 for node and socket
4. Create elastic IP and associate with instance
5. Use keypair (.pem file) to setup public key authentication to be able to SSH into the instance.
	-  For Ubuntu, the "username" is "ubuntu" (other forums say "root" or "ec2-user" but those don't work for Ubuntu at least)
	- WINDOWS
		- navigate to ~/.ssh folder and create a new file (i.e. id_rsa.[project_name]) and paste the private key info downloaded from AWS (the .pem file contents) into it
		- open the "config" file in the ~/.ssh folder (or create it if it doesn't exist) and then add lines:
			Host *[elastic ip address]*
				IdentityFile ~/.ssh/id_rsa.[project_name]
		- Connect (via git bash - cygwin doesn't seem to work)
			ssh ubuntu@[elastic ip address]
6. SSH in (i.e. ssh ubuntu@[elastic ip]) then set up Ubuntu as normal (see guide below)
7. set up additional (non-root) users
	- public key authentication (recommended way over password authentication)
		http://utkarshsengar.com/2011/01/manage-multiple-accounts-on-1-amazon-ec2-instance/
8. SES (email)
	1. need an access key id & secret)
		- http://aws.amazon.com/iam/
	2. may need to synchronize system clock with amazon clock (UTC) if it doesn't work
		- sudo /usr/sbin/ntpdate 0.north-america.pool.ntp.org 1.north-america.pool.ntp.org 2.north-america.pool.ntp.org 3.north-america.pool.ntp.org
		- http://www.mindgeek.net/amazon-ws/amazon-ses-request-expired-it-must-be-within-300secsof-server-time/
	3. need to request "production access" and add verified "from" email addresses. In sandbox mode, need to also verify "to" email addresses.