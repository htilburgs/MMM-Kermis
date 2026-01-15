const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory database (voor demo)
let kermissen = [];
let nextId = 1;

// GET all kermissen
app.get("/api/kermis", (req, res) => {
    res.json(kermissen);
});

// GET kermis by ID
app.get("/api/kermis/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const kermis = kermissen.find(k => k.id === id);
    if (!kermis) return res.status(404).json({ error: "Niet gevonden" });
    res.json(kermis);
});

// POST new kermis
app.post("/api/kermis", (req, res) => {
    const { locatie, van, tot, formaat } = req.body;
    if (!locatie || !van || !tot || !formaat) return res.status(400).json({ error: "Ontbrekende velden" });

    const newKermis = {
        id: nextId++,
        locatie,
        van,
        tot,
        formaat,
        voltooid: false
    };
    kermissen.push(newKermis);
    res.status(201).json(newKermis);
});

// PUT update kermis
app.put("/api/kermis/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const kermis = kermissen.find(k => k.id === id);
    if (!kermis) return res.status(404).json({ error: "Niet gevonden" });

    // Update velden
    const { locatie, van, tot, formaat, voltooid } = req.body;
    if (locatie !== undefined) kermis.locatie = locatie;
    if (van !== undefined) kermis.van = van;
    if (tot !== undefined) kermis.tot = tot;
    if (formaat !== undefined) kermis.formaat = formaat;
    if (voltooid !== undefined) kermis.voltooid = voltooid;

    res.json(kermis);
});

// DELETE kermis
app.delete("/api/kermis/:id", (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = kermissen.findIndex(k => k.id === id);
    if (index === -1) return res.status(404).json({ error: "Niet gevonden" });
    kermissen.splice(index, 1);
    res.status(204).send();
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server draait op http://localhost:${PORT}`);
});
