// preloader — typed entry line + flash wipe exit
document.body.classList.add('loading');
(function () {
  const typeEl = document.getElementById('preloaderTypeText');
  const msg = 'ENTERING EARTH-616...';
  if (typeEl) {
    let i = 0;
    const typer = setInterval(() => {
      typeEl.textContent = msg.slice(0, i + 1);
      i++;
      if (i >= msg.length) clearInterval(typer);
    }, 45);
  }
})();

window.addEventListener('load', () => {
  setTimeout(() => {
    const pre = document.getElementById('preloader');
    const wipe = document.getElementById('wipeTransition');
    if (wipe) wipe.classList.add('active');
    setTimeout(() => {
      if (pre) pre.classList.add('hidden');
    }, 160);
    setTimeout(() => {
      document.body.classList.remove('loading');
      if (wipe) wipe.classList.remove('active');
    }, 800);
  }, 1400);
});

// scroll progress bar
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const total = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrolled / total * 100) + '%';
});

// cursor glow + dot
const cursorGlow = document.getElementById('cursorGlow');
const cursorDot = document.getElementById('cursorDot');
if (cursorGlow) {
  document.addEventListener('mousemove', e => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
    if (cursorDot) {
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
    }
  });
  document.addEventListener('mouseenter', () => { cursorGlow.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
}
if (cursorDot) {
  document.querySelectorAll('a, button, .project-card, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
  });
}

// web-shot on click (small thwip burst wherever you click, skipped on interactive elements)
document.addEventListener('click', e => {
  if (e.target.closest('input, textarea, button, a')) return;
  const shot = document.createElement('div');
  shot.className = 'web-shot';
  shot.style.left = e.clientX + 'px';
  shot.style.top = e.clientY + 'px';
  shot.innerHTML = `<svg width="46" height="46" viewBox="0 0 46 46">
    <g stroke="#e0212b" stroke-width="1.4" fill="none" opacity="0.9">
      <circle cx="23" cy="23" r="6"/>
      <circle cx="23" cy="23" r="13"/>
      <circle cx="23" cy="23" r="20"/>
      <line x1="23" y1="3" x2="23" y2="43"/>
      <line x1="3" y1="23" x2="43" y2="23"/>
      <line x1="9" y1="9" x2="37" y2="37"/>
      <line x1="37" y1="9" x2="9" y2="37"/>
    </g>
  </svg>`;
  document.body.appendChild(shot);
  setTimeout(() => shot.remove(), 650);
});

// animated web background — nodes drift and connect with lines, plus a mouse-follow effect
const webCanvas = document.getElementById('webCanvas');
if (webCanvas) {
  const ctx = webCanvas.getContext('2d');
  let nodes = [];
  let mouse = { x: null, y: null };
  const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

  function resizeCanvas() {
    webCanvas.width = window.innerWidth;
    webCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function createNode() {
    return {
      x: Math.random() * webCanvas.width,
      y: Math.random() * webCanvas.height,
      r: Math.random() * 1.6 + 0.6,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      pulse: Math.random() * Math.PI * 2,
      isRed: Math.random() > 0.5
    };
  }

  const NODE_COUNT = window.innerWidth < 768 ? 45 : 85;
  for (let i = 0; i < NODE_COUNT; i++) nodes.push(createNode());

  const MAX_DIST = 150;

  // occasional shooting "web-swing" burst across the screen
  let bursts = [];
  function spawnBurst() {
    const fromLeft = Math.random() > 0.5;
    const y = Math.random() * webCanvas.height * 0.7;
    bursts.push({
      x: fromLeft ? -50 : webCanvas.width + 50,
      y,
      vx: fromLeft ? (4 + Math.random() * 3) : -(4 + Math.random() * 3),
      vy: (Math.random() - 0.5) * 1.5,
      life: 0,
      maxLife: 90,
      isRed: Math.random() > 0.5,
      trail: []
    });
  }
  setInterval(spawnBurst, 4500);

  function drawBursts() {
    bursts.forEach(b => {
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 18) b.trail.shift();
      b.x += b.vx;
      b.y += b.vy;
      b.life++;

      const color = b.isRed ? '224, 33, 43' : '77, 107, 255';
      for (let t = 0; t < b.trail.length - 1; t++) {
        const p1 = b.trail[t], p2 = b.trail[t + 1];
        const alpha = (t / b.trail.length) * 0.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${color}, ${alpha})`;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    });
    bursts = bursts.filter(b => b.life < b.maxLife && b.x > -100 && b.x < webCanvas.width + 100);
  }

  function drawWeb() {
    ctx.clearRect(0, 0, webCanvas.width, webCanvas.height);
    const light = isLight();
    const lineBase = light ? '13,13,20' : '233,233,240';

    // connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * (light ? 0.12 : 0.16);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${lineBase}, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
      // link to mouse for a "web-shooter" feel
      if (mouse.x !== null) {
        const a = nodes[i];
        const dx = a.x - mouse.x, dy = a.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const opacity = (1 - dist / 180) * 0.35;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(224, 33, 43, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // nodes
    nodes.forEach(n => {
      n.pulse += 0.02;
      const glow = (Math.sin(n.pulse) + 1) / 2;
      const color = n.isRed ? `rgba(224, 33, 43, ${0.25 + glow * 0.35})` : `rgba(77, 107, 255, ${0.25 + glow * 0.35})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + glow * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      n.x += n.dx;
      n.y += n.dy;
      if (n.x < 0 || n.x > webCanvas.width) n.dx *= -1;
      if (n.y < 0 || n.y > webCanvas.height) n.dy *= -1;
    });

    drawBursts();

    requestAnimationFrame(drawWeb);
  }
  drawWeb();
}

