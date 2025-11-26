// JS flag for CSS reveals
document.documentElement.classList.add('js-enabled');

/* ------------------ LENIS: smooth scroll + mobile parallax for Services & Values ------------------ */

var lenisInstance = null;
var servicesParallaxItems = [];
var valuesParallaxCards = [];
var valuesParallaxSection = null;

function initLenis() {
  if (typeof Lenis === 'undefined') {
    console.warn('Lenis not loaded – skipping smooth scroll + parallax');
    return;
  }
  if (lenisInstance) return; // already initialized

  // Cache elements used for parallax
  servicesParallaxItems = Array.prototype.slice.call(
    document.querySelectorAll('#services .service-item')
  );
  valuesParallaxCards = Array.prototype.slice.call(
    document.querySelectorAll('#values .value-card')
  );
  valuesParallaxSection = document.querySelector('#values');

  // Initialize Lenis
  lenisInstance = new Lenis({
    smoothWheel: true,
    smoothTouch: true,
    lerp: 0.12,   // smoothness
    autoRaf: true // Lenis handles requestAnimationFrame
  });

  // Use Lenis scroll event to drive parallax
  lenisInstance.on('scroll', handleLenisScroll);

  

  // Initial state
  handleLenisScroll({ scroll: 0 });
}

function handleLenisScroll(e) {
  var isMobile = window.innerWidth < 768;

  // On desktop, clear transforms so hover effects remain crisp
  if (!isMobile) {
    servicesParallaxItems.forEach(function (el) {
      el.style.transform = '';
    });
    valuesParallaxCards.forEach(function (el) {
      el.style.transform = '';
    });
    if (valuesParallaxSection) {
      valuesParallaxSection.style.backgroundPositionY = '';
    }
    return;
  }

  if (!servicesParallaxItems.length && !valuesParallaxCards.length) return;

  var vh = window.innerHeight || 1;

  // SERVICES: subtle vertical parallax per card
  servicesParallaxItems.forEach(function (el, index) {
    var rect = el.getBoundingClientRect();
    var elementCenter = rect.top + rect.height / 2;
    var distanceFromCenter = elementCenter - vh / 2;
    var normalized = distanceFromCenter / vh;   // roughly -1..1
    var depth = 0.5 + index * 0.06;            // slightly different depth per card
    var translateY = -normalized * 20 * depth; // max ~20px

    el.style.transform = 'translateY(' + translateY.toFixed(2) + 'px)';
  });

  // VALUES: similar parallax for cards
  valuesParallaxCards.forEach(function (el, index) {
    var rect = el.getBoundingClientRect();
    var elementCenter = rect.top + rect.height / 2;
    var distanceFromCenter = elementCenter - vh / 2;
    var normalized = distanceFromCenter / vh;
    var depth = 0.4 + index * 0.04;
    var translateY = -normalized * 18 * depth;

    el.style.transform = 'translateY(' + translateY.toFixed(2) + 'px)';
  });

  // VALUES: background parallax
  if (valuesParallaxSection) {
    var sectionRect = valuesParallaxSection.getBoundingClientRect();
    var bgOffset = sectionRect.top * -0.12; // small factor = subtle
    valuesParallaxSection.style.backgroundPositionY = bgOffset.toFixed(1) + 'px';
  }
}

/* ------------------ MOBILE NAVIGATION ------------------ */
var navToggle = document.querySelector('.nav-toggle');
var navMobile = document.getElementById('nav-mobile');
var navMobileClose = document.querySelector('.nav-mobile-close');
var mobileOverlay = document.querySelector('.mobile-menu-overlay');

var scrollLock = {
  locked: false,
  y: 0
};

function lockScroll() {
  if (scrollLock.locked) return;
  scrollLock.y = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + scrollLock.y + 'px';
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  scrollLock.locked = true;
}

function unlockScroll() {
  if (!scrollLock.locked) return;
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, scrollLock.y);
  scrollLock.locked = false;
}

function openMobileMenu() {
  if (!navMobile || !navToggle || !mobileOverlay) return;
  navMobile.classList.add('open');
  navToggle.classList.add('active');
  mobileOverlay.classList.add('active');
  navToggle.setAttribute('aria-expanded', 'true');
  lockScroll();
}

function closeMobileMenu() {
  if (!navMobile || !navToggle || !mobileOverlay) return;
  navMobile.classList.remove('open');
  navToggle.classList.remove('active');
  mobileOverlay.classList.remove('active');
  navToggle.setAttribute('aria-expanded', 'false');
  unlockScroll();
}

function isMobileMenuOpen() {
  return navMobile && navMobile.classList.contains('open');
}

if (navToggle && navMobile && mobileOverlay) {
  navToggle.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (isMobileMenuOpen()) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  if (navMobileClose) {
    navMobileClose.addEventListener('click', function (e) {
      e.preventDefault();
      closeMobileMenu();
    });
  }

  mobileOverlay.addEventListener('click', function (e) {
    e.preventDefault();
    closeMobileMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isMobileMenuOpen()) {
      closeMobileMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && isMobileMenuOpen()) {
      closeMobileMenu();
    }
  });
}

/* ------------------ Desktop Dropdown Parent Click Navigation ------------------ */
// Make desktop dropdown parent links clickable (navigate to their href)
var desktopDropdownLinks = document.querySelectorAll('.nav-desktop .has-dropdown > .nav-link');
desktopDropdownLinks.forEach(function (link) {
  link.addEventListener('click', function (e) {
    // Only handle on desktop
    if (window.innerWidth < 768) return;

    var href = link.getAttribute('href');
    if (href && href !== '#' && href.length > 1) {
      // Let the link navigate normally
      // The dropdown will still show on hover
      return;
    }
  });
});

/* ------------------ Mobile Submenu Toggle ------------------ */
var mobileSubmenuLinks = document.querySelectorAll('.has-submenu > .nav-mobile-link');
mobileSubmenuLinks.forEach(function (link) {
  // Add click handler for the arrow icon specifically
  var arrow = link.querySelector('.submenu-arrow');

  // Click on arrow = toggle submenu
  if (arrow) {
    arrow.addEventListener('click', function (e) {
      if (window.innerWidth >= 768) return;
      e.preventDefault();
      e.stopPropagation();

      var parent = link.closest('.has-submenu');
      if (!parent) return;

      var wasOpen = parent.classList.contains('open');

      document.querySelectorAll('.has-submenu.open').forEach(function (item) {
        if (item !== parent) item.classList.remove('open');
      });

      if (wasOpen) parent.classList.remove('open');
      else parent.classList.add('open');
    });
  }

  // Click on link itself = navigate to href
  link.addEventListener('click', function (e) {
    if (window.innerWidth >= 768) return;

    var href = link.getAttribute('href');
    var parent = link.closest('.has-submenu');

    // If parent is already open and we're clicking the link again, navigate
    if (parent && parent.classList.contains('open')) {
      // Let it navigate
      if (href && href !== '#' && href.length > 1) {
        // Will navigate and close menu
        return;
      }
    } else {
      // First click = open the submenu
      e.preventDefault();
      e.stopPropagation();

      if (!parent) return;

      document.querySelectorAll('.has-submenu.open').forEach(function (item) {
        if (item !== parent) item.classList.remove('open');
      });

      parent.classList.add('open');
    }
  });
});

