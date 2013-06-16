#!/bin/bash

##################################################
# This script is response for:
# - Updating code from remote git repo
# - Ensuring project file permissions are set correctly
# - Running grunt build
# - Restarting process that runs the application
#

## PRIOR to running this script, make sure you've merged and pushed the "develop" to "master"
# git checkout master
# git merge develop
# git push [location] master

# navigate to working directory
cd /var/www/project

# change to `node` user (only node user has permissions to git pull and do other stuff)
su node

# stop forever (or upstart) or whatever is currently running the server - this is important since otherwise, if forever is watching file changes, then after pulling, it will go crazy in infinite restarts since new code BEFORE running grunt usually doesn't work
forever stopall

# pull latest master code and fetch tags
git pull origin master
# [we're currently using github so you'll have to enter your username and password credentials to authenticate the pull]
git fetch --tags

# ensure user 'node' owns all files (for permission compliance) - first have to change back out of node user with `exit` to get sudo privileges. Once done, go back to node with `su node`
exit
sudo chown -R node:node .
su node

# handle any config / package.json (breaking) changes - grunt default task should tell you this but generally, update config.json file(s) appropriately and run `npm install` BEFORE running grunt q below
# use `git log --follow -p [path/to/config.json]` to see git diff changes of the config file(s) through commits to see what changed and update your local config accordingly

# grunt build using quick task, "q"
grunt q --type=prod

# restart forever (or upstart or whichever process is running the app) if necessary
forever start run.js

