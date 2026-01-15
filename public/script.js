let editId = null; // Houd bij welke kermis wordt gewijzigd

// Globale functies zodat onclick werkt
window.wijzig = async function(id) {
    const res = await fetch(`/api/kermis/${id}`);
    const kermis = await res.json();

    const form = document.getElementById("form");
    form.locatie.value = kermis.locatie;
    form.van.value = kermis.van;
    form.tot.value = kermis.tot;
    form.formaat.value = kermis.formaat;

    editId = id;
    form.querySelector("button[type='submit']").textContent = "Bijwerken";
};

window.verwijder = async function(id) {
    await fetch(`/api/kermis/${id}`, { method: "DELETE" });
    load();
};

// Helper: datum formatteren naar dd-mm-yyyy
function formatDate(dateString) {
    const date = new Date(dateString);
    const dag = String(date.getDate()).padStart(2, '0');
    const maand = String(date.getMonth() + 1).padStart(2, '0');
    const jaar = date.getFullYear();
    return `${dag}-${maand}-${jaar}`;
}

// Load kermissen en bouw de lijst
async function load() {
    const res = await fetch("/api/kermis");
    const data = await res.json();
    const lijst = document.getElementById("lijst");

    lijst.innerHTML = data.map(k => {
        let kleur = "", icoon = "";
        if(k.formaat === "klein") { kleur = "#4caf50"; icoon = "🎪"; }
        else if(k.formaat === "middel") { kleur = "#ff9800"; icoon = "🎠"; }
        else if(k.formaat === "groot") { kleur = "#f44336"; icoon = "🎡"; }

        const checked = k.voltooid ? "checked" : "";

        return `
            <div class="kermis-kaart" style="border-left:6px solid ${kleur}">
                <div class="kaart-tekst">
                    <input type="checkbox" class="voltooid-checkbox" data-id="${k.id}" ${checked}>
                    <span class="kaart-icoon">${icoon}</span>
                    <div class="kaart-info">
                        <strong>${k.locatie}</strong> (${k.formaat}) — ${formatDate(k.van)} t/m ${formatDate(k.tot)}
                    </div>
                </div>
                <div class="buttons">
                    <button onclick="wijzig(${k.id})" class="wijzig">Wijzig</button>
                    <button onclick="verwijder(${k.id})" class="verwijder">Verwijder</button>
                </div>
            </div>
        `;
    }).join("");

    // Event listener voor checkbox voltooid
    document.querySelectorAll(".voltooid-checkbox").forEach(cb => {
        const kaartInfo = cb.closest(".kaart-tekst").querySelector(".kaart-info");
        if(cb.checked) kaartInfo.classList.add("voltooid");

        cb.addEventListener("change", async e => {
            const id = e.target.dataset.id;
            const voltooid = e.target.checked;
            await fetch(`/api/kermis/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ voltooid })
            });
            if(voltooid) kaartInfo.classList.add("voltooid");
            else kaartInfo.classList.remove("voltooid");
        });
    });
}

// Formulier submit: opslaan of bijwerken
document.getElementById("form").onsubmit = async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const form = e.target;

    if(editId) {
        // Update bestaande kermis
        await fetch(`/api/kermis/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        editId = null;
    } else {
        // Nieuwe kermis toevoegen
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