/* ------------------ Close mobile menu on link click ------------------ */
var closeOnClickLinks = document.querySelectorAll(
  '.nav-mobile-link:not(.has-submenu .nav-mobile-link), .nav-mobile-sublink'
);
closeOnClickLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    if (window.innerWidth < 768 && isMobileMenuOpen()) {
      setTimeout(function () {
        closeMobileMenu();
      }, 300);
    }
  });
});

/* ------------------ Reveal on Scroll (IntersectionObserver) ------------------ */
var revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, {
  threshold: 0.1
});

document.querySelectorAll('.reveal').forEach(function (el) {
  revealObserver.observe(el);
});

/* ------------------ Hero Video ------------------ */
var heroVideo = document.querySelector('.hero-gradient-video');
if (heroVideo) {
  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  if (!prefersReduced) {
    heroVideo.muted = true;
    try {
      heroVideo.play();
    } catch (e) {}

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          try { heroVideo.play(); } catch (e) {}
        } else {
          heroVideo.pause();
        }
      });
    }, { threshold: 0.25 });
    io.observe(heroVideo);
  } else {
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
  }

  var vids = ['assets/loop.mp4', 'assets/loop-2.mp4'];
  heroVideo.src = vids[Math.floor(Math.random() * vids.length)];
  try { heroVideo.play(); } catch (e) {}
}

/* ------------------ Hero Text FX (Pure JS) ------------------ */
/* ------------------ HERO — GSAP + SplitType Typography ------------------ */
function initHeroTypography() {
  var hero = document.querySelector('.hero');
  if (!hero) return;

  // Respect reduced motion
  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  var eyebrowEl = hero.querySelector('.hero-eyebrow');
  var titleEl   = hero.querySelector('.hero-title');
  var leadEl    = hero.querySelector('.hero-lead');
  var ctaEl     = hero.querySelector('.hero-cta');
  var kpis      = hero.querySelectorAll('.kpi');

  // If SplitType or GSAP missing, just show everything
  if (!window.gsap || !window.SplitType || prefersReduced) {
    [eyebrowEl, titleEl, leadEl, ctaEl].forEach(function (el) {
      if (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
    kpis.forEach(function (k) {
      k.style.opacity = '1';
      k.style.transform = 'none';
    });
    return;
  }

  // Split text into characters/words
  var eyebrowSplit = eyebrowEl ? new SplitType(eyebrowEl, { types: 'chars' }) : null;
  var titleSplit   = titleEl   ? new SplitType(titleEl,   { types: 'words,chars' }) : null;

  // Start with invisible / lifted
  if (eyebrowEl) {
    gsap.set(eyebrowSplit.chars, { opacity: 0, y: 18 });
  }
  if (titleEl) {
    gsap.set(titleSplit.words, { opacity: 0, y: 48, rotateX: 12 });
  }
  if (leadEl) {
    gsap.set(leadEl, { opacity: 0, y: 20 });
  }
  if (ctaEl) {
    gsap.set(ctaEl, { opacity: 0, y: 24 });
  }
  kpis.forEach(function (k) {
    gsap.set(k, { opacity: 0, y: 30, scale: 0.96 });
  });

  // Timeline for smooth entrance
  var tl = gsap.timeline({
    defaults: { ease: 'power3.out' }
  });

  if (eyebrowSplit) {
    tl.to(eyebrowSplit.chars, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.025
    }, 0);
  }

  if (titleSplit) {
    tl.to(titleSplit.words, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.9,
      stagger: 0.04
    }, eyebrowSplit ? 0.05 : 0);
  }

  if (leadEl) {
    tl.to(leadEl, {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, '-=0.4');
  }

  if (ctaEl) {
    tl.to(ctaEl, {
      opacity: 1,
      y: 0,
      duration: 0.55
    }, '-=0.3');
  }

  if (kpis.length) {
    tl.to(kpis, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.65,
      stagger: 0.08
    }, '-=0.2');
  }
}


/* ------------------ KPI Counters (Pure JS) ------------------ */
function initKPICounters() {
  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  if (prefersReduced) return;

  var kpis = document.querySelectorAll('.kpi');
  if (!kpis.length) return;

  var kpiObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var kpi = entry.target;
        var num = kpi.querySelector('.kpi-num');
        var target = Number(num && num.getAttribute('data-target')) || 0;

        // Animate opacity and scale
        kpi.style.transition = 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        kpi.style.opacity = '1';
        kpi.style.transform = 'translateY(0) scale(1)';

        // Counter animation
        var start = 0;
        var duration = 2000;
        var startTime = Date.now();

        function animate() {
          var elapsed = Date.now() - startTime;
          var progress = Math.min(elapsed / duration, 1);

          // Easing function for smooth counting
          var easeProgress = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(start + (target - start) * easeProgress);

          num.textContent = current + '%';

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        }

        animate();
        kpiObserver.unobserve(kpi);
      }
    });
  }, { threshold: 0.2 });

  kpis.forEach(function (kpi) {
    kpi.style.opacity = '0';
    kpi.style.transform = 'translateY(20px) scale(0.95)';
    kpiObserver.observe(kpi);
  });
}

/* ------------------ Global Scroll Effects (Pure JS) ------------------ */
/* ------------------ Global Scroll Effects (Pure JS) ------------------ */
function initGlobalScrollEffects() {
  var header = document.querySelector('.site-header');

  // Header scroll effect
  if (header) {
    function checkHeaderScroll() {
      if (window.scrollY > 10) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    window.addEventListener('scroll', checkHeaderScroll, { passive: true });
    checkHeaderScroll();
  }

  // Helper: current header offset
  var headerOffset = function () {
    var h = 64;
    var headerEl = document.querySelector('.site-header');
    if (headerEl && headerEl.offsetHeight) {
      h = headerEl.offsetHeight;
    }
    return h + 8;
  };

  /* ------------------ SAME-PAGE ANCHOR LINKS (#section) ------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.length <= 1) return;

      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      if (lenisInstance && typeof lenisInstance.scrollTo === 'function') {
        lenisInstance.scrollTo(target, {
          offset: -headerOffset(),
          duration: 0.7
        });
      } else {
        var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ------------------ DEEP LINKS ON PAGE LOAD (about.html#values) ------------------ */
  window.addEventListener('load', function () {
    var hash = window.location.hash;
    if (!hash || hash === '#') return;

    var target = document.querySelector(hash);
    if (!target) return;

    // Increased delay to ensure Lenis is fully ready (especially important for cross-page navigation)
    setTimeout(function () {
      if (lenisInstance && typeof lenisInstance.scrollTo === 'function') {
        lenisInstance.scrollTo(target, {
          offset: -headerOffset(),
          duration: 0.8  // smooth scroll instead of immediate
        });
      } else {
        var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 600);
  });

  /* ------------------ OPTIONAL: handle hashchange on same page ------------------ */
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash;
    if (!hash || hash === '#') return;

    var target = document.querySelector(hash);
    if (!target) return;

    if (lenisInstance && typeof lenisInstance.scrollTo === 'function') {
      lenisInstance.scrollTo(target, {
        offset: -headerOffset(),
        duration: 0.7
      });
    } else {
      var y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });

  /* ------------------ Batch animate elements on scroll ------------------ */
  var elementsToAnimate = document.querySelectorAll(
    '.section-header h2, .section-header p, .pill, .card, .contact-form .form-row, .contact-form .form-actions, .contact-note'
  );

  var batchObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, index) {
      if (entry.isIntersecting) {
        var el = entry.target;
        setTimeout(function () {
          el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 60);
        batchObserver.unobserve(el);
      }
    });
  }, { threshold: 0.1 });

  elementsToAnimate.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    batchObserver.observe(el);
  });
}


