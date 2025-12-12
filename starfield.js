// Starfield animation with galaxies and shooting stars
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
let stars = [], galaxies = [], shootingStars = [];
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0; // For smoothing
let lastWidth = 0, lastHeight = 0;
let planet = {}, sun = {};

// ===== CONFIGURATION FOR MAIN OBJECT =====
// Set to 'none' for normal Sun. Set to 'blackhole' or 'pulsar' to replace the Sun.
startype = Math.random();
if (startype < 0.005) {
    var DEBUG_FORCE_RARE_STAR = 'blackhole';
} else if (startype < 0.01) {
    var DEBUG_FORCE_RARE_STAR = 'pulsar';
} else {
    var DEBUG_FORCE_RARE_STAR = 'none';
}
// ======================================

// ===== STARFIELD, GALAXIES, SHOOTING STARS =====
function resizeCanvas() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    if (lastWidth && lastHeight) {
        const sx = newWidth / lastWidth;
        const sy = newHeight / lastHeight;

        // Scale existing stars
        stars.forEach(s => {
            s.x *= sx;
            s.y *= sy;
            s.driftX *= sx;
            s.driftY *= sy;
        });

        // Scale existing galaxies
        galaxies.forEach(g => g.forEach(star => {
            star.centerX *= sx;
            star.centerY *= sy;
            star.radiusX *= sx;
            star.radiusY *= sy;
            star.driftX *= sx;
            star.driftY *= sy;
        }));

        // Scale existing shooting stars
        shootingStars.forEach(s => {
            s.x *= sx;
            s.y *= sy;
            s.speedX *= sx;
            s.speedY *= sy;
            s.length *= sx; 
        });

        // Scale planet and sun
        planet.radius *= sy;
        planet.h *= sy;
        planet.x *= sx;
        planet.y *= sy;
        sun.radius *= sy;
        sun.x *= sx;
        sun.y *= sy;
        
        if(planet.landmasses) {
            planet.landmasses.forEach(l => {
                l.x *= sx;
                l.y *= sy;
                l.r *= sx; 
            });
        }
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    if (!lastWidth || !lastHeight) {
        generateStars();
        generateGalaxies();

        // Initialize planet
        planet = {
            radius: canvas.height * 1.0,
            h: canvas.height * 0.25,
            x: canvas.width * 0.25,
            y: 0, // temp
            parallax: 0.05
        };
        planet.y = canvas.height - planet.h + planet.radius;

        // Generate procedural landmasses for texture
        planet.landmasses = [];
        const landCount = 15;
        for(let i=0; i<landCount; i++) {
            planet.landmasses.push({
                x: (Math.random() - 0.5) * planet.radius * 1.8, 
                y: (Math.random() - 0.5) * planet.radius * 1.8,
                r: Math.random() * planet.radius * 0.3 + planet.radius * 0.1,
                elongation: 0.5 + Math.random() * 0.5 
            });
        }

        // Randomize planet palette
        const planetPalettes = [
            {light: '#6fa8dc', mid: '#0b5394', dark: '#001f3f', shadow: '#000000'}, // Blue Ocean / Light Blue Land
            {light: '#93c47d', mid: '#38761d', dark: '#006400', shadow: '#000000'}, // Green Continents / Dark Green Forest
            {light: '#e06666', mid: '#990000', dark: '#8B0000', shadow: '#000000'}, // Red/Mars-like
            {light: '#b4a7d6', mid: '#674ea7', dark: '#4B0082', shadow: '#000000'}, // Purple Alien
            {light: '#f6b26b', mid: '#783f04', dark: '#8B4513', shadow: '#000000'}  // Desert/Earthy
        ];
        planet.palette = planetPalettes[Math.floor(Math.random() * planetPalettes.length)];

        // Initialize Sun (or Rare Object)
        sun = {
            radius: canvas.height * 0.05,
            x: canvas.width * 0.1,
            y: canvas.height - planet.h - canvas.height * 0.05,
            parallax: 0.1,
            // Check debug variable to force type, otherwise default to 'sun'
            sunType: DEBUG_FORCE_RARE_STAR !== 'none' ? DEBUG_FORCE_RARE_STAR : 'sun', 
            angle: Math.random() * 2 * Math.PI + 300, 
            pulseTime: Math.random() * 500
        };

        const sunPalettes = [
            {core: 'white', mid1: 'yellow', mid2: 'orange'},
            {core: 'white', mid1: '#FFD700', mid2: '#FF8C00'},
            {core: 'white', mid1: '#FFFFE0', mid2: '#FF4500'},
            {core: 'white', mid1: '#FFFACD', mid2: '#FFA500'}
        ];
        sun.palette = sunPalettes[Math.floor(Math.random() * sunPalettes.length)];
    }

    lastWidth = newWidth;
    lastHeight = newHeight;
}

