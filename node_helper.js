const NodeHelper = require("node_helper");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start() {
        this.dataFile = `${__dirname}/kermisdata.json`;
        this.app = express();

        // Middleware
        this.app.use(bodyParser.json());
        this.app.use(express.static(path.join(__dirname, "public"))); // script.js en admin.css

        this.loadData();

        // API endpoints
        this.app.get("/api/kermis", (req, res) => {
            res.json(this.data);
        });

        this.app.get("/api/kermis/:id", (req, res) => {
            const id = parseInt(req.params.id, 10);
            const item = this.data.find(i => i.id === id);
            if (!item) return res.status(404).json({ error: "Niet gevonden" });
            res.json(item);
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
            if (index === -1) return res.status(404).json({ error: "Niet gevonden" });
            this.data[index] = { ...this.data[index], ...req.body };
            this.saveData();
            res.sendStatus(200);
        });

        this.app.delete("/api/kermis/:id", (req, res) => {
            this.data = this.data.filter(i => i.id != req.params.id);
            this.saveData();
            res.sendStatus(200);
        });

        // **Serve admin.html automatisch op /** 
        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "public/admin.html"));
        });

        // Start server op poort 3001
        this.app.listen(3001, () => {
            console.log("MMM-Kermis server draait op http://localhost:3001");
        });
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
