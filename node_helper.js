const NodeHelper = require("node_helper");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

module.exports = NodeHelper.create({
    start() {
        this.dataFile = `${__dirname}/kermisdata.json`;
        this.app = express();

        // Middleware
        this.app.use(bodyParser.json());
        this.app.use(express.static(path.join(__dirname, "public"))); // script.js en admin.css

        this.loadData();

        // API endpoints
        this.app.get("/api/kermis", (req, res) => res.json(this.data));
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

        // admin.html serveren
        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, "public/admin.html"));
        });

        // HTTP server aanmaken en gebruiken voor WebSocket
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });

        // WebSocket verbindingen
        this.wss.on("connection", ws => {
            console.log("Nieuwe WebSocket verbinding");
            ws.send(JSON.stringify({ type: "KERMIS_DATA", data: this.data }));
        });

        // Server starten op alle netwerkinterfaces
        this.server.listen(3001, () => {
            console.log("Webinterface MMM-Kermis runs on port 3001");
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

        // Live update via WebSocket naar alle clients
        if (this.wss) {
            this.wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: "KERMIS_DATA", data: this.data }));
                }
            });
        }
    },

    socketNotificationReceived(notification) {
        if (notification === "GET_KERMIS_DATA") {
            this.sendSocketNotification("KERMIS_DATA", this.data);
        }
    }
});