function generateStars() {
    stars = [];
    const starCount = 400;
    const colors = ['#ffffff', '#ffd700', '#add8e6', '#ffcccb'];
    
    // STRICT: No rare star logic here. All stars are normal.
    for (let i = 0; i < starCount; i++) {
        const parallax = 0.01 + Math.random() * 0.04;
        const radius = 0.5 + (parallax - 0.01) / 0.04 * 1.5; 

        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius,
            color: colors[Math.floor(Math.random() * colors.length)],
            driftX: Math.random() * 0.02 - 0.01,
            driftY: Math.random() * 0.02 - 0.01,
            parallax: parallax * 1.5, 
            type: 'star', // Force type to always be 'star'
        });
    }
}

function generateGalaxies() {
    galaxies = [];
    const galaxyCount = 6;
    const colors = ['#ffffff', '#ffd700', '#add8e6', '#ffcccb'];
    for (let g = 0; g < galaxyCount; g++) {
        const centerX = Math.random() * canvas.width;
        const centerY = Math.random() * canvas.height;
        const radiusX = 30 + Math.random() * 70;
        const radiusY = 20 + Math.random() * 50;
        const rotationSpeed = 0.0001 + Math.random() * 0.001;
        const tilt = (Math.random() * 40 - 20) * Math.PI / 180;
        const angleOffset = Math.random() * 2 * Math.PI;
        const arms = 3 + Math.floor(Math.random() * 2);
        const starsInGalaxy = [];
        for (let i = 0; i < 50; i++) {
            const arm = i % arms;
            const radiusFactor = Math.random();
            const angle = radiusFactor * 4 * Math.PI + arm * 2 * Math.PI / arms + angleOffset;
            const parallax = 0.02 + Math.random() * 0.03;
            const radius = 0.3 + (parallax - 0.02) / 0.03 * 0.9; 
            starsInGalaxy.push({
                angle, radiusX, radiusY, centerX, centerY, tilt, armAngleOffset: arm * 2 * Math.PI / arms,
                radius,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: rotationSpeed,
                parallax: parallax * 1.5,
                driftX: Math.random() * 0.01 - 0.005,
                driftY: Math.random() * 0.01 - 0.005,
                radiusFactor
            });
        }
        galaxies.push(starsInGalaxy);
    }
}

function generateShootingStar() {
    shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height / 2,
        speedX: 20 + Math.random() * 300,
        speedY: 5 + Math.random() * 50,
        length: 100 + Math.random() * 50,
        color: '#ffffff',
        parallax: (0.02 + Math.random() * 0.03) * 1.5 
    });
}

