# Smart Mirror

This is the web front end for my smart mirror that I built. It displays information such as time to work with traffic, top news stories and the weather forecast.

![Menu](/img/mirror.JPG)


## Create your own Smart Mirror
### Equipment
+ Raspberry Pi
+ Computer monitor
+ Two-way mirror

## Monitor Setup
Diassemble the frame for your computer monitor and hook it up to your Raspberry Pi. Then place the two way mirror on top of your monitor. I used a lightweight acryllic two way mirror and taped it to the monitor. Mount the monitor on to the wall using a wall mount.

## Raspberry Pi Setup
The setup for the Raspberry Pi is heavily inspired from [here](https://github.com/elalemanyo/raspberry-pi-kiosk-screen)

1. Install Raspbian Debian Wheezy and download this repository somewhere to your Pi

2. Setup configuration using `sudo raspi-config`
  + Update the Raspi config tool (Advanced Options)
  + Enable SSH
  + Disable overscan (Advanced Options)
  + Memory Split (Advanced Options)

3. Connect to your Raspberry Pi using SSH or use terminal and run the following
  ```
  sudo apt-get update
  sudo apt-get upgrade
  ```

4. Install Firefox (Iceweasel), Gnash, x11 server utils, matchbox, xautomation and unclutter (hide the cursor from the screen)
  ```
  sudo apt-get install iceweasel gnash gnash-common browser-plugin-gnash x11-xserver-utils matchbox xautomation unclutter
  ```

5. Create the start-up script using
  ```
  nano /home/pi/fullscreen.sh
  ```
  You'll need to create a URL for your web browser to point to. The front-end retrieves your information from the URL. You'll need to know your latitude and longitude of where you'll setup the mirror and the latitude and longitude of your workplace if you want to  also add time to work. You can use Google Maps to look up the longitude and latitude of locations.

  You URL should look similar to this.

  file:///C:/PATH/TO/YOUR/FRONT/END/index.html?name=YOUR_NAME&lat=YOUR_LATITUDE&lng=YOUR_LONGITUDE&worklat=YOUR_WORK_LATITUDE&worklng=YOUR_WORK_LONGITUDE&update=true

  Your script should be as follows
  ```
  unclutter &
  matchbox-window-manager &
  iceweasel "YOUR URL" --display=:0 &
  sleep 15s;
  xte "key F11" -x:0
  ```
  Change the file mode using
  ```
  sudo chmod 755 /home/pi/fullscreen.sh
  ```

6. Edit the autostart file to invoke your script
  ```
  Edit the autostart file to run the script:
  ```
  The file should look like this
  ```
  @xset s off
  @xset -dpms
  @xset s noblank
  @/home/pi/fullscreen.sh
  ```

7. Auto StartX (Run LXDE)
  ```
  sudo nano /etc/rc.local
  ```
  Scroll to the bottom and add the folowing above exit 0:
  ```
  su -l pi -c startx
  ```

8. Start up Firefox (Iceweasel), go to settings and configure the following
  + Disable history
  + Disable start page

9. If your monitor rotated vertically like mine you'll need to do the following
  ```
  sudo nano /boot/config.txt
  ```
  Set the `display_rotate` property accordingly
  ```
  display_rotate=0 # Normal
  display_rotate=1 # 90 degrees
  display_rotate=2 # 180 degrees
  ```

10. Restart your Pi. It should automatically open up your the browser and load up the web frontend.
