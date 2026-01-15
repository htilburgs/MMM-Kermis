const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database
let kermissen = [];
let nextId = 1;

// Serve admin.html en statische bestanden (script.js, admin.css)
app.use(express.static(path.join(__dirname, "public"))); // alles in map "public"

// Routes API
app.get("/api/kermis", (req, res) => res.json(kermissen));

app.get("/api/kermis/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const k = kermissen.find(k => k.id === id);
    if (!k) return res.status(404).json({ error: "Niet gevonden" });
    res.json(k);
});

app.post("/api/kermis", (req, res) => {
    const { locatie, van, tot, formaat } = req.body;
    const newKermis = { id: nextId++, locatie, van, tot, formaat, voltooid: false };
    kermissen.push(newKermis);
    res.status(201).json(newKermis);
});

app.put("/api/kermis/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const k = kermissen.find(k => k.id === id);
    if (!k) return res.status(404).json({ error: "Niet gevonden" });

    const { locatie, van, tot, formaat, voltooid } = req.body;
    if (locatie !== undefined) k.locatie = locatie;
    if (van !== undefined) k.van = van;
    if (tot !== undefined) k.tot = tot;
    if (formaat !== undefined) k.formaat = formaat;
    if (voltooid !== undefined) k.voltooid = voltooid;

    res.json(k);
});

app.delete("/api/kermis/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    kermissen = kermissen.filter(k => k.id !== id);
    res.status(204).send();
});

// Default route: serveer admin.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/admin.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
});
