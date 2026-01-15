let editId = null;

// Datum formatteren naar dd-mm-yyyy
function formatDate(dateString) {
    const date = new Date(dateString);
    const dag = String(date.getDate()).padStart(2, '0');
    const maand = String(date.getMonth() + 1).padStart(2, '0');
    const jaar = date.getFullYear();
    return `${dag}-${maand}-${jaar}`;
}

// Lijst renderen
async function load() {
    const res = await fetch("/api/kermis");
    const data = await res.json();
    const lijst = document.getElementById("lijst");
    lijst.innerHTML = "";

    data.forEach(k => {
        let kleur = "", icoon = "";
        if(k.formaat === "klein") { kleur = "#4caf50"; icoon = "🎪"; }
        else if(k.formaat === "middel") { kleur = "#ff9800"; icoon = "🎠"; }
        else if(k.formaat === "groot") { kleur = "#f44336"; icoon = "🎡"; }

        const kaart = document.createElement("div");
        kaart.className = "kermis-kaart";
        kaart.dataset.id = k.id;
        kaart.style.borderLeft = `6px solid ${kleur}`;
        kaart.innerHTML = `
            <div class="kaart-tekst">
                <input type="checkbox" class="voltooid-checkbox" ${k.voltooid ? "checked" : ""}>
                <span class="kaart-icoon">${icoon}</span>
                <div class="kaart-info">
                    <strong>${k.locatie}</strong> (${k.formaat}) — ${formatDate(k.van)} t/m ${formatDate(k.tot)}
                </div>
            </div>
            <div class="buttons">
                <button class="wijzig">Wijzig</button>
                <button class="verwijder">Verwijder</button>
            </div>
        `;
        lijst.appendChild(kaart);
    });
}

// Event delegation
document.getElementById("lijst").addEventListener("click", async e => {
    const kaart = e.target.closest(".kermis-kaart");
    if (!kaart) return;
    const id = kaart.dataset.id;

    // Checkbox voltooid
    if (e.target.classList.contains("voltooid-checkbox")) {
        const voltooid = e.target.checked;
        const kaartInfo = kaart.querySelector(".kaart-info");
        await fetch(`/api/kermis/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ voltooid })
        });
        if (voltooid) kaartInfo.classList.add("voltooid");
        else kaartInfo.classList.remove("voltooid");
    }

    // Wijzig knop
    if (e.target.classList.contains("wijzig")) {
        const res = await fetch(`/api/kermis/${id}`);
        if (!res.ok) { alert("Kon kermis niet ophalen!"); return; }
        const kermis = await res.json();
        const form = document.getElementById("form");
        form.locatie.value = kermis.locatie;
        form.van.value = kermis.van;
        form.tot.value = kermis.tot;
        form.formaat.value = kermis.formaat;
        editId = id;
        form.querySelector("button[type='submit']").textContent = "Bijwerken";
    }

    // Verwijder knop
    if (e.target.classList.contains("verwijder")) {
        await fetch(`/api/kermis/${id}`, { method: "DELETE" });
        load();
    }
});

// Formulier submit: opslaan of bijwerken
document.getElementById("form").onsubmit = async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const form = e.target;

    if (editId) {
        await fetch(`/api/kermis/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        editId = null;
    } else {
        await fetch("/api/kermis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
    }

    form.reset();
    form.querySelector("button[type='submit']").textContent = "Opslaan";
    load();
};

// Initial load
load();