// hero dimension badge — cycling "earth-xxx" glitch
const dimCodeEl = document.getElementById('dimCode');
if (dimCodeEl) {
  const dims = ['EARTH-616', 'EARTH-199999', 'EARTH-42', 'EARTH-838', 'EARTH-65', 'EARTH-616'];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % dims.length;
    dimCodeEl.classList.add('glitching');
    setTimeout(() => {
      dimCodeEl.textContent = dims[idx];
    }, 90);
    setTimeout(() => { dimCodeEl.classList.remove('glitching'); }, 300);
  }, 3200);
}

// hero visual parallax on mouse move
const heroVisual = document.querySelector('.hero-visual');
if (heroVisual) {
  document.querySelector('.hero')?.addEventListener('mousemove', e => {
    const rect = heroVisual.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    heroVisual.style.transform = `translate(${dx * 18}px, ${dy * 18}px)`;
  });
  document.querySelector('.hero')?.addEventListener('mouseleave', () => {
    heroVisual.style.transform = 'translate(0,0)';
  });
}

// button ripple effect
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
  });
});

// stagger index for scroll-reveal groups
document.querySelectorAll('.services-grid, .projects-grid, .features-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.style.setProperty('--i', i);
  });
});

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// project card tilt + dimension-jump glitch on enter
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -6;
    const rotateY = ((x - cx) / cx) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseenter', () => {
    const title = card.querySelector('.project-title');
    if (title) {
      title.classList.add('glitching');
      setTimeout(() => title.classList.remove('glitching'), 300);
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });
});

// theme toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const saved = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', saved);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.style.transform = 'scale(0.9)';
  setTimeout(() => { themeToggle.style.transform = 'scale(1)'; }, 150);
});

// mobile nav
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileToggle.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const id = this.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      const navH = document.querySelector('.navbar').offsetHeight;
      window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
    }
  });
});

// highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
  const scrollY = window.scrollY + 100;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
      });
    }
  });
}
window.addEventListener('scroll', updateActiveLink);

// back to top
const backBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backBtn.classList.toggle('visible', window.scrollY > 500);
});
backBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// scroll reveal
function initScrollReveal() {
  const items = document.querySelectorAll('.animate-on-scroll');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(el => observer.observe(el));
  setTimeout(() => {
    items.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
  }, 100);
}
document.addEventListener('DOMContentLoaded', initScrollReveal);
window.addEventListener('load', initScrollReveal);

