#!/bin/sh

# create the folder /data and change in it
# this repo contains the app folder in /data = /data/app
# with this setup, the pi user and the sudo user have the same
# secure path variable and access right.
# that makes many many things simple.

sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get dist-upgrade -y
sudo apt-get install npm motion -y

sudo cp /data/app/script/config/sudoers /etc/sudoers
sudo cp /data/app/script/config/.bashrc /home/pi/.bashrc
sudo cp /data/app/script/config/keyboard /etc/default/keyboard
sudo cp /data/app/script/config/motion.conf /etc/motion/motion.conf

. /home/pi/.bashrc

sudo mkdir /data/npm-global
sudo mkdir /data/motion
npm config set prefix /data/npm-global
npm install npm@latest -g

sudo chown -R pi:pi /data
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
sudo chown -R $(whoami) /usr/local/

npm install n -g
n latest
n 6.11.0

cd /data/app
npm install

motion start && npm start
