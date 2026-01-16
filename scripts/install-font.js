const { exec } = require("child_process");
const os = require("os");

const platform = os.platform();

if (platform === "linux") {
  console.log("Controleer of fonts-noto-color-emoji is geïnstalleerd...");

  exec("dpkg -s fonts-noto-color-emoji", (err, stdout, stderr) => {
    if (err) {
      console.log("fonts-noto-color-emoji niet gevonden, installeren...");
      exec("sudo apt-get update && sudo apt-get install -y fonts-noto-color-emoji", (err, stdout, stderr) => {
        if (err) {
          console.error("Kon fonts-noto-color-emoji niet installeren. Probeer handmatig.", err);
        } else {
          console.log("fonts-noto-color-emoji succesvol geïnstalleerd!");
        }
      });
    } else {
      console.log("fonts-noto-color-emoji is al geïnstalleerd.");
    }
  });
} else {
  console.log("Automatische installatie van emoji fonts wordt alleen ondersteund op Linux.");
}
