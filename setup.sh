#!/bin/bash

REPO="/var/www/git/project.git"
REPO_GROUP="developers"

NODE_VER="v0.8.9"

# NOTE: didn't use variables below in case commands need to be run manually

##################################################
# Git Setup
##################################################

# configure user's git settings, eg:
# > git config --global user.name "Your Name"
# > git config --global user.email youremail@gmail.com
git config --global user.name "<your name>"
git config --global user.email "<your email>"
# add some color to the command line
git config --global --add color.ui true

# set diff tool (optional)
# usage: git difftool filename
# > git config --global --add diff.tool meld

# initialize bare repo
sudo mkdir -p /var/www/git/project.git
sudo git init --bare /var/www/git/project.git

# set group permissions
sudo chgrp -R developers /var/www/git/project.git
sudo chmod -R g+swX /var/www/git/project.git

# clone local repo
git clone /var/www/git/project.git project


# install global packages
sudo npm install -g grunt