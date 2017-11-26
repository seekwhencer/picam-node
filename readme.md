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
      sudo git clone https://github.com/seekwhencer/picam-node.git app
      cd app
      sudo sh /data/app/script/install.sh
      
After the installation should be a reboot useful.
Hit ***`` CTRL + Alt + Del ``*** ... on the pi - or enter: `sudo shutdown now`
    
The installation copies all the needed config files in the right place:
* pi users `.bashrc` file
* german default `keyboard` scheme
* `sudoers` file with the pi user as sudo and extended secure path pointed to the npm global folder for all users (sudo, pi)
* `motion.config` file configured with reachable stream and "UI" over the local network on port 8080 and 8081
      
### Run it

    cd /data/app
    motion start &
    npm start

### Events

#### app

* movement_start, `[]`
* movement_stop, `[]`

#### blink

* setup_complete, `[]`
* setup_pin_error, `[err, pin, initial]`
* setup_pin_before, `[pin, initial]`
* setup_pin_complete, `[pin, initial]`