/* ------------------ SERVICES Progress & Dock (Pure JS) ------------------ */
function initServicesProgress() {
  var section = document.querySelector('#services.services');
  var list = section ? section.querySelector('.services-list') : null;
  var rail = section ? section.querySelector('.services-rail') : null;
  var items = list ? Array.prototype.slice.call(list.querySelectorAll('.service-item')) : [];

  if (!section || !list || !rail || !items.length) {
    console.warn('Services section or items not found');
    return;
  }

  console.log('Found ' + items.length + ' service items');

  var total = items.length;
  var railCurrent = rail.querySelector('.services-progress .current');
  var railTotal = rail.querySelector('.services-progress .total');
  var railFill = rail.querySelector('.services-progress-bar .fill');
  if (railTotal) railTotal.textContent = String(total).padStart(2, '0');

  // Remove existing dock
  var existingDock = document.querySelector('.services-dock');
  if (existingDock && existingDock.parentNode) {
    existingDock.parentNode.removeChild(existingDock);
  }

  // Create dock
  var dock = document.createElement('div');
  dock.className = 'services-dock';
  dock.innerHTML =
    '<div class="count"><span class="current">01</span><span class="slash">/</span><span class="total">' +
    String(total).padStart(2, '0') +
    '</span></div>' +
    '<div class="bar"><span class="fill"></span></div>';
  document.body.appendChild(dock);

  var dockCurrent = dock.querySelector('.current');
  var dockFill = dock.querySelector('.fill');

  // Set initial state
  if (railFill) railFill.style.width = "0%";
  if (dockFill) dockFill.style.width = "0%";
  if (railCurrent) railCurrent.textContent = "01";
  if (dockCurrent) dockCurrent.textContent = "01";


  // Update dock visibility and progress
  function updateServicesProgress() {
    // Dock visibility (mobile only)
    if (window.innerWidth < 980) {
      var rect = section.getBoundingClientRect();
      var isInView = rect.top < window.innerHeight && rect.bottom > 0;

      if (isInView) {
        dock.classList.add('show');
      } else {
        dock.classList.remove('show');
      }
    } else {
      dock.classList.remove('show');
    }

    // Progress calculation
    var listRect = list.getBoundingClientRect();
    var viewportHeight = window.innerHeight;
    var scrollStart = listRect.top;
    var scrollEnd = listRect.bottom;
    var scrollRange = scrollEnd - scrollStart;
    var scrolled = viewportHeight - scrollStart;

    var progress = Math.max(0, Math.min(1, scrolled / scrollRange));
    var continuousPct = progress * 100;

    if (railFill) {
      railFill.style.width = continuousPct + '%';
      railFill.style.transition = 'width 0.1s linear';
    }
    if (dockFill) {
      dockFill.style.width = continuousPct + '%';
      dockFill.style.transition = 'width 0.1s linear';
    }

    var step = Math.min(Math.round(progress * (total - 1)) + 1, total);
    var label = String(step).padStart(2, '0');

    if (railCurrent) railCurrent.textContent = label;
    if (dockCurrent) dockCurrent.textContent = label;
  }

  // Update on scroll and resize
  window.addEventListener('scroll', updateServicesProgress, { passive: true });
  window.addEventListener('resize', function () {
    updateServicesProgress();

  });

  updateServicesProgress();
}

/* ------------------ VALUES — Card Hover Effects (scroll handled by Lenis/parallax) ------------------ */
/* ------------------ FAQ — Continuous Typewriter Effect for Heading ------------------ */
function initFAQTypewriter() {
  var heading = document.querySelector('.faq-typewriter[data-typewriter-texts]');

  if (!heading) {
    console.warn('FAQ typewriter heading not found');
    return;
  }

  var textsAttr = heading.getAttribute('data-typewriter-texts');
  var texts = [];

  try {
    texts = JSON.parse(textsAttr);
  } catch (e) {
    console.warn('Invalid JSON in data-typewriter-texts');
    return;
  }

  if (!texts || !texts.length) return;

  console.log('FAQ typewriter initialized with ' + texts.length + ' phrases');

  var currentIndex = 0;
  var isDeleting = false;
  var charIndex = 0;
  var typingSpeed = 80;      // ms per character when typing
  var deletingSpeed = 40;    // ms per character when deleting
  var pauseAfterTyping = 2000; // pause after finishing typing (2 seconds)
  var pauseAfterDeleting = 500; // pause after deleting before typing next

  // Create cursor element
  var cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor faq-cursor';
  cursor.textContent = '|';

  function type() {
    var currentText = texts[currentIndex];

    if (isDeleting) {
      // Deleting characters
      charIndex--;
      heading.textContent = currentText.substring(0, charIndex);
      heading.appendChild(cursor);

      if (charIndex === 0) {
        isDeleting = false;
        currentIndex = (currentIndex + 1) % texts.length; // Move to next text
        setTimeout(type, pauseAfterDeleting);
        return;
      }
      setTimeout(type, deletingSpeed);
    } else {
      // Typing characters
      charIndex++;
      heading.textContent = currentText.substring(0, charIndex);
      heading.appendChild(cursor);

      if (charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(type, pauseAfterTyping);
        return;
      }
      setTimeout(type, typingSpeed);
    }
  }

  // Start typing animation when FAQ section scrolls into view
  var faqObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // Clear initial text and start typing
        heading.textContent = '';
        heading.appendChild(cursor);
        charIndex = 0;
        isDeleting = false;
        currentIndex = 0;
        type();
        faqObserver.unobserve(heading);
      }
    });
  }, {
    threshold: 0.3
  });

  faqObserver.observe(heading);
}

/* ------------------ ABOUT IMPACT — Typing Heading Animation ------------------ */
function initImpactTyping() {
  // We target the h2 in the about-impact section
  var heading = document.querySelector('.about-impact .section-title-typing');
  if (!heading) return;

  // Save the full text and clear it so we can "type" it back in
  var fullText = heading.textContent.trim();
  heading.textContent = '';

  // Use IntersectionObserver so it only starts when the section comes into view
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      observer.unobserve(heading); // only once

      var index = 0;
      var speed = 45; // ms per character

      function typeNext() {
        heading.textContent = fullText.slice(0, index);
        index++;

        if (index <= fullText.length) {
          setTimeout(typeNext, speed);
        }
      }

      typeNext();
    });
  }, {
    threshold: 0.6
  });

  observer.observe(heading);
}