function drawRareObject(s, x, y) {
    const time = performance.now();

    if (s.type === 'blackhole') {
        const outerRadius = s.radius * (s.type === 'blackhole' ? 3.5 : 5);
        const diskGradient = ctx.createRadialGradient(x, y, s.radius * 1.5, x, y, outerRadius);
        diskGradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)'); 
        diskGradient.addColorStop(0.3, 'rgba(255, 100, 0, 0.7)'); 
        diskGradient.addColorStop(0.7, 'rgba(255, 0, 0, 0.5)'); 
        diskGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.ellipse(x, y, outerRadius, outerRadius, 0, 0, 2 * Math.PI);
        ctx.fillStyle = diskGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, s.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'black';
        ctx.fill();

    } else if (s.type === 'pulsar') {
        s.pulseTime = (s.pulseTime + 1) % 500;
        
        const jitter = Math.sin(time * 0.5) * (2 * Math.PI / 180); 
        const beamAngle = s.angle + jitter; 
        const beamLength = s.radius * 25;
        
        ctx.save();
        ctx.translate(x, y);
        
        const coneWidth = Math.PI / 16; 
        ctx.fillStyle = `rgba(173, 216, 230, ${0.5 + Math.sin(s.pulseTime * 0.05) * 0.5})`; 
        
        for (let i = 0; i < 2; i++) {
            const rotation = beamAngle + (i * Math.PI); 
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, beamLength, rotation - coneWidth / 2, rotation + coneWidth / 2);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();

        ctx.beginPath();
        ctx.arc(x, y, s.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.shadowColor = 'lightblue';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; 
    }
}

function drawMainRareObject(s, sx, sy) {
    if (s.sunType === 'blackhole' || s.sunType === 'pulsar') {
        const originalRadius = s.radius;
        s.radius = originalRadius * 2; 
        s.type = s.sunType;
        drawRareObject(s, sx, sy);
        s.radius = originalRadius;
    } else {
        const sunGradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.radius * 10);
        sunGradient.addColorStop(0, s.palette.core);
        sunGradient.addColorStop(0.05, s.palette.mid1);
        sunGradient.addColorStop(0.2, s.palette.mid2);
        sunGradient.addColorStop(1, 'rgba(255, 165, 0, 0)');
        ctx.beginPath();
        ctx.arc(sx, sy, s.radius * 10, 0, 2 * Math.PI);
        ctx.fillStyle = sunGradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, s.radius, 0, 2 * Math.PI);
        ctx.fillStyle = s.palette.core;
        ctx.fill();
    }
}


