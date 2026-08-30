const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile nav drawer
const navToggle = document.getElementById('navToggle');
const navDrawer = document.getElementById('navDrawer');
if (navToggle && navDrawer) {
  navToggle.addEventListener('click', () => {
    const isOpen = navDrawer.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navDrawer.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navDrawer.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }
}

// Hero stat count-up (runs once, real numbers only)
const statEls = document.querySelectorAll('.stat-num[data-count-to]');
if (statEls.length && !prefersReducedMotion) {
  const animateStat = (el) => {
    const target = parseFloat(el.getAttribute('data-count-to'));
    const decimals = parseInt(el.getAttribute('data-count-decimal') || '0', 10);
    const duration = 1100;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = decimals ? value.toFixed(decimals).replace('.', ',') : Math.round(value).toString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateStat(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  statEls.forEach((el) => statObserver.observe(el));
} else {
  statEls.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-count-to'));
    const decimals = parseInt(el.getAttribute('data-count-decimal') || '0', 10);
    el.textContent = decimals ? target.toFixed(decimals).replace('.', ',') : target.toString();
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach((item) => {
  const btn = item.querySelector('.faq-q');
  const answer = item.querySelector('.faq-a');

  const setHeight = () => {
    answer.style.maxHeight = item.classList.contains('is-open') ? answer.scrollHeight + 'px' : '0px';
  };
  setHeight();

  btn.addEventListener('click', () => {
    document.querySelectorAll('.faq-item').forEach((other) => {
      if (other !== item) {
        other.classList.remove('is-open');
        other.querySelector('.faq-a').style.maxHeight = '0px';
      }
    });
    item.classList.toggle('is-open');
    setHeight();
  });
});

// Transformations rail: build progress dots + active-card tracking
const rail = document.getElementById('transformRail');
const progress = document.getElementById('transformProgress');
if (rail && progress) {
  const cards = Array.from(rail.querySelectorAll('.transform-card'));
  cards.forEach(() => {
    const dot = document.createElement('span');
    progress.appendChild(dot);
  });
  const dots = Array.from(progress.children);

  const setActive = () => {
    const railRect = rail.getBoundingClientRect();
    const railCenter = railRect.left + railRect.width / 2;
    let closestIndex = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - railCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });
    cards.forEach((card, i) => card.classList.toggle('is-active', i === closestIndex));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === closestIndex));
  };

  setActive();
  let ticking = false;
  rail.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        setActive();
        ticking = false;
      });
      ticking = true;
    }
  });
  window.addEventListener('resize', setActive);

  const prevBtn = document.getElementById('transformPrev');
  const nextBtn = document.getElementById('transformNext');
  const scrollByCard = (dir) => {
    const card = rail.querySelector('.transform-card');
    if (!card) return;
    const gap = 24;
    rail.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };
  prevBtn?.addEventListener('click', () => scrollByCard(-1));
  nextBtn?.addEventListener('click', () => scrollByCard(1));
}