/* ------------------ ABOUT US — Founder Bio Typewriter Animation ------------------ */
function initFounderBioTypewriter() {
  var bios = document.querySelectorAll('.founder-bio');

  if (!bios.length) {
    console.warn('No founder bios found');
    return;
  }

  console.log('Found ' + bios.length + ' founder bios to animate');

  var bioObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var bio = entry.target;

      // Store original text and clear it
      var fullText = bio.textContent.trim();
      bio.textContent = '';
      bio.style.opacity = '1';

      // Add cursor
      var cursor = document.createElement('span');
      cursor.className = 'typewriter-cursor';
      cursor.textContent = '|';
      bio.appendChild(cursor);

      var charIndex = 0;
      var typingSpeed = 30; // milliseconds per character

      function typeNextChar() {
        if (charIndex < fullText.length) {
          // Insert character before cursor
          var textNode = document.createTextNode(fullText.charAt(charIndex));
          bio.insertBefore(textNode, cursor);
          charIndex++;
          setTimeout(typeNextChar, typingSpeed);
        } else {
          // Remove cursor after typing is done
          setTimeout(function() {
            if (cursor.parentNode) {
              cursor.remove();
            }
          }, 500);
        }
      }

      typeNextChar();
      bioObserver.unobserve(bio);
    });
  }, {
    threshold: 0.5
  });

  bios.forEach(function (bio) {
    bio.style.opacity = '0';
    bioObserver.observe(bio);
  });
}


