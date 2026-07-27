/* =========================================================
   TRADEXPO.INC — Shared Script
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Navbar: scroll state, mobile toggle, active link ---------- */
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  function onScrollNav(){
    if (window.scrollY > 12) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      const expanded = navToggle.classList.contains('open');
      navToggle.setAttribute('aria-expanded', expanded);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    }));
  }

  // Highlight active nav link based on current page
  const current = (location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === current) link.classList.add('active');
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length){
    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1600;
      const start = performance.now();
      function step(now){
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window){
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting){
            animate(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(c => cio.observe(c));
    } else {
      counters.forEach(animate);
    }
  }

  /* ---------- Testimonial carousel ---------- */
  const slides = document.querySelectorAll('.testimonial');
  const dotsWrap = document.querySelector('.t-dots');
  if (slides.length){
    let active = 0;
    let dots = [];
    if (dotsWrap){
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        if (i === 0) b.classList.add('active');
        b.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
        b.addEventListener('click', () => show(i));
        dotsWrap.appendChild(b);
        dots.push(b);
      });
    }
    function show(i){
      slides[active].classList.remove('active');
      if (dots[active]) dots[active].classList.remove('active');
      active = (i + slides.length) % slides.length;
      slides[active].classList.add('active');
      if (dots[active]) dots[active].classList.add('active');
    }
    slides[0].classList.add('active');
    let auto = setInterval(() => show(active + 1), 6000);
    const track = document.querySelector('.testimonial-track');
    if (track){
      track.addEventListener('mouseenter', () => clearInterval(auto));
      track.addEventListener('mouseleave', () => { auto = setInterval(() => show(active + 1), 6000); });
    }
  }

  /* ---------- Product filter (products.html) ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('[data-category]');
  if (filterBtns.length){
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        productCards.forEach(card => {
          const match = filter === 'all' || card.getAttribute('data-category') === filter;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Back to top ---------- */
  const backBtn = document.querySelector('.back-to-top');
  if (backBtn){
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) backBtn.classList.add('show');
      else backBtn.classList.remove('show');
    }, { passive: true });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('contact-form');
  if (form){
    const status = document.getElementById('form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;

      const fields = {
        name: { el: form.querySelector('#name'), test: v => v.trim().length >= 2, msg: 'Please enter your full name.' },
        email: { el: form.querySelector('#email'), test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Please enter a valid email address.' },
        phone: { el: form.querySelector('#phone'), test: v => v.trim().length === 0 || /^[\d\s()+\-]{7,}$/.test(v), msg: 'Please enter a valid phone number.' },
        subject: { el: form.querySelector('#subject'), test: v => v.trim().length > 0, msg: 'Please select a subject.' },
        message: { el: form.querySelector('#message'), test: v => v.trim().length >= 10, msg: 'Message should be at least 10 characters.' }
      };

      Object.values(fields).forEach(f => {
        if (!f.el) return;
        const wrap = f.el.closest('.field');
        if (!f.test(f.el.value)){
          wrap.classList.add('error');
          valid = false;
        } else {
          wrap.classList.remove('error');
        }
      });

      if (valid){
        status.textContent = 'Thank you — your message has been sent. Our team will respond within one business day.';
        status.classList.add('show', 'success');
        form.reset();
      } else {
        status.textContent = 'Please correct the highlighted fields and try again.';
        status.classList.add('show');
        status.classList.remove('success');
      }
    });

    form.querySelectorAll('input, textarea, select').forEach(el => {
      el.addEventListener('input', () => el.closest('.field').classList.remove('error'));
    });
  }
});