// skill bars animation
function animateSkills() {
  const skillItems = document.querySelectorAll('.skill-item');
  if (!('IntersectionObserver' in window)) {
    skillItems.forEach(item => {
      item.classList.add('visible');
      const bar = item.querySelector('.skill-progress');
      if (bar) bar.style.width = bar.getAttribute('data-progress') + '%';
    });
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target.querySelector('.skill-progress');
        const val = bar ? bar.getAttribute('data-progress') : 0;
        entry.target.classList.add('visible');
        setTimeout(() => { if (bar) bar.style.width = val + '%'; }, 200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  skillItems.forEach(item => observer.observe(item));
}
document.addEventListener('DOMContentLoaded', animateSkills);
window.addEventListener('load', animateSkills);

// contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const msgInput = document.getElementById('message');
  const submitBtn = contactForm.querySelector('.btn-submit');
  const formMsg = document.getElementById('formMessage');
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const checkName = v => !v.trim() ? 'Name is required' : v.trim().length < 2 ? 'Too short' : '';
  const checkEmail = v => !v.trim() ? 'Email is required' : !emailReg.test(v) ? 'Enter a valid email' : '';
  const checkMsg = v => !v.trim() ? 'Message is required' : v.trim().length < 10 ? 'Message too short' : '';

  function attachValidation(input, errorEl, fn) {
    input.addEventListener('blur', () => {
      const err = fn(input.value);
      errorEl.textContent = err;
      input.style.borderColor = err ? '#e0212b' : 'var(--spidey-blue-light)';
    });
    input.addEventListener('input', () => {
      if (errorEl.textContent) {
        const err = fn(input.value);
        errorEl.textContent = err;
        if (!err) input.style.borderColor = 'var(--spidey-blue-light)';
      }
    });
  }

  attachValidation(nameInput, document.getElementById('nameError'), checkName);
  attachValidation(emailInput, document.getElementById('emailError'), checkEmail);
  attachValidation(msgInput, document.getElementById('messageError'), checkMsg);

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const e1 = checkName(nameInput.value);
    const e2 = checkEmail(emailInput.value);
    const e3 = checkMsg(msgInput.value);

    document.getElementById('nameError').textContent = e1;
    document.getElementById('emailError').textContent = e2;
    document.getElementById('messageError').textContent = e3;

    if (e1 || e2 || e3) {
      if (e1) nameInput.style.borderColor = '#e0212b';
      if (e2) emailInput.style.borderColor = '#e0212b';
      if (e3) msgInput.style.borderColor = '#e0212b';
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    formMsg.style.display = 'none';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      if (res.ok) {
        formMsg.textContent = "✓ Signal received! I'll swing back within 24 hours.";
        formMsg.className = 'form-message success';
        formMsg.style.display = 'block';
        contactForm.reset();
        [nameInput, emailInput, msgInput].forEach(i => { i.style.borderColor = 'transparent'; });
        setTimeout(() => { formMsg.style.display = 'none'; }, 5000);
      } else {
        formMsg.textContent = '✗ Something went wrong. Try emailing me directly.';
        formMsg.className = 'form-message error';
        formMsg.style.display = 'block';
      }
    } catch (err) {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      formMsg.textContent = '✗ Network error. Check your connection.';
      formMsg.className = 'form-message error';
      formMsg.style.display = 'block';
    }
  });
}

// typed.js — hero title animation
if (typeof Typed !== 'undefined') {
  const el = document.querySelector('.typing-text');
  if (el) {
    new Typed('.typing-text', {
      strings: ['Multiversal Experiences', 'Fast Landing Pages', 'Clean UI Dimensions', 'Modern Portfolios'],
      typeSpeed: 65,
      backSpeed: 38,
      backDelay: 2000,
      loop: true,
      cursorChar: '|'
    });
  }
}

// magnetic buttons
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    setTimeout(() => { btn.style.transition = ''; }, 500);
  });
});

// counter animation for hero stats
function animateCounter(el, target, duration) {
  if (isNaN(target)) return;
  const suffix = el.dataset.original.replace(/[0-9]/g, '');
  let current = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
  }, 16);
}

function initCounters() {
  const nums = document.querySelectorAll('.stat-number');
  nums.forEach(el => { el.dataset.original = el.textContent.trim(); });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        const raw = entry.target.dataset.original;
        const val = parseInt(raw.replace(/\D/g, ''), 10);
        animateCounter(entry.target, val, 2000);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  nums.forEach(el => observer.observe(el));
}
document.addEventListener('DOMContentLoaded', initCounters);

// debounce scroll
function debounce(fn, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
window.addEventListener('scroll', debounce(updateActiveLink, 50));

// misc
document.addEventListener('DOMContentLoaded', () => { document.body.style.opacity = '1'; });
window.addEventListener('load', () => { document.body.classList.add('loaded'); });

const yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

document.addEventListener('keydown', e => { if (e.key === 'Tab') document.body.classList.add('keyboard-nav'); });
document.addEventListener('mousedown', () => document.body.classList.remove('keyboard-nav'));

console.log('%c🕷️ Hey there, traveler!', 'color: #e0212b; font-size: 18px; font-weight: bold;');
console.log('%cYou\'ve breached into Earth-616 — let\'s connect → ankitdevx.26@gmail.com', 'color: #fff; background: #2547d1; padding: 8px 12px; border-radius: 4px;');
