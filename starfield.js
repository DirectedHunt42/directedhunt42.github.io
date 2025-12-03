// Starfield animation with galaxies and shooting stars
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');
let stars = [], galaxies = [], shootingStars = [];
let mouseX = 0, mouseY = 0;

// ===== STARFIELD, GALAXIES, SHOOTING STARS =====
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generateStars();
    generateGalaxies();
}

function generateStars() {
    stars = [];
    const starCount = 400;
    const colors = ['#ffffff', '#ffd700', '#add8e6', '#ffcccb'];
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            driftX: Math.random() * 0.02 - 0.01,
            driftY: Math.random() * 0.02 - 0.01,
            parallax: 0.01 + Math.random() * 0.04
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
            starsInGalaxy.push({
                angle, radiusX, radiusY, centerX, centerY, tilt, armAngleOffset: arm * 2 * Math.PI / arms,
                radius: Math.random() * 1.2 + 0.3,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: rotationSpeed,
                parallax: 0.02 + Math.random() * 0.03,
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
        speedX: 20 + Math.random() * 30,
        speedY: 5 + Math.random() * 5,
        length: 100 + Math.random() * 50,
        color: '#ffffff',
        parallax: 0.02 + Math.random() * 0.03
    });
}

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        star.x0 = x0 + star.driftX;
        star.y0 = y0 + star.driftY;
        const dx = (mouseX - canvas.width / 2) * star.parallax;
        const dy = (mouseY - canvas.height / 2) * star.parallax;
        ctx.beginPath();
        ctx.ellipse(star.x0 + dx, star.y0 + dy, star.radius * 1.2, star.radius, 0, 0, 2 * Math.PI);
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
        mouseX = (window.innerWidth / 2) - (event.gamma * (window.innerWidth / 180));
        mouseY = (window.innerHeight / 2) - (event.beta * (window.innerHeight / 180));
        mouseX = Math.max(0, Math.min(window.innerWidth, mouseX));
        mouseY = Math.max(0, Math.min(window.innerHeight, mouseY));
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
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
}