/* ------------------ CONTACT PAGE — Talking Scroll Guide ------------------ */
function initContactPageAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  var contactSection = document.querySelector('.contact-hero');
  if (!contactSection) return; // only run on contact.html

  /* ---------- 1. Create floating "guide" bubble ---------- */
  function createContactNarrator() {
    var existing = document.querySelector('.contact-narrator');
    if (existing) return existing;

    var el = document.createElement('div');
    el.className = 'contact-narrator';
    el.innerHTML =
      '<div class="contact-narrator-label">Win Corp · Guide</div>' +
      '<div class="contact-narrator-text" data-current="">' +
      'Scroll through – we’ll tell you what to share.' +
      '</div>';

    document.body.appendChild(el);
    gsap.set(el, { autoAlpha: 0, y: 12 });
    return el;
  }

  var narrator = createContactNarrator();

  function narratorSpeak(id, text) {
    if (!narrator) return;
    var textEl = narrator.querySelector('.contact-narrator-text');
    if (!textEl || textEl.dataset.current === id) return;

    textEl.dataset.current = id;

    gsap.to(textEl, {
      y: -6,
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: function () {
        textEl.textContent = text;
        gsap.fromTo(
          textEl,
          { y: 6, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.28, ease: 'power2.out' }
        );
      }
    });
  }

  // Show/hide guide while contact section is in view
  ScrollTrigger.create({
    trigger: contactSection,
    start: 'top 70%',
    endTrigger: '.contact-map-section',
    end: 'bottom bottom',
    onEnter: function () {
      if (!narrator) return;
      gsap.to(narrator, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' });
      narratorSpeak('intro', 'Start with who you are and what unit you’re planning or optimizing.');
    },
    onEnterBack: function () {
      if (!narrator) return;
      gsap.to(narrator, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power3.out' });
    },
    onLeave: function () {
      if (!narrator) return;
      gsap.to(narrator, { autoAlpha: 0, y: 10, duration: 0.25, ease: 'power2.inOut' });
    },
    onLeaveBack: function () {
      if (!narrator) return;
      gsap.to(narrator, { autoAlpha: 0, y: 10, duration: 0.25, ease: 'power2.inOut' });
    }
  });

  /* ---------- 2. Hero motion: feels like an opening line ---------- */

  var eyebrow       = contactSection.querySelector('.contact-eyebrow');
  var lead          = contactSection.querySelector('.contact-lead');
  var badges        = gsap.utils.toArray('.contact-badge');
  var highlightCard = contactSection.querySelector('.contact-highlight-card');
  var glows         = gsap.utils.toArray('.contact-hero-glow');

  var tlHero = gsap.timeline({
    scrollTrigger: {
      trigger: contactSection,
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: 'power3.out' }
  });

  if (eyebrow) {
    tlHero.from(eyebrow, { y: 18, opacity: 0, duration: 0.45 }, 0);
  }

  // title animation is already handled by your js-split-heading logic – we keep it

  if (lead) {
    tlHero.from(lead, { y: 24, opacity: 0, duration: 0.55 }, '-=0.25');
  }

  if (badges.length) {
    tlHero.from(badges, {
      y: 18,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08
    }, '-=0.35');
  }

  if (highlightCard) {
    tlHero.from(highlightCard, {
      y: 40,
      opacity: 0,
      scale: 0.94,
      duration: 0.7
    }, '-=0.4');

    // gentle float loop
    gsap.to(highlightCard, {
      y: '-=8',
      duration: 3.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }

  // Parallax the hero glows so background feels alive
  glows.forEach(function (glow, index) {
    gsap.to(glow, {
      scrollTrigger: {
        trigger: contactSection,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      },
      y: index % 2 === 0 ? 30 : -30,
      ease: 'none'
    });
  });

  /* ---------- 3. Step 1: Direct contact block ---------- */

  var details = document.querySelector('.contact-details');
  if (details) {
    var detailCards = gsap.utils.toArray('.contact-details .contact-card');

    gsap.from(detailCards, {
      scrollTrigger: {
        trigger: details,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      x: -40,
      opacity: 0,
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.07
    });

    ScrollTrigger.create({
      trigger: details,
      start: 'top 75%',
      onEnter: function () {
        narratorSpeak(
          'details',
          'Prefer a direct line? Use phone, email or WhatsApp for quick qualification.'
        );
      },
      onEnterBack: function () {
        narratorSpeak(
          'details',
          'Prefer a direct line? Use phone, email or WhatsApp for quick qualification.'
        );
      }
    });
  }

  /* ---------- 4. Step 2: Form block (the “deep dive”) ---------- */

  var formCard = document.querySelector('.contact-form-card');
  if (formCard) {
    gsap.from(formCard, {
      scrollTrigger: {
        trigger: formCard,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 60,
      opacity: 0,
      scale: 0.96,
      duration: 0.75,
      ease: 'power3.out'
    });

    // subtle 3D tilt as you scroll (desktop only)
    if (window.innerWidth >= 768) {
      gsap.to(formCard, {
        scrollTrigger: {
          trigger: formCard,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.5
        },
        rotationX: 5,
        rotationY: -4,
        transformPerspective: 900,
        ease: 'none'
      });
    }

    ScrollTrigger.create({
      trigger: formCard,
      start: 'top 80%',
      onEnter: function () {
        narratorSpeak(
          'form',
          'Here, tell us your capacity, timelines, and whether it’s a new unit or optimization.'
        );
      },
      onEnterBack: function () {
        narratorSpeak(
          'form',
          'Here, tell us your capacity, timelines, and whether it’s a new unit or optimization.'
        );
      }
    });
  }

  /* ---------- 5. Step 3: Social block ---------- */

  var socialSection = document.querySelector('.contact-social');
  if (socialSection) {
    var socialPills = gsap.utils.toArray('.social-pill');

    gsap.from(socialPills, {
      scrollTrigger: {
        trigger: socialSection,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 20,
      opacity: 0,
      duration: 0.55,
      ease: 'back.out(1.5)',
      stagger: 0.06
    });

    ScrollTrigger.create({
      trigger: socialSection,
      start: 'top 85%',
      onEnter: function () {
        narratorSpeak(
          'social',
          'Follow us on LinkedIn, X or Facebook for case studies and implementation stories.'
        );
      },
      onEnterBack: function () {
        narratorSpeak(
          'social',
          'Follow us on LinkedIn, X or Facebook for case studies and implementation stories.'
        );
      }
    });
  }

  /* ---------- 6. Step 4: Map / footprint ---------- */

  var mapSection = document.querySelector('.contact-map-section');
  if (mapSection) {
    var mapFrame = mapSection.querySelector('iframe');

    if (mapFrame) {
      gsap.from(mapFrame, {
        scrollTrigger: {
          trigger: mapSection,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    }

    ScrollTrigger.create({
      trigger: mapSection,
      start: 'top 85%',
      onEnter: function () {
        narratorSpeak(
          'map',
          'We work from core clusters like Coimbatore & Tiruppur, and support remote projects as well.'
        );
      },
      onEnterBack: function () {
        narratorSpeak(
          'map',
          'We work from core clusters like Coimbatore & Tiruppur, and support remote projects as well.'
        );
      }
    });
  }
}



/* ------------------ ABOUT US — Highlight Numbers Counter Animation ------------------ */
function initHighlightCounters() {
  var highlights = document.querySelectorAll('.highlight-number[data-target]');

  if (!highlights.length) {
    console.warn('No highlight numbers found');
    return;
  }

  console.log('Found ' + highlights.length + ' highlight numbers to animate');

  var highlightObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var el = entry.target;
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';

      // Animate from 0 to target
      var start = 0;
      var duration = 2000; // 2 seconds
      var startTime = Date.now();

      function animate() {
        var elapsed = Date.now() - startTime;
        var progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out cubic for smooth deceleration)
        var easeProgress = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(start + (target - start) * easeProgress);

        el.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure we end on exact target
          el.textContent = target + suffix;
        }
      }

      animate();
      highlightObserver.unobserve(el);
    });
  }, {
    threshold: 0.5 // Trigger when 50% visible
  });

  highlights.forEach(function (el) {
    highlightObserver.observe(el);
  });
}

/* ------------------ VALUES — Card Hover + Mobile In-view Animations ------------------ */
function initValuesAnimations() {
  var cards = document.querySelectorAll('.value-card');

  if (!cards.length) {
    console.warn('No value cards found');
    return;
  }

  console.log('Found ' + cards.length + ' value cards (Lenis handles scroll, JS handles hover & mobile in-view)');

  // Hover effects (desktop only)
  cards.forEach(function (card) {
    var icon = card.querySelector('.value-card-icon');

    card.addEventListener('mouseenter', function () {
      if (window.innerWidth < 768) return; // no hover on mobile

      card.style.transition = 'transform 0.4s ease-out, box-shadow 0.4s ease-out';
      card.style.transform = 'translateY(-8px) scale(1.03)';
      card.style.boxShadow = '0 20px 60px rgba(32, 16, 59, 0.3)';

      if (icon) {
        icon.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        icon.style.transform = 'scale(1.15) rotate(360deg)';
      }
    });

    card.addEventListener('mouseleave', function () {
      if (window.innerWidth < 768) return;

      card.style.transition = 'transform 0.4s ease-out, box-shadow 0.4s ease-out';
      card.style.transform = 'translateY(0) scale(1)';
      card.style.boxShadow = '0 8px 32px rgba(32, 16, 59, 0.15)';

      var icon = card.querySelector('.value-card-icon');
      if (icon) {
        icon.style.transition = 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        icon.style.transform = 'scale(1) rotate(0deg)';
      }
    });
  });

  // 📱 MOBILE: once-per-card icon rotation + shimmer when card enters view
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      var card = entry.target;

      // Only trigger on mobile
      if (window.innerWidth >= 768) {
        io.unobserve(card);
        return;
      }

      // Run only once per card
      if (card.dataset.animated === 'true') {
        io.unobserve(card);
        return;
      }

      card.dataset.animated = 'true';

      // Add classes that trigger CSS animations
      card.classList.add('mobile-animated', 'shimmer');

      // Remove shimmer class after animation completes so DOM stays clean
      setTimeout(function () {
        card.classList.remove('shimmer');
      }, 1000);

      io.unobserve(card);
    });
  }, {
    threshold: 0.5
  });

  cards.forEach(function (card) {
    io.observe(card);
  });
}

/* ------------------ SERVICES STACK – scroll-linked stacking story ------------------ */
/* ------------------ SERVICES STACK – scroll-linked stacking story ------------------ */
function initServicesMetricsAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  var stack = document.querySelector('.services-stack');
  if (!stack) return;

  var panels    = gsap.utils.toArray('.services-step-panel');
  var steps     = gsap.utils.toArray('.services-stack-step');
  var stackLeft = stack.querySelector('.services-stack-left');

  var prefersReduced = false;
  try {
    prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) {}

  // create mobile marker if needed
  var mobileMarker = null;
  if (window.innerWidth < 768) {
    mobileMarker = document.querySelector('.services-mobile-marker');
    if (!mobileMarker) {
      mobileMarker = document.createElement('div');
      mobileMarker.className = 'services-mobile-marker';
      mobileMarker.textContent = '01 · Track Record';
      document.body.appendChild(mobileMarker);
    }
  }

  // helper to update active step + mobile marker text
  function setActive(stepId) {
    steps.forEach(function (step) {
      step.classList.toggle(
        'is-active',
        step.getAttribute('data-step') === stepId
      );
    });
    panels.forEach(function (panel) {
      panel.classList.toggle(
        'is-active',
        panel.getAttribute('data-step') === stepId
      );
    });

    // mobile marker text
    if (mobileMarker) {
      var stepEl = steps.find(function (s) {
        return s.getAttribute('data-step') === stepId;
      });
      if (stepEl) {
        var label = stepEl.querySelector('.step-label');
        if (label) {
          mobileMarker.textContent = label.textContent.trim();
        }
      }
    }
  }

  // 🔢 Panels: slide up from bottom + sync active state
  panels.forEach(function (panel, index) {
    var stepId = panel.getAttribute('data-step') || String(index + 1);

    if (!prefersReduced) {
      gsap.from(panel, {
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 70,
        opacity: 0,
        scale: 0.96,
        duration: 0.7,
        ease: 'back.out(1.4)'
      });
    }

    ScrollTrigger.create({
      trigger: panel,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter: function () { setActive(stepId); },
      onEnterBack: function () { setActive(stepId); }
    });
  });

  // 📌 LEFT COLUMN PIN – desktop / tablet ONLY
  if (!prefersReduced && stackLeft && window.innerWidth >= 768) {
    ScrollTrigger.create({
      trigger: stack,
      start: 'top 120',
      end: 'bottom bottom',
      pin: stackLeft,
      pinSpacing: false
    });
  }

  // 👀 MOBILE: show/hide the floating marker only while section is in view
  if (mobileMarker) {
    ScrollTrigger.create({
      trigger: stack,
      start: 'top bottom',  // section starts entering viewport
      end: 'bottom top',    // section goes fully out
      onEnter: function () {
        mobileMarker.classList.add('is-visible');
      },
      onEnterBack: function () {
        mobileMarker.classList.add('is-visible');
      },
      onLeave: function () {
        mobileMarker.classList.remove('is-visible');
      },
      onLeaveBack: function () {
        mobileMarker.classList.remove('is-visible');
      }
    });
  }
}





