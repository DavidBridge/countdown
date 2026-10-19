if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

const BACKGROUND_IMAGE = "./assets/background.png";
let TRIPS = [];

function loadTrips() {
    const raw = document.getElementById("tripData").textContent;
    TRIPS = JSON.parse(raw);

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Set background image safely after page loads
window.addEventListener("load", () => {
    document.body.style.backgroundImage = `url('${BACKGROUND_IMAGE}')`;
});

// Hide a trip panel entirely
function hideTrip(i) {
    document.getElementById("title" + (i + 1)).parentElement.style.display = "none";
}

function updateCountdown() {
    const now = new Date();

    for (let i = 0; i < TRIPS.length; i++) {

        const trip = TRIPS[i];

        // Skip trip if any required field is blank
        if (!trip.title || !trip.location || !trip.date || !trip.departure) {
            hideTrip(i);
            continue;
        }

        const target = new Date(trip.date + "T" + trip.departure);
        const diff = target - now;

        if (diff <= 0) {
            document.getElementById("dayhour" + (i + 1)).textContent = "0 days, 0 hours";
            document.getElementById("minsec" + (i + 1)).textContent = "00:00";
            continue;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const mm = String(minutes).padStart(2, "0");
        const ss = String(seconds).padStart(2, "0");

        document.getElementById("title" + (i + 1)).textContent = trip.title;
        document.getElementById("location" + (i + 1)).textContent = trip.location;
        document.getElementById("days" + (i + 1)).textContent = `${days} days`;
        document.getElementById("daytime" + (i + 1)).textContent = `+ ${hours} hours ${mm} minutes ${ss} seconds`;
    }
}

function startSnowfallDepthPhysics() {

    const layers = {
        back: { speed: 0.5, drift: 0.2 },
        mid: { speed: 1.0, drift: 0.5 },
        front: { speed: 1.8, drift: 1.0 }
    };

    let wind = 0;          // current wind force
    let windTarget = 0;    // target wind force

    // Smooth wind update
    function updateWind() {
        wind += (windTarget - wind) * 0.02;
        requestAnimationFrame(updateWind);
    }

    updateWind();

    // Wind gust generator
    function triggerGust() {
        windTarget = (Math.random() * 4 - 2);   // -2 to +2 sideways force
        setTimeout(() => windTarget = 0, 2000 + Math.random() * 3000);
    }

    setInterval(triggerGust, 3000 + Math.random() * 5000);

    // Create flakes
    function createFlake(layerName) {

        const FLAKE_SHAPES = ["❄", "❅", "✻", "✼", "❉", "✥", "✧"];

        // Random rotation speed and direction
        const rotationSpeed = (Math.random() * 0.04 + 0.01) * (Math.random() < 0.5 ? -1 : 1);
        let rotationAngle = Math.random() * 360;

        const layer = layers[layerName];

        const flake = document.createElement("div");
        flake.classList.add("snowflake");
        flake.textContent = FLAKE_SHAPES[Math.floor(Math.random() * FLAKE_SHAPES.length)];
        // Random fade offset so flakes don't pulse in sync
        flake.style.animationDelay = (Math.random() * 3) + "s";

        const size = 8 + Math.random() * 20;
        flake.style.fontSize = size + "px";

        const x = Math.random() * window.innerWidth;
        const y = -20;

        const drift = (Math.random() * 2 - 1) * layer.drift;
        const flakeObj = {
            el: flake,
            x,
            y,
            drift,
            layer,
            rotationAngle,
            rotationSpeed
        };

        // Optional: shape‑dependent tweaks
        if (flake.textContent === "✻" || flake.textContent === "✼") {
            flake.style.opacity = 0.85;
        }
        if (flake.textContent === "✧") {
            flake.style.opacity = 0.6;
            flake.style.fontSize = (size * 0.8) + "px";
        }

        document.getElementById("snow-" + layerName).appendChild(flake);

        flakes.push(flakeObj);
    }

    const flakes = [];

    // Create flakes continuously
    setInterval(() => createFlake("back"), 400);
    setInterval(() => createFlake("mid"), 250);
    setInterval(() => createFlake("front"), 150);

    // Physics update loop
    function updateFlakes() {
        for (const f of flakes) {
            f.y += f.layer.speed;                 // fall speed
            f.x += f.drift + wind * f.layer.drift; // sideways movement

            f.rotationAngle += f.rotationSpeed * (f.layer.drift + Math.abs(wind) * 0.3);  // depth-aware rotation
            if (f.el.textContent === "❄" || f.el.textContent === "❅") {
                f.rotationAngle += f.rotationSpeed * 0.7;
            } else {
                f.rotationAngle += f.rotationSpeed * 1.2;
            }
            f.rotationAngle += (Math.sin(f.y * 0.01) * 0.2);



            f.el.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${f.rotationAngle}deg)`;

            // Remove flakes that fall off screen, building up the accumulation layer at the bottom
            if (f.y > window.innerHeight - 10) {
                // Add a ground flake at the landing position
                addGroundFlake(f.x);

                // Remove falling flake
                f.el.remove();
                flakes.splice(flakes.indexOf(f), 1);
            }

        }

        requestAnimationFrame(updateFlakes);
    }

    updateFlakes();
}


function addGroundFlake(x) {
    const flake = document.createElement("div");
    flake.classList.add("ground-flake");

    // Random small shapes
    const shapes = ["❄", "❅", "✻", "✼", "❉"];
    flake.textContent = shapes[Math.floor(Math.random() * shapes.length)];

    // Random slight size variation
    flake.style.fontSize = (8 + Math.random() * 6) + "px";

    // Place at bottom
    flake.style.left = x + "px";

    document.getElementById("snow-ground").appendChild(flake);
}

function growGroundLayer() {
    const ground = document.getElementById("snow-ground");
    const currentHeight = parseFloat(getComputedStyle(ground).height);

    // Cap height at 120px
    if (currentHeight < 120) {
        ground.style.height = (currentHeight + 0.05) + "px";
    }

    requestAnimationFrame(growGroundLayer);
}

// Load JSON
loadTrips();

window.addEventListener("load", () => {
    startSnowfallDepthPhysics();
    growGroundLayer();
});