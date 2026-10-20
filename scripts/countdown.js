// ------------------------------------------------------------
// Countdown Page Logic
// ------------------------------------------------------------

// Load user-specific trips (or defaults if first run)
const trips = loadUserTrips()
    .filter(t => t.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);


// ------------------------------------------------------------
// Render trip cards dynamically
// ------------------------------------------------------------
function renderTrips() {
    const container = document.getElementById("tripContainer");
    container.innerHTML = "";

    //enrichTrips(); // compute dynamic fields

    trips.forEach(trip => {

        const card = document.createElement("div");
        card.className = "trip-card";
        card.dataset.id = trip.id;

        const target = new Date(trip.departure);
        const departureLocal = target.toLocaleString("en-GB", {
            dateStyle: "short",
            timeStyle: "medium"
        });

        card.innerHTML = `
            <div class="trip-name">${trip.name}</div>
            <div class="trip-location">${trip.location}</div>
            <div class="trip-days">${trip.days} days</div>
            <div class="trip-hhmm">${trip.hhmm}</div>
            <div class="trip-departure">${departureLocal}</div>
        `;

        container.appendChild(card);
    });
}


function updateCountdowns() {
    const now = new Date();

    trips.forEach(trip => {
        const target = new Date(trip.departure);

        const card = document.querySelector(`.trip-card[data-id="${trip.id}"]`);
        if (!card) return;

        const daysEl = card.querySelector(".trip-days");
        const hhmmEl = card.querySelector(".trip-hhmm");

        // 1. Calendar day difference (ignoring time-of-day)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const depDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

        let days = Math.floor((depDay - today) / (1000 * 60 * 60 * 24));

        // 2. Time-of-day difference between "now" and departure time,
        //    assuming SAME local offset (ignoring future GMT/BST change)
        const nowSeconds =
            now.getHours() * 3600 +
            now.getMinutes() * 60 +
            now.getSeconds();

        const targetSeconds =
            target.getHours() * 3600 +
            target.getMinutes() * 60 +
            target.getSeconds();

        let timeDiffSeconds = targetSeconds - nowSeconds;

        // If the departure time is "earlier" in the day than now,
        // then one of the calendar days is effectively consumed by the time part.
        if (timeDiffSeconds < 0) {
            timeDiffSeconds += 24 * 3600; // wrap to next day
            days -= 1;                    // one day less in the "whole days" count
        }

        // If we've passed the departure moment
        if (days < 0 || timeDiffSeconds < 0) {
            daysEl.textContent = "0 days";
            hhmmEl.textContent = "00:00:00";
            return;
        }

        const hours = Math.floor(timeDiffSeconds / 3600);
        const mins = Math.floor((timeDiffSeconds % 3600) / 60);
        const secs = timeDiffSeconds % 60;

        trip.hhmm = `+ ${String(hours)} hours, ${String(mins)} minutes and ${String(secs)} seconds`;

        daysEl.textContent = `${days} days`;
        hhmmEl.textContent = `+ ${String(hours)} hours, ${String(mins)} minutes and ${String(secs)} seconds`;
        // `${String(hours).padStart(2, "0")}:` +
        // `${String(mins).padStart(2, "0")}:` +
        // `${String(secs).padStart(2, "0")}`;
    });
}



// ------------------------------------------------------------
// Initialise page
// ------------------------------------------------------------

// Set a full page background image
window.addEventListener("load", () => {
    document.body.style.backgroundImage = `url('${DEFAULT_BACKGROUND}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
});

renderTrips();
setInterval(updateCountdowns, 1000);


// ------------------------------------------------------------
// Navigation to settings page
// ------------------------------------------------------------
function openSettings() {
    window.location.href = "settings.html";
}
