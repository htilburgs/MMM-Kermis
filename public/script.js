let editId = null; // Houdt bij welke kermis wordt aangepast

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

    // Event listeners na het genereren
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
            if (!res.ok) {
                alert("Kon kermis niet ophalen!");
                return;
            }
            const k = await res.json();

            // Vul formulier
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

// Initial load
load();
