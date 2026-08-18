/**
 * TerraVita Research — Main Script
 * Header scroll, mobile nav, smooth scroll, reveal animations,
 * gallery lightbox, contact form validation
 */

(function () {
  'use strict';

  /* ---- DOM References ---- */
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');
  const revealElements = document.querySelectorAll('.reveal');
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formReset = document.getElementById('form-reset');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const galleryTriggers = document.querySelectorAll('.gallery-item__trigger');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header Scroll Behavior ---- */
  function updateHeader() {
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      header.classList.add('header--scrolled');
      header.classList.remove('header--transparent');
    } else {
      header.classList.remove('header--scrolled');
      header.classList.add('header--transparent');
    }
  }

  header.classList.add('header--transparent');
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---- Mobile Navigation ---- */
  function toggleMobileNav(open) {
    const isOpen = open !== undefined ? open : hamburger.getAttribute('aria-expanded') !== 'true';
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileNav.hidden = !isOpen;
    mobileNav.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMobileNav());

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMobileNav(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      toggleMobileNav(false);
      hamburger.focus();
    }
  });

  /* ---- Active Nav Link on Scroll ---- */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    let current = '';

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  /* ---- Smooth Scroll for Anchor Links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });

      if (hamburger.getAttribute('aria-expanded') === 'true') {
        toggleMobileNav(false);
      }
    });
  });

  /* ---- Scroll Reveal Animations ---- */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

  /* ---- Hero Immediate Reveal ---- */
  const heroReveals = document.querySelectorAll('.hero .reveal');
  if (heroReveals.length) {
    requestAnimationFrame(() => {
      setTimeout(() => {
        heroReveals.forEach(el => el.classList.add('is-visible'));
      }, prefersReducedMotion ? 0 : 200);
    });
  }

  /* ---- Gallery Lightbox ---- */
  let lastFocusedElement = null;

  function openLightbox(src, caption) {
    lastFocusedElement = document.activeElement;
    lightboxImage.src = src;
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
    lightbox.hidden = false;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.hidden = true;
    lightboxImage.src = '';
    document.body.style.overflow = '';
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  galleryTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-lightbox');
      const caption = trigger.getAttribute('data-caption');
      openLightbox(src, caption);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });

  /* ---- Contact Form Validation ---- */
  const validators = {
    fullname: (value) => {
      if (!value.trim()) return 'Please enter your full name.';
      if (value.trim().length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: (value) => {
      if (!value.trim()) return 'Please enter your email address.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
      return '';
    },
    message: (value) => {
      if (!value.trim()) return 'Please enter your message.';
      if (value.trim().length < 10) return 'Message must be at least 10 characters.';
      return '';
    }
  };

  function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    if (input) input.classList.toggle('error', !!message);
    if (errorEl) errorEl.textContent = message;
  }

  function validateField(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input || !validators[fieldId]) return true;
    const error = validators[fieldId](input.value);
    showError(fieldId, error);
    return !error;
  }

  if (contactForm) {
    ['fullname', 'email', 'message'].forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (input) {
        input.addEventListener('blur', () => validateField(fieldId));
        input.addEventListener('input', () => {
          if (input.classList.contains('error')) validateField(fieldId);
        });
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;
      ['fullname', 'email', 'message'].forEach(fieldId => {
        if (!validateField(fieldId)) isValid = false;
      });

      if (!isValid) {
        const firstError = contactForm.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      contactForm.hidden = true;
      formSuccess.hidden = false;
    });
  }

  if (formReset) {
    formReset.addEventListener('click', () => {
      contactForm.reset();
      ['fullname', 'email', 'message'].forEach(fieldId => showError(fieldId, ''));
      formSuccess.hidden = true;
      contactForm.hidden = false;
      contactForm.querySelector('#fullname').focus();
    });
  }
})();
