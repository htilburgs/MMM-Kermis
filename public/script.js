let editId = null;

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
            <div class="kermis-kaart" data-id="${k.id}" style="border-left:6px solid ${kleur}">
                <div class="kaart-tekst">
                    <input type="checkbox" class="voltooid-checkbox" ${checked}>
                    <span class="kaart-icoon">${icoon}</span>
                    <div class="kaart-info">
                        <strong>${k.locatie}</strong> (${k.formaat}) — ${formatDate(k.van)} t/m ${formatDate(k.tot)}
                    </div>
                </div>
                <div class="buttons">
                    <button class="wijzig">Wijzig</button>
                    <button class="verwijder">Verwijder</button>
                </div>
            </div>
        `;
    }).join("");

    // Checkbox voltooid
    document.querySelectorAll(".voltooid-checkbox").forEach(cb => {
        const kaartInfo = cb.closest(".kaart-tekst").querySelector(".kaart-info");
        if(cb.checked) kaartInfo.classList.add("voltooid");

        cb.addEventListener("change", async e => {
            const kaart = e.target.closest(".kermis-kaart");
            const id = kaart.dataset.id;
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

    // Wijzig-knoppen
    document.querySelectorAll(".buttons .wijzig").forEach(btn => {
        btn.addEventListener("click", async e => {
            const kaart = e.target.closest(".kermis-kaart");
            const id = kaart.dataset.id;
            const res = await fetch(`/api/kermis/${id}`);
            const kermis = await res.json();

            const form = document.getElementById("form");
            form.locatie.value = kermis.locatie;
            form.van.value = kermis.van;
            form.tot.value = kermis.tot;
            form.formaat.value = kermis.formaat;

            editId = id;
            form.querySelector("button[type='submit']").textContent = "Bijwerken";
        });
    });

    // Verwijder-knoppen
    document.querySelectorAll(".buttons .verwijder").forEach(btn => {
        btn.addEventListener("click", async e => {
            const kaart = e.target.closest(".kermis-kaart");
            const id = kaart.dataset.id;
            await fetch(`/api/kermis/${id}`, { method: "DELETE" });
            load();
        });
    });
}

// Formulier submit: opslaan of bijwerken
document.getElementById("form").onsubmit = async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    const form = e.target;

    if(editId) {
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
