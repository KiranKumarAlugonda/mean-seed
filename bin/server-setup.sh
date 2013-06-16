#!/bin/bash

##################################################
# The purpose of this script is to set up and configure
# a fresh server instance running Ubuntu 12.04 64bit
# which will run our application
#

##################################################
# Update system
##################################################
sudo apt-get update
sudo apt-get upgrade -y


##################################################
# Node setup
##################################################
sudo apt-get install nodejs

# create user to run node processes
# NOTE: you will be prompted to enter user details and password
sudo adduser node

##################################################
# MongoDB setup
##################################################
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
echo "deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen" | sudo tee /etc/apt/sources.list.d/10gen.list
sudo apt-get update
sudo apt-get -y install mongodb-10gen

# TODO: provide mongodb.conf file with preconfigured setup
# sudo cp mongodb.conf /etc/mongodb.conf


##################################################
# Git setup and initial project cloning
##################################################
sudo apt-get -y install git-core

# ensure project parent directory exists
sudo mkdir -p /var/www

# clone project from github
# @todo


##################################################
# Configure node app under Upstart
##################################################

# TODO


##################################################
# monit setup (system monitor)
##################################################

# TODO: enable?

# install monit package and copy config file
#sudo apt-get install monit
#sudo cp monitrc /etc/monit/monitrc


##################################################
# nginx server setup
##################################################

# TODO


##################################################
# fail2bain setup for firewall
##################################################

# TODO: enable?

#sudo apt-get -y install fail2ban
## TODO: provide copy of jail.local
#sudo cp jail.local /etc/fail2ban/jail.local
#
#sudo service fail2ban restart
#
## add directive to reboot server on out-of-memory condition
#echo "
#vm.panic_on_oom=1
#kernel.panic=10
#" | sudo tee /etc/sysctl.conf
#
## add firewall rules
## TODO: provide copy of iptables.firewall.rules
#sudo cp iptables.firewall.rules /etc/iptables.firewall.rules
#
## activate firewall rules
#sudo iptables-restore < /etc/iptables.firewall.rules
#
## activate firewall rules on restart
#echo "
##!/bin/sh
#/sbin/iptables-restore < /etc/iptables.firewall.rules
#" | sudo tee /etc/network/if-pre-up.d/firewall
#
#sudo chmod +x /etc/network/if-pre-up.d/firewall


##################################################
# Unattended upgrades setup
##################################################

# TODO: enable?

#sudo apt-get install unattended-upgrades
#
## update unattended upgrades config
#echo '
#APT::Periodic::Update-Package-Lists "1";
#APT::Periodic::Download-Upgradeable-Packages "1";
#APT::Periodic::AutocleanInterval "7";
#APT::Periodic::Unattended-Upgrade "1";
#' | sudo tee /etc/apt/apt.conf.d/10periodic

