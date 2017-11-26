# pi cam detector with motion and node

This is node.js app works with motion on a raspberry pi 3.

* Watching the file system if motion writes an images file
* Detect when the movement starts and ends
* Triggering events on the GPIOs - toggle high / low

### Setup

* download a Jessie image
* write it on sd
* start the first time in pixel deskop
* change:
    * boot to cli
    * password
    * disable auto-login
    * hostname
    * activate ssh
    * language settings, keyboard, wifi
* reboot into the command line
* login in with given password as user `pi`

### Continue in the console

* Installing all stuff
 
      sudo mkdir /data
      cd /data
      sudo git pull ... app
      cd app
      sudo sh /data/app/script/install.sh
      
After the installation should be a reboot useful.
Hit ***`` CTRL + Alt + Del ``***
      
### Run it

    cd /data/app
    motion start &
    npm start