/* ------------------ ABOUT FOUNDER — Portrait & Stats Animations ------------------ */
function initFounderSectionAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector('.about-founder');
  if (!section) return;

  var card = section.querySelector('.founder-photo-card');
  var stats = gsap.utils.toArray('.founder-stats-row .founder-stat');

  // 1) Bring in the card from the left with a slight rotation
  if (card) {
    gsap.from(card, {
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        toggleActions: 'play none none none'
      },
      x: -40,
      y: 20,
      opacity: 0,
      rotationY: -8,
      duration: 0.9,
      ease: 'power3.out'
    });

    // Idle subtle float after entrance (desktop only)
    if (window.innerWidth >= 768) {
      gsap.to(card, {
        y: '-=6',
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.2
      });
    }
  }

  // 2) Stagger stats from below
  if (stats.length) {
    gsap.from(stats, {
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none none'
      },
      y: 22,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.08
    });
  }

  // 3) Optional orbit wiggle for dots
  var dots = gsap.utils.toArray('.founder-orbit-dot');
  if (dots.length) {
    dots.forEach(function (dot, i) {
      gsap.to(dot, {
        y: i % 2 === 0 ? -3 : 3,
        x: i % 2 === 0 ? 2 : -2,
        duration: 2 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }
}


/* ------------------ ABOUT CLIENTS — Hero Animations ------------------ */
function initClientsAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector('.about-clients');
  if (!section) return;

  var cards = gsap.utils.toArray('.client-group-card');
  var pills = gsap.utils.toArray('.clients-highlight-pill');

  // 1) Stagger in highlight pills (stats)
  if (pills.length) {
    gsap.from(pills, {
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        toggleActions: 'play none none none'
      },
      y: 18,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.08
    });
  }

  // 2) Client group cards: 3D-ish entrance
  if (cards.length) {
    gsap.from(cards, {
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      scale: 0.96,
      rotationX: -8,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12
    });

    // 3) Hover tilt (desktop only)
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        if (window.innerWidth < 768) return;
        gsap.to(card, {
          y: -6,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', function () {
        if (window.innerWidth < 768) return;
        gsap.to(card, {
          y: 0,
          rotationX: 0,
          rotationY: 0,
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mousemove', function (e) {
        if (window.innerWidth < 768) return;

        var rect = card.getBoundingClientRect();
        var relX = e.clientX - rect.left;
        var relY = e.clientY - rect.top;
        var xRatio = (relX / rect.width) - 0.5;
        var yRatio = (relY / rect.height) - 0.5;

        var rotateY = xRatio * 6;   // left-right
        var rotateX = -yRatio * 6;  // up-down

        gsap.to(card, {
          rotationX: rotateX,
          rotationY: rotateY,
          transformPerspective: 900,
          transformOrigin: 'center center',
          duration: 0.25,
          ease: 'power2.out'
        });
      });
    });
  }

  // 4) Optional: subtle vertical pulsing on ticker dots (CSS already glows; GSAP can wiggle)
  var ticker = section.querySelector('.clients-ticker-track');
  if (ticker) {
    gsap.to(ticker, {
      y: -2,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }
}


/* ------------------ ABOUT FOOTPRINT — Tag Stagger Animation ------------------ */
function initFootprintAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  var tags = gsap.utils.toArray('.about-footprint .tag');
  if (!tags.length) return;

  gsap.from(tags, {
    scrollTrigger: {
      trigger: document.querySelector('.about-footprint'),
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    y: 14,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out',
    stagger: 0.04
  });
}
/* ------------------ ABOUT WHY — Alternating Step Animations ------------------ */
/* ------------------ ABOUT WHY — Alternating Step Animations ------------------ */
function initWhyAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  var steps = gsap.utils.toArray('.about-why .why-step');
  if (!steps.length) return;

  var isMobile = window.innerWidth < 880;

  steps.forEach(function (step) {
    var meta = step.querySelector('.why-step-meta');
    var content = step.querySelector('.why-step-content');
    if (!meta || !content) return;

    // Desktop/tablet: left/right from sides
    if (!isMobile) {
      var isLeft = step.classList.contains('why-step--left');

      var metaFromX = isLeft ? -40 : 40;
      var contentFromX = isLeft ? 40 : -40;

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: 'top 75%',
          toggleActions: 'play none none none',
          onEnter: function () {
            step.classList.add('is-visible');
          }
        },
        defaults: { duration: 0.6, ease: 'power3.out' }
      });

      tl.fromTo(
        meta,
        { x: metaFromX, opacity: 0 },
        { x: 0, opacity: 1 }
      ).fromTo(
        content,
        { x: contentFromX, opacity: 0 },
        { x: 0, opacity: 1 },
        '-=0.35'
      );
    } else {
      // Mobile: everything from below, stacked
      var tlMobile = gsap.timeline({
        scrollTrigger: {
          trigger: step,
          start: 'top 80%',
          toggleActions: 'play none none none',
          onEnter: function () {
            step.classList.add('is-visible');
          }
        },
        defaults: { duration: 0.55, ease: 'power3.out' }
      });

      tlMobile
        .fromTo(
          meta,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1 }
        )
        .fromTo(
          content,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1 },
          '-=0.25'
        );
    }
  });
}



