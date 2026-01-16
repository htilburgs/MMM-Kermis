const NodeHelper = require("node_helper");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

module.exports = NodeHelper.create({

    start() {
        this.dataFile = path.join(__dirname, "kermisdata.json");
        this.app = express();

        this.app.use(bodyParser.json());
        this.app.use(express.static(path.join(__dirname, "public")));

        this.loadData();
        this.autoMarkVoltooid();

        this.setupApi();
        this.setupWebSocket();

        this.server.listen(3001, () => {
            console.log("MMM-Kermis admin beschikbaar op poort 3001");
        });
    },

    setupApi() {
        this.app.get("/api/kermis", (req, res) => res.json(this.data));

        this.app.get("/api/kermis/:id", (req, res) => {
            const item = this.data.find(i => i.id == req.params.id);
            if (!item) return res.status(404).json({ error: "Niet gevonden" });
            res.json(item);
        });

        this.app.post("/api/kermis", (req, res) => {
            this.data.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
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

        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "public/admin.html"));
        });
    },

    setupWebSocket() {
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });

        this.wss.on("connection", ws => {
            ws.send(JSON.stringify({ type: "KERMIS_DATA", data: this.data }));
        });
    },

    loadData() {
        this.data = fs.existsSync(this.dataFile)
            ? JSON.parse(fs.readFileSync(this.dataFile))
            : [];
    },

    saveData() {
        fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
        this.sendSocketNotification("KERMIS_DATA", this.data);

        if (this.wss) {
            this.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "KERMIS_DATA", data: this.data }));
                }
            });
        }
    },

    autoMarkVoltooid() {
        const vandaag = new Date();
        vandaag.setHours(0, 0, 0, 0);

        let gewijzigd = false;

        this.data.forEach(item => {
            if (item.voltooid) return;

            const eind = new Date(item.tot);
            eind.setHours(23, 59, 59, 999);

            if (eind < vandaag) {
                item.voltooid = true;
                gewijzigd = true;
            }
        });

        if (gewijzigd) {
            this.saveData();
        }
    },

    socketNotificationReceived(notification) {
        if (notification === "GET_KERMIS_DATA") {
            this.autoMarkVoltooid();
            this.sendSocketNotification("KERMIS_DATA", this.data);
        }
    }
});
