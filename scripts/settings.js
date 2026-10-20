/* --------------------------------------------------------
  Author David Bridge
  Last updated 2026-10-20
  Dependency of settings.html
-------------------------------------------------------- */

// ------------------------------------------------------------
// Settings Page Logic
// ------------------------------------------------------------

// Load user trips (or defaults if first run)
let trips = loadUserTrips();

// ------------------------------------------------------------
// Render editable settings UI
// ------------------------------------------------------------
function renderSettings() {
    const container = document.getElementById("settingsContainer");
    container.innerHTML = "";

    trips.sort((a, b) => a.sortOrder - b.sortOrder);

    trips.forEach(trip => {
        const row = document.createElement("div");
        row.className = "trip-row";

        // Convert UTC → local datetime-local format
        const dtLocal = new Date(trip.departure)
            .toISOString()
            .slice(0, 16); // "YYYY-MM-DDTHH:MM"

        row.innerHTML = `
            <label>
                <input type="checkbox" id="en-${trip.id}" ${trip.enabled ? "checked" : ""}>
                ${trip.name}
            </label>

            <label>Trip Name:</label>
            <input type="text" id="name-${trip.id}" value="${trip.name}">

            <label>Location:</label>
            <input type="text" id="location-${trip.id}" value="${trip.location}">

            <label>Departure Date & Time:</label>
            <input type="datetime-local" id="dt-${trip.id}" value="${dtLocal}">
        `;

        container.appendChild(row);
    });
}

// ------------------------------------------------------------
// Save user changes back to localStorage
// ------------------------------------------------------------
function saveSettings() {
    trips.forEach(trip => {
        trip.enabled = document.getElementById(`en-${trip.id}`).checked;
        trip.name = document.getElementById(`name-${trip.id}`).value;
        trip.location = document.getElementById(`location-${trip.id}`).value;

        const dtValue = document.getElementById(`dt-${trip.id}`).value;

        // Convert local datetime → UTC ISO
        trip.departure = new Date(dtValue).toISOString();
    });

    saveUserTrips(trips);
    window.location.href = "index.html";
}

// ------------------------------------------------------------
// Reset all trips to default template
// ------------------------------------------------------------
function resetToDefaults() {
    trips = resetUserTrips();
    renderSettings();
}

// ------------------------------------------------------------
// Navigate back to countdown page
// ------------------------------------------------------------
function goBack() {
    window.location.href = "index.html";
}

// ------------------------------------------------------------
// Initialise settings page
// ------------------------------------------------------------
renderSettings();