/* ------------------ ABOUT EXPERTISE — 3D Hover Cards ------------------ */
function initExpertiseAnimations() {
  var cards = document.querySelectorAll('.about-expertise .expertise-card');
  if (!cards.length || !window.gsap) return;

  cards.forEach(function (card) {
    // No 3D tilt on mobile
    card.addEventListener('mouseenter', function () {
      if (window.innerWidth < 768) return;
      gsap.to(card, {
        y: -8,
        duration: 0.35,
        ease: 'power3.out'
      });
    });

    card.addEventListener('mouseleave', function () {
      if (window.innerWidth < 768) return;
      gsap.to(card, {
        y: 0,
        rotationX: 0,
        rotationY: 0,
        duration: 0.4,
        ease: 'power3.out'
      });
    });

    card.addEventListener('mousemove', function (e) {
      if (window.innerWidth < 768) return;

      var rect = card.getBoundingClientRect();
      var relX = e.clientX - rect.left;
      var relY = e.clientY - rect.top;
      var xRatio = (relX / rect.width) - 0.5;
      var yRatio = (relY / rect.height) - 0.5;

      var rotateY = xRatio * 8;   // left–right
      var rotateX = -yRatio * 8;  // up–down

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 900,
        transformOrigin: 'center center',
        duration: 0.25,
        ease: 'power2.out'
      });
    });
  });
}


/* ------------------ SERVICES — Mega Typography + Scroll Sync ------------------ */
function initServicesMegaTypography() {
  var section = document.querySelector('#services');
  if (!section) return;

  var megaWords = Array.prototype.slice.call(section.querySelectorAll('.mega-word'));
  var cards = Array.prototype.slice.call(section.querySelectorAll('.service-item'));
    // --- NEW: pin mega words as soon as the first card is about to appear (mobile only) ---
  var firstCard = cards[0];
  var firstCardTriggered = false;

  if (firstCard) {
    var firstCardObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        firstCardTriggered = true;
        sectionInView = true; // allow scroll-based updates

        if (window.innerWidth < 768) {
          document.body.classList.add('services-mega-pinned');
        }

        // Force step 1 when we first see the section
        var step = firstCard.getAttribute('data-step') || '1';
        setActiveStep(step, 'down');

        // Only need this once
        firstCardObserver.unobserve(firstCard);
      });
    }, {
      threshold: 0,
      // Trigger when the first card is near the bottom of the viewport
      // (so it's "about to come in")
      rootMargin: '0px 0px -80% 0px'
    });

    firstCardObserver.observe(firstCard);
  }


  if (!megaWords.length || !cards.length) {
    console.warn('Mega services: words or cards not found');
    return;
  }

  var currentStep = null;
  var sectionInView = false;
  var lastScrollY = window.scrollY || window.pageYOffset || 0;
  var hasRunMobileIntro = false;

  function setActiveStep(step, direction) {
    step = String(step);
    if (step === currentStep) return;

    var prevWord = megaWords.find(function (w) {
      return w.classList.contains('is-active');
    });
    var nextWord = megaWords.find(function (w) {
      return w.getAttribute('data-step') === step;
    });

    // Update cards
    cards.forEach(function (card) {
      if (card.getAttribute('data-step') === step) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });

    // Word transitions
    if (prevWord && prevWord !== nextWord) {
      prevWord.classList.remove('is-active', 'exit-up', 'exit-down');

      if (direction === 'down') {
        prevWord.classList.add('exit-up');
      } else if (direction === 'up') {
        prevWord.classList.add('exit-down');
      }

      setTimeout(function () {
        prevWord.classList.remove('exit-up', 'exit-down');
      }, 700);
    }

    if (nextWord) {
      nextWord.classList.remove('exit-up', 'exit-down');
      nextWord.classList.add('is-active');
    }

    currentStep = step;
  }

  // Choose initial active
  var firstCard = cards[0];
  if (firstCard) {
    setActiveStep(firstCard.getAttribute('data-step') || '1', 'down');
  }

  // Compute active card from viewport center
  function updateActiveFromScroll() {
    if (!sectionInView) return;

    var viewportCenter = window.innerHeight / 2;
    var bestCard = null;
    var smallestDistance = Infinity;

    cards.forEach(function (card) {
      var rect = card.getBoundingClientRect();
      var cardCenter = rect.top + rect.height / 2;
      var distance = Math.abs(viewportCenter - cardCenter);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        bestCard = card;
      }
    });

    if (!bestCard) return;

    var step = bestCard.getAttribute('data-step') || '1';
    var scrollY = window.scrollY || window.pageYOffset || 0;
    var direction = scrollY >= lastScrollY ? 'down' : 'up';
    lastScrollY = scrollY;

    setActiveStep(step, direction);
  }

  // Use IntersectionObserver to know when section is in view
  var sectionObserver = new IntersectionObserver(function (entries) { 
    entries.forEach(function (entry) {
      sectionInView = entry.isIntersecting;

      if (sectionInView) {
        updateActiveFromScroll();

        // ✅ On mobile: dock mega words to bottom
        if (window.innerWidth < 768) {
          document.body.classList.add('services-mega-pinned');
        }
      } else {
        // When section is out of view, remove pinned state
        document.body.classList.remove('services-mega-pinned');
      }
    });
  }, {
    threshold: 0.2
  });

  sectionObserver.observe(section);

  // Make sure we clean up on resize (turning phone to landscape, etc.)
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      document.body.classList.remove('services-mega-pinned');
    }
  });


  sectionObserver.observe(section);

  // Throttled scroll handler
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!sectionInView) return;
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateActiveFromScroll();
      ticking = false;
    });
  }, { passive: true });

  /* ----- Mobile: letter-by-letter intro for first word (GSAP) ----- */
  var isMobile = window.innerWidth < 768;
  if (isMobile && window.gsap && megaWords.length) {
    var firstWord = megaWords[0];
    var originalText = firstWord.textContent.trim();
    if (originalText.length) {
      // Replace text with per-letter spans
      firstWord.innerHTML = '';
      var letters = [];
      for (var i = 0; i < originalText.length; i++) {
        var ch = originalText[i];
        var span = document.createElement('span');
        span.textContent = ch;
        span.className = 'mega-letter';
        firstWord.appendChild(span);
        letters.push(span);
      }

      var introObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || hasRunMobileIntro) return;
          hasRunMobileIntro = true;

          // GSAP animation
          gsap.fromTo(letters, {
            opacity: 0,
            y: 40,
            rotate: 10
          }, {
            opacity: 1,
            y: 0,
            rotate: 0,
            duration: 0.7,
            ease: 'back.out(1.7)',
            stagger: 0.05
          });

          introObserver.unobserve(firstWord);
        });
      }, {
        threshold: 0.6
      });

      introObserver.observe(firstWord);
    }
  }
}


/* ------------------ Initialize AOS (Animate On Scroll) ------------------ */
function initAOS() {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      // Mobile-optimized settings
      duration: 800,             // Animation duration (ms)
      easing: 'ease-out-cubic',  // Smooth easing
      once: false,               // Repeat animations on scroll up/down
      mirror: false,             // Don't animate out (keep visible)
      offset: 120,               // Trigger earlier (px from bottom of viewport)
      delay: 0,
      anchorPlacement: 'top-bottom',

      disable: false,
      startEvent: 'DOMContentLoaded',
      throttleDelay: 99,
      debounceDelay: 50,
      disableMutationObserver: false,
      useClassNames: false,
      initClassName: 'aos-init',
      animatedClassName: 'aos-animate'
    });

    console.log('AOS initialized (not used on Services/Values scroll anymore)');

    // Force refresh AOS immediately after init
    setTimeout(function() {
      AOS.refresh();
    }, 100);
  } else {
    console.warn('AOS library not loaded');
  }
}

