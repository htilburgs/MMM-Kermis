Module.register("MMM-Kermis", {
    defaults: {
        updateInterval: 60 * 1000, // 1 minuut
        fadeSpeed: 4000,
    },

    start() {
        Log.info("Starting module: " + this.name);
        this.kermissen = [];
        this.updateDom(0);
        this.getData();
        setInterval(() => this.getData(), this.config.updateInterval);
    },

    getStyles() {
        return ["MMM-Kermis.css"];
    },

    // Haal data op van backend
    getData() {
        fetch("/api/kermis")
            .then(res => res.json())
            .then(data => {
                const today = new Date();
                // Alleen niet-voltooide kermissen waarvan de einddatum >= vandaag
                this.kermissen = data.filter(k => !k.voltooid && new Date(k.tot) >= today);
                this.updateDom(this.config.fadeSpeed);
            })
            .catch(err => Log.error("MMM-Kermis: failed to fetch data", err));
    },

    // Datum formatteren naar dd-mm-yyyy
    formatDate(dateStr) {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    },

    // Aftel-dagen
    getCountdown(startDateStr) {
        const today = new Date();
        const startDate = new Date(startDateStr);
        const diffTime = startDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? `${diffDays} dagen` : "";
    },

    // Bouw DOM elementen
    getDom() {
        const wrapper = document.createElement("div");
        wrapper.className = "MMM-Kermis";

        this.kermissen.forEach(k => {
            const item = document.createElement("div");
            item.className = "kermis-item";

            // Icoon en kleur per formaat
            const icoonMap = {
                klein: "🎪",
                middel: "🎠",
                groot: "🎡"
            };
            const kleurMap = {
                klein: "#4caf50",
                middel: "#ff9800",
                groot: "#f44336"
            };

            item.innerHTML = `
                <span class="kermis-icoon">${icoonMap[k.formaat]}</span>
                <div class="kermis-info">
                    <span class="kermis-locatie">${k.locatie}</span>
                    <span class="kermis-datum">${this.formatDate(k.van)} t/m ${this.formatDate(k.tot)}</span>
                </div>
                <div class="kermis-aftel">${this.getCountdown(k.van)}</div>
            `;
            item.querySelector(".kermis-icoon").style.color = kleurMap[k.formaat];

            wrapper.appendChild(item);
        });

        return wrapper;
    }
});
