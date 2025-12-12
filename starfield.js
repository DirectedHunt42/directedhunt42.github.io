// Starfield animation with galaxies and shooting stars
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
let stars = [], galaxies = [], shootingStars = [];
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0; // For smoothing
let lastWidth = 0, lastHeight = 0;

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
            s.length *= sx; // Approximate scaling for length
        });
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    if (!lastWidth || !lastHeight) {
        generateStars();
        generateGalaxies();
    }

    lastWidth = newWidth;
    lastHeight = newHeight;
}

function generateStars() {
    stars = [];
    const starCount = 400;
    const colors = ['#ffffff', '#ffd700', '#add8e6', '#ffcccb'];
    for (let i = 0; i < starCount; i++) {
        const parallax = 0.01 + Math.random() * 0.04;
        const radius = 0.5 + (parallax - 0.01) / 0.04 * 1.5; // Tie radius to parallax for depth
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius,
            color: colors[Math.floor(Math.random() * colors.length)],
            driftX: Math.random() * 0.02 - 0.01,
            driftY: Math.random() * 0.02 - 0.01,
            parallax: parallax * 1.5 // Increase parallax range for more 3D feel
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
            const radius = 0.3 + (parallax - 0.02) / 0.03 * 0.9; // Tie radius to parallax
            starsInGalaxy.push({
                angle, radiusX, radiusY, centerX, centerY, tilt, armAngleOffset: arm * 2 * Math.PI / arms,
                radius,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: rotationSpeed,
                parallax: parallax * 1.5, // Increase for more 3D
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
        parallax: (0.02 + Math.random() * 0.03) * 1.5 // Increase for more 3D
    });
}

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Smooth mouse position
    mouseX = mouseX * 0.9 + targetMouseX * 0.1;
    mouseY = mouseY * 0.9 + targetMouseY * 0.1;

    stars.forEach(s => {
        s.x += s.driftX;
        s.y += s.driftY;
        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;
        const dx = (mouseX - canvas.width / 2) * s.parallax;
        const dy = (mouseY - canvas.height / 2) * s.parallax;
        ctx.beginPath();
        ctx.arc(s.x + dx, s.y + dy, s.radius, 0, 2 * Math.PI);
        ctx.fillStyle = s.color;
        ctx.fill();
    });
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
        // Increased sensitivity: /120 instead of /180 for more responsive tilt
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