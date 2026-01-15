let editId = null; // Huidige wijziging

// Formatteer datum voor weergave dd-mm-yyyy
function formatDate(dateString) {
    const d = new Date(dateString);
    const dag = String(d.getDate()).padStart(2, '0');
    const maand = String(d.getMonth() + 1).padStart(2, '0');
    const jaar = d.getFullYear();
    return `${dag}-${maand}-${jaar}`;
}

// Load en render de lijst
async function load() {
    const res = await fetch("/api/kermis");
    let data = await res.json();

    // Sorteer op dropdown
    const sortOpt = document.getElementById("sorteer").value;
    if (sortOpt === "van") data.sort((a, b) => new Date(a.van) - new Date(b.van));
    else if (sortOpt === "tot") data.sort((a, b) => new Date(a.tot) - new Date(b.tot));
    else if (sortOpt === "locatie") data.sort((a, b) => a.locatie.localeCompare(b.locatie));

    const lijst = document.getElementById("lijst");
    lijst.innerHTML = data.map(k => {
        let kleur = "", icoon = "";
        if (k.formaat === "klein") { kleur = "#4caf50"; icoon = "🎪"; }
        else if (k.formaat === "middel") { kleur = "#ff9800"; icoon = "🎠"; }
        else if (k.formaat === "groot") { kleur = "#f44336"; icoon = "🎡"; }

        const checked = k.voltooid ? "checked" : "";

        return `
            <div class="kermis-kaart" style="border-left:6px solid ${kleur}" data-id="${k.id}">
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
        if (cb.checked) kaartInfo.classList.add("voltooid");

        cb.addEventListener("change", async e => {
            const id = cb.closest(".kermis-kaart").dataset.id;
            const voltooid = cb.checked;
            await fetch(`/api/kermis/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ voltooid })
            });
            if (voltooid) kaartInfo.classList.add("voltooid");
            else kaartInfo.classList.remove("voltooid");
        });
    });

    // Verwijder knop
    document.querySelectorAll(".buttons .verwijder").forEach(btn => {
        btn.addEventListener("click", async e => {
            const id = btn.closest(".kermis-kaart").dataset.id;
            await fetch(`/api/kermis/${id}`, { method: "DELETE" });
            load();
        });
    });

    // Wijzig knop
    document.querySelectorAll(".buttons .wijzig").forEach(btn => {
        btn.addEventListener("click", async e => {
            const id = btn.closest(".kermis-kaart").dataset.id;
            const res = await fetch(`/api/kermis/${id}`);
            if (!res.ok) { alert("Kon kermis niet ophalen!"); return; }
            const k = await res.json();

            const form = document.getElementById("form");
            form.locatie.value = k.locatie;
            form.van.value = k.van;
            form.tot.value = k.tot;
            form.formaat.value = k.formaat;

            editId = id;
            form.querySelector("button[type='submit']").textContent = "Bijwerken";
        });
    });
}

// Formulier submit
document.getElementById("form").onsubmit = async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));

    if (editId) {
        // Update bestaande kermis
        await fetch(`/api/kermis/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        editId = null;
        e.target.querySelector("button[type='submit']").textContent = "Opslaan";
    } else {
        // Nieuwe kermis toevoegen
        await fetch("/api/kermis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
    }

    e.target.reset();
    load();
};

// Sorteer dropdown change
document.getElementById("sorteer").addEventListener("change", load);

// Initial load
load();
