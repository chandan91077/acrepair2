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

/* ── Contact form via Web3Forms (SMTP email) ── */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.form-submit');
    const successMsg = document.getElementById('form-success');
    const errorMsg   = document.getElementById('form-error');

    // Reset messages
    successMsg.style.display = 'none';
    errorMsg.style.display   = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Sending...';

    // Gather form data
    const formData = new FormData(contactForm);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        successMsg.style.display = 'block';
        contactForm.reset();
        submitBtn.innerHTML = '✅ Message Sent!';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '📤 Send Message';
        }, 4000);
      } else {
        throw new Error(result.message || 'Submission failed.');
      }
    } catch (err) {
      errorMsg.style.display = 'block';
      errorMsg.textContent = '❌ Error: ' + err.message + '. Please try calling us directly.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '📤 Send Message';
    }
  });
}

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
