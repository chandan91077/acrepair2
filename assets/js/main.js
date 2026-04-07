/* ============================================================
   AirCool AC Repair – Main JavaScript
   ============================================================ */

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  /* Scroll-to-top button */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('show');
  } else {
    scrollTopBtn.classList.remove('show');
  }
});

/* ── Mobile hamburger menu ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
});
// Close on nav link click
document.querySelectorAll('#mobileNav a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
  });
});

/* ── Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a, #mobileNav a');
function updateActiveNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) {
      current = sec.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}
window.addEventListener('scroll', updateActiveNav);

/* ── Scroll to top ── */
document.getElementById('scrollTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── FAQ Accordion ── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    // Open clicked
    if (!isOpen) {
      item.classList.add('open');
    }
  });
});

/* ── Animate on scroll (Intersection Observer) ── */
const animateEls = document.querySelectorAll(
  '.service-card, .review-card, .faq-item, .contact-item, .about-list li'
);
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.55s ease both';
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
animateEls.forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

/* ── Counter animation (hero stats) ── */
function animateCounter(el, target, suffix = '') {
  let count = 0;
  const step = Math.ceil(target / 60);
  const interval = setInterval(() => {
    count += step;
    if (count >= target) {
      count = target;
      clearInterval(interval);
    }
    el.textContent = count + suffix;
  }, 22);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.hero-stat-num').forEach(el => {
        const raw = el.dataset.target;
        const num = parseInt(raw);
        const suffix = raw.replace(num, '');
        animateCounter(el, num, suffix);
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const heroStatsEl = document.querySelector('.hero-stats');
if (heroStatsEl) statsObserver.observe(heroStatsEl);

/* ── Contact form via Vercel API (owner + customer response) ── */
const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const CONTACT_API_ENDPOINTS = isLocalHost
  ? [
      'http://localhost:3000/api/send-mail',
      '/api/send-mail',
      '/ac-repair-service/api/send-mail'
    ]
  : [
      '/api/send-mail',
      'api/send-mail',
      './api/send-mail',
      '/ac-repair-service/api/send-mail'
    ];

function getStatusNodes(form) {
  const isPopup = form.id === 'popupServiceForm';
  return {
    successMsg: isPopup ? document.getElementById('popup-form-success') : document.getElementById('form-success'),
    errorMsg: isPopup ? document.getElementById('popup-form-error') : document.getElementById('form-error')
  };
}

function resetStatus(form) {
  const { successMsg, errorMsg } = getStatusNodes(form);
  if (successMsg) successMsg.style.display = 'none';
  if (errorMsg) {
    errorMsg.style.display = 'none';
    errorMsg.textContent = '';
  }
}

function showSuccess(form, text) {
  const { successMsg } = getStatusNodes(form);
  if (successMsg) {
    successMsg.textContent = text;
    successMsg.style.display = 'block';
  }
}

function showError(form, text) {
  const { errorMsg } = getStatusNodes(form);
  if (errorMsg) {
    errorMsg.textContent = text;
    errorMsg.style.display = 'block';
  }
}

async function sendServiceEmails(data) {
  let lastError = null;
  const tried = new Set();

  for (const endpoint of CONTACT_API_ENDPOINTS) {
    const url = endpoint.trim();
    if (tried.has(url)) {
      continue;
    }
    tried.add(url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok && result.success) {
        return;
      }

      lastError = new Error(result.message || `API error ${response.status} at ${url}`);
    } catch (error) {
      lastError = error;
    }
  }

  if (isLocalHost) {
    throw new Error(
      'Local static server cannot run /api. Run with Vercel dev on localhost:3000 or test on deployed Vercel URL.'
    );
  }

  throw lastError || new Error('Unable to reach mail API');
}

function attachServiceFormHandler(form) {
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.form-submit');
    const originalBtnHtml = submitBtn.innerHTML;
    resetStatus(form);

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      name: form.querySelector('[name="name"]').value.trim(),
      phone: form.querySelector('[name="phone"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      service: form.querySelector('[name="service"]').value,
      source: form.id === 'popupServiceForm' ? 'Popup Form' : 'Contact Section Form'
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';

    try {
      await sendServiceEmails(data);
      showSuccess(form, 'Request sent successfully. A confirmation has been emailed to you.');
      form.reset();

      if (form.id === 'popupServiceForm') {
        setTimeout(() => {
          closeLeadPopup();
        }, 1200);
      }
    } catch (err) {
      const reason = err && err.message ? ` (${err.message})` : '';
      showError(form, `Unable to send request now${reason}. Please call 8200205795.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  });
}

attachServiceFormHandler(document.getElementById('contactForm'));
attachServiceFormHandler(document.getElementById('popupServiceForm'));

/* ── Scroll popup + bottom bar controls ── */
const leadPopup = document.getElementById('leadPopup');
const openPopupBtn = document.getElementById('openPopupForm');
const closePopupBtn = document.getElementById('closePopupForm');
const closeQuickBookBarBtn = document.getElementById('closeQuickBookBar');
const quickBookBar = document.getElementById('quickBookBar');
let hasShownLeadPopup = false;

function openLeadPopup() {
  if (!leadPopup) return;
  leadPopup.classList.add('open');
  leadPopup.setAttribute('aria-hidden', 'false');
  document.body.classList.add('popup-open');
}

function closeLeadPopup() {
  if (!leadPopup) return;
  leadPopup.classList.remove('open');
  leadPopup.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('popup-open');
}

if (openPopupBtn) {
  openPopupBtn.addEventListener('click', openLeadPopup);
}

if (closePopupBtn) {
  closePopupBtn.addEventListener('click', closeLeadPopup);
}

if (leadPopup) {
  leadPopup.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-popup="true"]')) {
      closeLeadPopup();
    }
  });
}

if (closeQuickBookBarBtn && quickBookBar) {
  closeQuickBookBarBtn.addEventListener('click', () => {
    quickBookBar.style.display = 'none';
  });
}

setTimeout(() => {
  if (!hasShownLeadPopup) {
    hasShownLeadPopup = true;
    openLeadPopup();
  }
}, 5000);

/* ── Smooth scrolling for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Booking form smooth CTA ── */
document.querySelectorAll('[data-scroll]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── Marquee duplicate for seamless loop ── */
const track = document.querySelector('.areas-track');
if (track) {
  const clone = track.innerHTML;
  track.innerHTML += clone;
}
