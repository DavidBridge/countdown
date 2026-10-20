/* --------------------------------------------------------
  Author David Bridge
  Last updated 2026-10-20
-------------------------------------------------------- */

// ------------------------------------------------------------
// Trip Data Model + Local Storage Layer
// ------------------------------------------------------------

window.DEFAULT_BACKGROUND = "assets/background.png";

// Default trip definitions (read-only template)
const DEFAULT_TRIPS = [
    {
        id: "trip-ny",
        name: "New Year Send Off",
        location: "Andorra, Spain",
        enabled: true,
        departure: "2026-12-27T00:00:00",
        sortOrder: 1
    },
    {
        id: "trip-jan",
        name: "January Jaunt",
        location: "Flaine, France",
        enabled: true,
        departure: "2027-01-16T00:00:00",
        sortOrder: 2
    },
    {
        id: "trip-mar",
        name: "March Mega Bash",
        location: "Les Arcs, France",
        enabled: true,
        departure: "2027-03-13T00:00:00",
        sortOrder: 3
    }
];

// ------------------------------------------------------------
// Utility: clone default trips so they can be safely edited
// ------------------------------------------------------------
function getDefaultTrips() {
    return DEFAULT_TRIPS.map(t => ({ ...t }));
}

// ------------------------------------------------------------
// Load user trips from localStorage
// Falls back to defaults if:
// - nothing stored yet
// - JSON is corrupt
// - schema mismatch (future-proof)
// ------------------------------------------------------------
function loadUserTrips() {
    const raw = localStorage.getItem("userTrips");

    if (!raw) {
        const defaults = getDefaultTrips();
        saveUserTrips(defaults);
        return defaults;
    }

    try {
        const parsed = JSON.parse(raw);

        // Basic schema validation
        if (!Array.isArray(parsed)) throw new Error("Invalid schema");

        return parsed;
    } catch (err) {
        console.warn("localStorage userTrips corrupted, resetting to defaults:", err);

        const defaults = getDefaultTrips();
        saveUserTrips(defaults);
        return defaults;
    }
}

// ------------------------------------------------------------
// Save user trips to localStorage
// ------------------------------------------------------------
function saveUserTrips(trips) {
    localStorage.setItem("userTrips", JSON.stringify(trips));
}

// ------------------------------------------------------------
// Reset user trips back to defaults
// ------------------------------------------------------------
function resetUserTrips() {
    const defaults = getDefaultTrips();
    saveUserTrips(defaults);
    return defaults;
}

// ------------------------------------------------------------
// Export to global scope (simple PWA-friendly pattern)
// ------------------------------------------------------------
window.getDefaultTrips = getDefaultTrips;
window.loadUserTrips = loadUserTrips;
window.saveUserTrips = saveUserTrips;
window.resetUserTrips = resetUserTrips;