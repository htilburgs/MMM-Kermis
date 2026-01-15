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
            const leeg = document.createElement("div");
            leeg.className = "kermis-leeg";
            leeg.innerText = "Geen geplande kermissen";
            wrapper.appendChild(leeg);
            return wrapper;
        }

        const vandaag = new Date();

        // Filter: niet voltooid + einddatum >= vandaag
        const zichtbaar = this.items
            .filter(item => {
                if (item.voltooid) return false;
                const eind = new Date(item.tot);
                return eind >= vandaag;
            })
            .sort((a, b) => new Date(a.van) - new Date(b.van));

        if (!zichtbaar.length) {
            const leeg = document.createElement("div");
            leeg.className = "kermis-leeg";
            leeg.innerText = "Geen actuele kermissen";
            wrapper.appendChild(leeg);
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
    container.style.gap = "12px"; // ruimte tussen icoon en tekst

    // Icoon per formaat
    const icoonMap = {
        klein: "🎪",
        middel: "🎠", 
        groot: "🎡"    
    };
    
    const icoon = document.createElement("span");
    icoon.className = "kermis-icoon";
    icoon.innerText = icoonMap[item.formaat] || "🎪";

    // Tekstcontainer rechts
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

    container.appendChild(icoon);
    container.appendChild(tekst);

    return container;
},

    formatDate(dateString) {
        const d = new Date(dateString);
        return d.toLocaleDateString("nl-NL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

});
