// ============================================================
// QAF – Utility Functions
// ============================================================

const QAF = window.QAF || {};

// Toast Notification System
QAF.toast = {
  container: null,
  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.id = 'toast-container';
    document.body.appendChild(this.container);
  },
  show(title, message, type = 'success', duration = 4000) {
    this.init();
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>`;
    this.container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  success(title, msg) { this.show(title, msg, 'success'); },
  error(title, msg) { this.show(title, msg, 'error'); },
  warning(title, msg) { this.show(title, msg, 'warning'); },
  info(title, msg) { this.show(title, msg, 'info'); }
};

// Modal System
QAF.modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => {
      m.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
};

// Form Validation
QAF.validate = {
  email(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
  phone(v) { return /^[\d\s+\-()]{8,15}$/.test(v); },
  required(v) { return v && v.toString().trim().length > 0; },
  minLength(v, n) { return v && v.length >= n; },
  maxLength(v, n) { return v && v.length <= n; },
  match(v1, v2) { return v1 === v2; },
  number(v) { return !isNaN(v) && Number(v) >= 0; },

  form(formEl) {
    let valid = true;
    formEl.querySelectorAll('[data-validate]').forEach(input => {
      const rules = input.dataset.validate.split('|');
      const group = input.closest('.form-group');
      let fieldValid = true;

      rules.forEach(rule => {
        const [name, param] = rule.split(':');
        const val = input.value;
        switch (name) {
          case 'required': if (!this.required(val)) fieldValid = false; break;
          case 'email': if (val && !this.email(val)) fieldValid = false; break;
          case 'phone': if (val && !this.phone(val)) fieldValid = false; break;
          case 'min': if (!this.minLength(val, parseInt(param))) fieldValid = false; break;
          case 'max': if (!this.maxLength(val, parseInt(param))) fieldValid = false; break;
        }
      });

      if (group) {
        group.classList.toggle('error', !fieldValid);
      }
      if (!fieldValid) valid = false;
    });
    return valid;
  }
};

// Sanitize Input (XSS Prevention)
QAF.sanitize = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Generate Unique ID
QAF.generateId = (prefix = 'QAF') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = prefix + '-';
  for (let i = 0; i < 6; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
};

// Debounce
QAF.debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};

// Throttle
QAF.throttle = (fn, limit = 300) => {
  let waiting = false;
  return (...args) => {
    if (!waiting) { fn(...args); waiting = true; setTimeout(() => waiting = false, limit); }
  };
};

// Format Date
QAF.formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Countdown Timer
QAF.countdown = (targetDate, elementId) => {
  const el = document.getElementById(elementId);
  if (!el) return;

  const update = () => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const diff = target - now;

    if (diff <= 0) {
      el.innerHTML = '<span class="countdown-ended">Event Started!</span>';
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    el.innerHTML = `
      <div class="countdown-item"><span class="countdown-value">${days}</span><span class="countdown-label">Days</span></div>
      <div class="countdown-sep">:</div>
      <div class="countdown-item"><span class="countdown-value">${hours.toString().padStart(2,'0')}</span><span class="countdown-label">Hours</span></div>
      <div class="countdown-sep">:</div>
      <div class="countdown-item"><span class="countdown-value">${minutes.toString().padStart(2,'0')}</span><span class="countdown-label">Minutes</span></div>
      <div class="countdown-sep">:</div>
      <div class="countdown-item"><span class="countdown-value">${seconds.toString().padStart(2,'0')}</span><span class="countdown-label">Seconds</span></div>`;
  };

  update();
  setInterval(update, 1000);
};

// Animated Counter
QAF.animateCounter = (element, target, duration = 2000) => {
  let start = 0;
  const startTime = performance.now();
  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

// Scroll Reveal Observer
QAF.initScrollReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el));
};

// Theme Toggle
QAF.theme = {
  current: localStorage.getItem('qaf-theme') || 'light',
  init() {
    document.documentElement.setAttribute('data-theme', this.current);
  },
  toggle() {
    this.current = this.current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', this.current);
    localStorage.setItem('qaf-theme', this.current);
  }
};

// Navbar Scroll Handler
QAF.initNavbar = () => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = QAF.throttle(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, 100);
  window.addEventListener('scroll', onScroll);

  // Mobile menu toggle
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.navbar-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('open');
    });
  }
};

// Smooth Scroll to anchors
QAF.initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      try {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
          document.querySelector('.navbar-nav')?.classList.remove('open');
          document.querySelector('.menu-toggle')?.classList.remove('active');
        }
      } catch(err) { /* invalid selector, ignore */ }
    });
  });
};

// Lazy Load Images
QAF.initLazyLoad = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
};

// Init all on DOM ready
QAF.init = () => {
  QAF.theme.init();
  QAF.initNavbar();
  QAF.initSmoothScroll();
  QAF.initScrollReveal();
  QAF.initLazyLoad();
};

document.addEventListener('DOMContentLoaded', QAF.init);
window.QAF = QAF;
