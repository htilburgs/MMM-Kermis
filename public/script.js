async function load() {
    const res = await fetch("/api/kermis");
    const data = await res.json();
    const lijst = document.getElementById("lijst");

    lijst.innerHTML = data.map(i => {
        // Kleur en icoon per formaat
        let kleur = "", icoon = "";
        if(i.formaat === "klein") { kleur = "#4caf50"; icoon = "🎪"; }
        else if(i.formaat === "middel") { kleur = "#ff9800"; icoon = "🎠"; }
        else if(i.formaat === "groot") { kleur = "#f44336"; icoon = "🎡"; }

        const checked = i.voltooid ? "checked" : "";

        return `
            <div class="kermis-kaart" style="border-left:6px solid ${kleur}">
                <div class="kaart-tekst">
                    <input type="checkbox" class="voltooid-checkbox" data-id="${i.id}" ${checked}>
                    <span class="kaart-icoon">${icoon}</span>
                    <div class="kaart-info">
                        <strong>${i.locatie}</strong> (${i.formaat}) — ${i.van} t/m ${i.tot}
                    </div>
                </div>
                <div class="buttons">
                    <button onclick="verwijder(${i.id})" class="verwijder">Verwijder</button>
                </div>
            </div>
        `;
    }).join("");

    // Event listener voor checkboxes
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

document.getElementById("form").onsubmit = async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    await fetch("/api/kermis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    });
    e.target.reset();
    load();
};

async function verwijder(id) {
    await fetch(`/api/kermis/${id}`, { method: "DELETE" });
    load();
}

// Initial load
load();