/* ------------------ Initialize All ------------------ */
function initAllAnimations() {
  initLenis();              // Lenis + parallax
  initHeroTypography();     // ⬅️ NEW GSAP + SplitType hero
  initKPICounters();
  initGlobalScrollEffects();
  initServicesMegaTypography();
  initFAQTypewriter();
  initFounderBioTypewriter();
  initFounderSectionAnimations();  
  initHighlightCounters();
  initValuesAnimations();
   initImpactTyping(); 
   initExpertiseAnimations(); 
   initFootprintAnimations();
    initWhyAnimations(); 
      initServicesMetricsAnimations(); 
        initContactPageAnimations();


  initAOS();
           // Still used for other sections (e.g. FAQ)

  // Fallback: ensure all AOS elements are visible if AOS fails to load
  setTimeout(function() {
    if (typeof AOS === 'undefined') {
      console.warn('AOS failed to load, making elements visible');
      document.querySelectorAll('[data-aos]').forEach(function(el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.visibility = 'visible';
      });
    }
  }, 2000);

  console.log('All animations initialized (Lenis + AOS + Custom JS)');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAnimations);
} else {
  initAllAnimations();
}

// Refresh on window load and orientation change
window.addEventListener('load', function () {
  setTimeout(function () {
    // Ensure all reveal elements are visible
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });

    // Refresh AOS after load
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
    if (typeof ScrollTrigger !== 'undefined') { // in case you add it later
      ScrollTrigger.refresh();
    }
  }, 1500);
});

window.addEventListener('orientationchange', function () {
  setTimeout(function () {
    // Re-calculate positions after orientation change
    window.scrollTo(window.scrollX, window.scrollY);

    // Refresh AOS on orientation change (important for mobile)
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
      console.log('AOS refreshed after orientation change');
    }
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
      console.log('ScrollTrigger refreshed after orientation change');
    }
  }, 300);
});

// Also refresh AOS on resize (for better responsiveness)
var resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    if (typeof AOS !== 'undefined') {
      AOS.refresh();
    }
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 250);
});


document.addEventListener("DOMContentLoaded", function () {
  // ---------- Typography reveal for headings ----------
  if (window.SplitType && window.gsap) {
    const headings = document.querySelectorAll(".js-split-heading");

    headings.forEach((heading) => {
      const split = new SplitType(heading, {
        types: "lines, words"
      });

      gsap.from(split.lines, {
        scrollTrigger: {
          trigger: heading,
          start: "top 80%",
          toggleActions: "play none none none"
        },
        yPercent: 120,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08
      });
    });
  }

  // ---------- Number counters ----------
  const counters = document.querySelectorAll("[data-counter]");
  counters.forEach((el) => {
    const target = parseInt(el.getAttribute("data-counter"), 10);
    if (!target || !window.gsap) return;

    // Check if the original text has a suffix (like "+")
    const originalText = el.textContent.trim();
    const suffix = originalText.replace(/\d/g, '').trim();

    gsap.fromTo(
      el,
      { innerText: 0 },
      {
        innerText: target,
        duration: 1.4,
        ease: "power1.out",
        snap: { innerText: 1 },
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        },
        onUpdate: function() {
          el.innerText = Math.round(el.innerText) + suffix;
        }
      }
    );
  });

  // ---------- Subtle float on cards ----------
// ---------- Subtle float on sections (Expertise, Impact lines, Industries) ----------
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".expertise-card, .impact-item, .industry-card, .tech-card").forEach((el, index) => {
    gsap.fromTo(
      el,
      { y: 26, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.7,
        delay: index * 0.03,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
          onEnter: () => el.classList.add("is-visible")
        }
      }
    );
  });
}

// ========== FEATURED HIGHLIGHT SECTION GSAP ANIMATIONS ==========
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  const featuredSection = document.querySelector('.featured-highlight-section');

  if (featuredSection) {
    // Create a timeline for the featured section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: featuredSection,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });

    // Badge animation with bounce
    tl.fromTo('.featured-highlight-badge',
      {
        scale: 0,
        opacity: 0,
        rotation: -180
      },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.4,
        ease: "back.out(1.7)"
      }
    );

    // Title animation - split and stagger
    tl.fromTo('.featured-highlight-title',
      {
        x: -100,
        opacity: 0
      },
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power3.out"
      },
      "-=0.2"
    );

    // Gradient text with special effect
    tl.fromTo('.featured-gradient-text',
      {
        x: 100,
        opacity: 0,
        scale: 0.8
      },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)"
      },
      "-=0.3"
    );

    // Content text
    tl.fromTo('.featured-highlight-text',
      {
        y: 50,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      },
      "-=0.2"
    );

    // Decorative line
    tl.fromTo('.featured-highlight-decorative-line',
      {
        scaleX: 0,
        opacity: 0
      },
      {
        scaleX: 1,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      },
      "-=0.1"
    );

    // Floating particles - stagger animation
    gsap.utils.toArray('.featured-particle').forEach((particle, index) => {
      gsap.fromTo(particle,
        {
          scale: 0,
          opacity: 0
        },
        {
          scale: 1,
          opacity: 0.6,
          duration: 0.3,
          delay: index * 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuredSection,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Continuous floating animation for badge
    gsap.to('.featured-highlight-badge', {
      y: -15,
      duration: 2.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1
    });

    // Continuous rotation for icon
    gsap.to('.featured-icon', {
      rotation: 360,
      duration: 20,
      ease: "none",
      repeat: -1
    });

    // Shimmer effect on gradient text
    gsap.to('.featured-gradient-text', {
      backgroundPosition: "200% center",
      duration: 3,
      ease: "none",
      repeat: -1
    });

    // Parallax effect on scroll
    gsap.to('.featured-highlight-glow--1', {
      y: -50,
      x: 50,
      scrollTrigger: {
        trigger: featuredSection,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.to('.featured-highlight-glow--2', {
      y: 50,
      x: -50,
      scrollTrigger: {
        trigger: featuredSection,
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.to('.featured-highlight-glow--3', {
      rotation: 360,
      scrollTrigger: {
        trigger: featuredSection,
        start: "top bottom",
        end: "bottom top",
        scrub: 2
      }
    });

    // Scale effect on scroll
    gsap.to('.featured-highlight-container', {
      scale: 1.05,
      scrollTrigger: {
        trigger: featuredSection,
        start: "top center",
        end: "bottom center",
        scrub: 1
      }
    });

    // Particle parallax
    gsap.utils.toArray('.featured-particle').forEach((particle, index) => {
      const speed = 1 + (index * 0.2);
      gsap.to(particle, {
        y: -100 * speed,
        scrollTrigger: {
          trigger: featuredSection,
          start: "top bottom",
          end: "bottom top",
          scrub: speed
        }
      });
    });
  }
}


});


