# MMM-Kermis
This a module for [Magic Mirror²](https://github.com/MichMich/MagicMirror). </br>
This displays the Carnivals (Kermis), you can add, update and delete through a webinterface. </br>
This module is only available in Dutch.

<img width="397" height="362" alt="image" src="https://github.com/user-attachments/assets/2da77f3e-68e4-4f88-ad0c-5a520aefa367" />
<img width="837" height="684" alt="image" src="https://github.com/user-attachments/assets/bb315eb8-2015-4ef3-8e73-11ac1387026b" />


## Installation
Clone this repository in your modules folder, and install dependencies:

```
cd ~/MagicMirror/modules 
git clone https://github.com/htilburgs/MMM-Kermis.git
cd MMM-Kermis
npm install 
```
## Update
When you need to update this module:

```
cd ~/MagicMirror/modules/MMM-Kermis
git pull
npm install
```

## Configuration
Go to the MagicMirror/config directory and edit the config.js file.
Add the module to your modules array in your config.js.

```
{
  module: "MMM-Kermis",
  position: "top_left",
  header: "Mijn Kermissen",
  disabled: false,
  config: {
          refreshInterval: 60 * 1000 // 1 minuut
          }
},
```

## Load Webinterface for updating the Carnivals (Kermissen)
Open a browser and type ```http://serverip address:3001``` </br>
So if for example you're MagicMirror is on 192.168.0.48 then you go to ```http://192.168.0.48:3001``` </br>
The Webinterface for MMM-Kermis will be loaded and you will be able to:

<img width="22" height="22" alt="image" src="https://github.com/user-attachments/assets/15a6e857-90fe-43d0-bc5a-22231cea98bd" />
add Kermis</br>
<img width="22" height="22" alt="image" src="https://github.com/user-attachments/assets/15a6e857-90fe-43d0-bc5a-22231cea98bd" />
complete Kermis</br>
<img width="22" height="22" alt="image" src="https://github.com/user-attachments/assets/15a6e857-90fe-43d0-bc5a-22231cea98bd" />
delete Kermis</br>
<img width="22" height="22" alt="image" src="https://github.com/user-attachments/assets/15a6e857-90fe-43d0-bc5a-22231cea98bd" />
edit Kermis</br>
<img width="22" height="22" alt="image" src="https://github.com/user-attachments/assets/15a6e857-90fe-43d0-bc5a-22231cea98bd" />
sort Kermis information</br>

</br>
All the updates are instantly published on your Mirror

## Versions
v1.0.0  - Initial release </br>
v1.1.0  - Update for Chromium, install fonts-noto-color-emoji 
