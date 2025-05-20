const canvas = document.getElementById('bg-animation');
const ctx = canvas.getContext('2d');

let w = window.innerWidth;
let h = window.innerHeight;
canvas.width = w;
canvas.height = h;

window.addEventListener('resize', () => {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
});

// Neon palette
const colors = ['#00fff7', '#ff00c8', '#ffe600', '#00ff90', '#2196f3'];
const lines = [];
const particles = [];
const LINE_COUNT = 7;
const PARTICLE_COUNT = 22;

// Init lines
for (let i = 0; i < LINE_COUNT; i++) {
    lines.push({
        y: Math.random() * h,
        speed: 0.2 + Math.random() * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 1.5 + Math.random() * 2.5,
        glow: 8 + Math.random() * 12
    });
}

// Init particles
for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.5 + Math.random() * 2.5,
        dx: -0.2 + Math.random() * 0.4,
        dy: -0.2 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        glow: 8 + Math.random() * 10
    });
}

function draw() {
    ctx.clearRect(0, 0, w, h);

    // Sin parallax ni interacción de ratón
    const parallaxX = 0;
    const parallaxY = 0;

    // Draw neon lines
    for (let l of lines) {
        ctx.save();
        ctx.strokeStyle = l.color;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = l.glow;
        ctx.lineWidth = l.width;
        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.moveTo(0 + parallaxX * 40, l.y + parallaxY * 40);
        ctx.lineTo(w + parallaxX * 40, l.y + parallaxY * 40);
        ctx.stroke();
        ctx.restore();

        l.y += l.speed;
        if (l.y > h + 20) l.y = -20;
    }

    // Draw neon particles
    for (let p of particles) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(
            p.x + parallaxX * 60,
            p.y + parallaxY * 60,
            p.r,
            0, Math.PI * 2
        );
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.glow;
        ctx.globalAlpha = 0.22;
        ctx.fill();
        ctx.restore();

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
    }

    requestAnimationFrame(draw);
}

draw();
