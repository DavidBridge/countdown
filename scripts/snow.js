/* --------------------------------------------------------
  Author David Bridge 
  Last updated: 2026-10-20
  Make snow on an HTML page - 
  Requires snow.css                                      
  Usage 
    <link rel="stylesheet" href="styles/snow.css">
    <script src="scripts/snow.js"></script>*/
/* --------------------------------------------------------*/

function startSnowOptimised() {

    let snowEnabled = true;

    const MAX_FLAKES = 250;          // tablet-safe
    const FLAKE_SHAPES = ["❄", "❅", "✻", "✼", "❉", "✥", "✧", "SH"];

    const layers = {
        back: { speed: 0.5, drift: 0.2, el: document.getElementById("snow-back") },
        mid: { speed: 1.0, drift: 0.5, el: document.getElementById("snow-mid") },
        front: { speed: 1.8, drift: 1.0, el: document.getElementById("snow-front") }
    };

    const flakes = [];

    // Create a pool of flakes (no DOM growth)
    function initFlakes() {
        for (let i = 0; i < MAX_FLAKES; i++) {
            const layerName = i < 80 ? "back" : i < 170 ? "mid" : "front";
            const layer = layers[layerName];

            const flake = document.createElement("div");
            flake.classList.add("snowflake");
            flake.textContent = FLAKE_SHAPES[Math.floor(Math.random() * FLAKE_SHAPES.length)];

            let size = 6 + Math.random() * 18;

            let rotationSpeed = (Math.random() * 0.04 + 0.01) * (Math.random() < 0.5 ? -1 : 1);
            const shape = FLAKE_SHAPES[Math.floor(Math.random() * FLAKE_SHAPES.length)];
            flake.textContent = shape;
            if (shape === "SH") {
                size = 6 + Math.random() * 10;   // small → medium only
                flake.style.filter = "blur(1px)"; // slight blur
            }

            flake.style.fontSize = size + "px";

            flake.style.animation = `fadeSnow ${4 + Math.random() * 4}s ease-in-out infinite`;
            flake.style.animationDelay = `${Math.random() * 3}s`;
            flake.style.setProperty("--fade-strength", layerName === "back" ? 0.4 :
                layerName === "mid" ? 0.2 : 0.05);

            layer.el.appendChild(flake);


            flakes.push({
                el: flake,
                layer,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                drift: (Math.random() * 2 - 1) * layer.drift,
                rotation: Math.random() * 360,
                rotationSpeed: rotationSpeed,
                fallSpeedFactor: 0.7 + Math.random() * 0.7
            });
        }
    }

    initFlakes();

    // Wind system (lightweight)
    let wind = 0;
    let windTarget = 0;

    function updateWind() {
        wind += (windTarget - wind) * 0.02;
        requestAnimationFrame(updateWind);
    }

    updateWind();

    setInterval(() => {
        windTarget = (Math.random() * 4 - 2);
        setTimeout(() => windTarget = 0, 2000 + Math.random() * 3000);
    }, 3000 + Math.random() * 5000);

    // Main animation loop (single RAF)
    function animate() {

        if (!snowEnabled)
            return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        for (const f of flakes) {

            // Update physics
            f.y += f.layer.speed * f.fallSpeedFactor;
            f.x += f.drift + wind * f.layer.drift;

            f.rotation += f.rotationSpeed;

            if (f.el.textContent === "SH") {
                // clamp rotation so it never flips upside-down
                if (f.rotation > 20) f.rotation = 20;
                if (f.rotation < -20) f.rotation = -20;
            }

            // Recycle flake when off-screen
            if (f.y > h) {
                f.y = -20;
                f.x = Math.random() * w;
            }
            if (f.x < -50 || f.x > w + 50) {
                f.x = Math.random() * w;
                f.y = -20;
            }

            // GPU transform
            f.el.style.transform =
                `translate(${f.x}px, ${f.y}px) rotate(${f.rotation}deg)`;
        }

        requestAnimationFrame(animate);
    }


    function applySnowVisibility() {
        const display = snowEnabled ? "block" : "none";
        document.getElementById("snow-back").style.display = display;
        document.getElementById("snow-mid").style.display = display;
        document.getElementById("snow-front").style.display = display;
        document.getElementById("snow-ground").style.display = display;
    }


    animate();
}

window.addEventListener("load", startSnowOptimised);
