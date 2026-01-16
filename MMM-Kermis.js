Module.register("MMM-Kermis", {

    defaults: {
        refreshInterval: 60 * 1000 // 1 minuut
    },

    getStyles() {
        return ["MMM-Kermis.css"];
    },

    start() {
        this.items = [];
        this.sendSocketNotification("GET_KERMIS_DATA");

        setInterval(() => {
            this.sendSocketNotification("GET_KERMIS_DATA");
        }, this.config.refreshInterval);
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "KERMIS_DATA") {
            this.items = payload || [];
            this.updateDom();
        }
    },

    getDom() {
        const wrapper = document.createElement("div");
        wrapper.className = "kermis-wrapper";

        if (!this.items.length) {
            wrapper.innerHTML = `<div class="kermis-leeg">Geen geplande kermissen</div>`;
            return wrapper;
        }

        const vandaag = new Date();
        vandaag.setHours(0, 0, 0, 0);

        const zichtbaar = this.items
            .filter(item => {
                if (item.voltooid) return false;

                const eind = new Date(item.tot);
                eind.setHours(23, 59, 59, 999);

                return eind >= vandaag;
            })
            .sort((a, b) => new Date(a.van) - new Date(b.van));

        if (!zichtbaar.length) {
            wrapper.innerHTML = `<div class="kermis-leeg">Geen actuele kermissen</div>`;
            return wrapper;
        }

        zichtbaar.forEach(item => {
            wrapper.appendChild(this.createItem(item));
        });

        return wrapper;
    },

    createItem(item) {
        const container = document.createElement("div");
        container.className = `kermis-item ${item.formaat}`;
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.style.justifyContent = "space-between";
        container.style.gap = "12px";

        const icoonMap = {
            klein: "🎪",
            middel: "🎠",
            groot: "🎡"
        };

        const icoon = document.createElement("span");
        icoon.className = "kermis-icoon";
        icoon.innerText = icoonMap[item.formaat] || "🎪";

        const tekst = document.createElement("div");
        tekst.style.display = "flex";
        tekst.style.flexDirection = "column";

        const titel = document.createElement("strong");
        titel.innerText = item.locatie;

        const datum = document.createElement("div");
        datum.className = "kermis-datum";
        datum.innerText = `${this.formatDate(item.van)} t/m ${this.formatDate(item.tot)}`;

        tekst.appendChild(titel);
        tekst.appendChild(datum);

        const aftel = document.createElement("div");
        aftel.className = "kermis-aftel";
        const dagen = this.calculateDaysUntil(item.van);
        aftel.innerText = dagen === 0 ? "Vandaag!" : `Nog ${dagen} dagen`;

        container.appendChild(icoon);
        container.appendChild(tekst);
        container.appendChild(aftel);

        return container;
    },

    calculateDaysUntil(dateString) {
        const vandaag = new Date();
        vandaag.setHours(0, 0, 0, 0);

        const start = new Date(dateString);
        start.setHours(0, 0, 0, 0);

        const diffTime = start - vandaag;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays < 0 ? 0 : diffDays;
    },

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString("nl-NL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }
});
