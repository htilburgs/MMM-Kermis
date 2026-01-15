Module.register("MMM-Kermis", {
    defaults: {
        refreshInterval: 60 * 1000,
    },

    start() {
        this.items = [];
        this.getData();
        setInterval(() => {
            this.getData();
        }, this.config.refreshInterval);
    },

    getData() {
        this.sendSocketNotification("GET_KERMIS_DATA");
    },

    socketNotificationReceived(notification, payload) {
        if (notification === "KERMIS_DATA") {
            this.items = payload;
            this.updateDom();
        }
    },

    getDom() {
        const wrapper = document.createElement("div");
        wrapper.className = "kermis-wrapper";

        if (this.items.length === 0) {
            wrapper.innerHTML = "Geen geplande kermissen";
            return wrapper;
        }

        const now = new Date();

        this.items.forEach(item => {
            const endDate = new Date(item.tot);

            if (item.voltooid || endDate < now) return;

            const div = document.createElement("div");
            div.className = `kermis-item ${item.formaat}`;

            div.innerHTML = `
                <strong>${item.locatie}</strong><br>
                ${item.omschrijving}<br>
                ${item.van} t/m ${item.tot}<br>
                <em>Formaat: ${item.formaat}</em>
            `;

            wrapper.appendChild(div);
        });

        return wrapper;
    }
});