function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    mouseX = mouseX * 0.9 + targetMouseX * 0.1;
    mouseY = mouseY * 0.9 + targetMouseY * 0.1;

    // DRAW BACKGROUND STARS
    stars.forEach(s => {
        s.x += s.driftX;
        s.y += s.driftY;
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;
        
        const dx = (mouseX - canvas.width / 2) * s.parallax;
        const dy = (mouseY - canvas.height / 2) * s.parallax;
        
        // Since we removed rare types from stars array, this is always a circle
        ctx.beginPath();
        ctx.arc(s.x + dx, s.y + dy, s.radius, 0, 2 * Math.PI);
        ctx.fillStyle = s.color;
        ctx.fill();
    });
    
    // DRAW GALAXIES
    galaxies.forEach(g => g.forEach(star => {
        star.angle += star.speed;
        const x0 = star.centerX + star.radiusX * star.radiusFactor * Math.cos(star.angle + star.armAngleOffset);
        const y0 = star.centerY + star.radiusY * star.radiusFactor * Math.sin(star.angle + star.armAngleOffset) * Math.cos(star.tilt);
        star.centerX += star.driftX;
        star.centerY += star.driftY;
        const dx = (mouseX - canvas.width / 2) * star.parallax;
        const dy = (mouseY - canvas.height / 2) * star.parallax;
        ctx.beginPath();
        ctx.ellipse(x0 + dx, y0 + dy, star.radius * 1.2, star.radius, 0, 0, 2 * Math.PI);
        ctx.fillStyle = star.color;
        ctx.fill();
    }));

    // DRAW SHOOTING STARS
    shootingStars.forEach((s, i) => {
        s.x += s.speedX;
        s.y += s.speedY;
        const dx = (mouseX - canvas.width / 2) * s.parallax;
        const dy = (mouseY - canvas.height / 2) * s.parallax;
        const angle = Math.atan2(s.speedY, s.speedX);
        ctx.save();
        ctx.translate(s.x + dx, s.y + dy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-s.length, 0);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        if (s.x - s.length > canvas.width || s.y - s.length / 2 > canvas.height) {
            shootingStars.splice(i, 1);
        }
    });

    // Sun/Main Object Parallax
    const sun_dx = (mouseX - canvas.width / 2) * sun.parallax;
    const sun_dy = (mouseY - canvas.height / 2) * sun.parallax;
    const sx = sun.x + sun_dx;
    const sy = sun.y + sun_dy;

    drawMainRareObject(sun, sx, sy);

    // Planet Parallax
    const planet_dx = (mouseX - canvas.width / 2) * planet.parallax;
    const planet_dy = (mouseY - canvas.height / 2) * planet.parallax;
    const px = planet.x + planet_dx;
    const py = planet.y + planet_dy;
    const lightOffsetX = (mouseX - canvas.width / 2) / (canvas.width / 500);
    const lightOffsetY = (mouseY - canvas.height / 2) / (canvas.height / 500);
    const shadowOffsetX = (-lightOffsetX * 0.05) + 30;
    const shadowOffsetY = (-lightOffsetY * 0.01) + 5;

    // === NEW PLANET RENDERING WITH TEXTURE ===
    ctx.save();
    
    // 1. Create Clipping Mask for the Planet Sphere
    ctx.beginPath();
    ctx.arc(px, py, planet.radius, 0, 2 * Math.PI);
    ctx.clip(); // All subsequent drawing is confined to the planet circle

    // 2. Draw Base "Ocean" Layer
    ctx.fillStyle = planet.palette.mid; 
    ctx.fill();

    // 3. Draw "Landmasses" (Texture)
    ctx.fillStyle = planet.palette.light;
    if (planet.landmasses) {
        planet.landmasses.forEach(l => {
            // Calculate a texture parallax shift to simulate rotation/depth
            const textureParallaxX = (mouseX - canvas.width/2) * 0.02;
            const textureParallaxY = (mouseY - canvas.height/2) * 0.02;
            
            ctx.beginPath();
            ctx.ellipse(
                px + l.x + textureParallaxX, 
                py + l.y + textureParallaxY, 
                l.r, 
                l.r * l.elongation, 
                0, 0, 2 * Math.PI
            );
            ctx.fill();
        });
    }

    // 4. Draw Shadow (Inside clip)
    ctx.beginPath();
    ctx.arc(px + shadowOffsetX, py + shadowOffsetY, planet.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.97)'; // Strong shadow
    ctx.fill();

    // End Clipping Mask
    ctx.restore();

    // 5. Draw Atmosphere (Outside clip, drawn over the edges)
    const atmoGradient = ctx.createRadialGradient(px, py, planet.radius, px, py, planet.radius + 20);
    atmoGradient.addColorStop(0, 'rgba(135, 206, 235, 0.0)');
    atmoGradient.addColorStop(0.8, 'rgba(135, 206, 235, 0.4)');
    atmoGradient.addColorStop(1, 'rgba(135, 206, 235, 0.0)');
    ctx.beginPath();
    ctx.arc(px, py, planet.radius + 20, 0, 2 * Math.PI);
    ctx.fillStyle = atmoGradient;
    ctx.fill();

    requestAnimationFrame(drawStars);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawStars();
setInterval(() => { if (Math.random() < 0.05) generateShootingStar(); }, 2000);

// Mobile detection and input handling for parallax
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

function addOrientationListener() {
    window.addEventListener('deviceorientation', (event) => {
        targetMouseX = (window.innerWidth / 2) - (event.gamma * (window.innerWidth / 120));
        targetMouseY = (window.innerHeight / 2) - (event.beta * (window.innerHeight / 120));
        targetMouseX = Math.max(0, Math.min(window.innerWidth, targetMouseX));
        targetMouseY = Math.max(0, Math.min(window.innerHeight, targetMouseY));
    });
}

if (isMobile && window.DeviceOrientationEvent) {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        document.addEventListener('touchstart', async () => {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    addOrientationListener();
                }
            } catch (err) {
                console.error('Device orientation permission error:', err);
            }
        }, { once: true });
    } else {
        addOrientationListener();
    }
} else {
    window.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });
}