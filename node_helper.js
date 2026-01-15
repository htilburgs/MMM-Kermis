const NodeHelper = require("node_helper");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

module.exports = NodeHelper.create({
    start() {
        this.dataFile = `${__dirname}/kermisdata.json`;
        this.app = express();

        this.app.use(bodyParser.json());
        this.app.use(express.static(`${__dirname}/public`));

        this.loadData();

        this.app.get("/api/kermis", (req, res) => {
            res.json(this.data);
        });

        this.app.post("/api/kermis", (req, res) => {
            this.data.push({
                id: Date.now(),
                ...req.body,
                voltooid: false
            });
            this.saveData();
            res.sendStatus(200);
        });

        this.app.put("/api/kermis/:id", (req, res) => {
            const index = this.data.findIndex(i => i.id == req.params.id);
            this.data[index] = { ...this.data[index], ...req.body };
            this.saveData();
            res.sendStatus(200);
        });

        this.app.delete("/api/kermis/:id", (req, res) => {
            this.data = this.data.filter(i => i.id != req.params.id);
            this.saveData();
            res.sendStatus(200);
        });

        this.app.listen(3001);
    },

    loadData() {
        if (fs.existsSync(this.dataFile)) {
            this.data = JSON.parse(fs.readFileSync(this.dataFile));
        } else {
            this.data = [];
        }
    },

    saveData() {
        fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
        this.sendSocketNotification("KERMIS_DATA", this.data);
    },

    socketNotificationReceived(notification) {
        if (notification === "GET_KERMIS_DATA") {
            this.sendSocketNotification("KERMIS_DATA", this.data);
        }
    }
});
