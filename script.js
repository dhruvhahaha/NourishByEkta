// ================================================
// Nourish By Ekta — Main Script
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  // 0. Page Loader Screen
  initPageLoader();

  // 1. CMS Content
  initCMS();
  
  // 2. Navigation
  initNavigation();
  
  // 3. Scroll Animations
  initScrollAnimations();
  
  // 4. Testimonial Carousel
  initTestimonialCarousel();
  
  // 5. Approach Carousel  
  initApproachCarousel();
  
  // 6. FAQ
  initFAQ();
  
  // 7. WhatsApp FAB
  initWhatsAppFAB();
});

// ================================================
// 0. Page Loader / Preloader
// ================================================
function initPageLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) {
        initHeroEntrance();
        return;
    }

    const progressBar = document.getElementById('loaderProgressBar');
    const statusText = document.getElementById('loaderStatusText');

    let progress = 0;
    let isReady = false;
    const startTime = Date.now();
    const minDisplayTime = 850; // smooth minimum duration for luxury feel

    const statusMessages = [
        'Preparing clinical nutrition care...',
        'Personalizing your wellness experience...',
        'Rooted in science, crafted for you...',
        'Welcome to Nourish By Ekta'
    ];
    let msgIndex = 0;

    const progressInterval = setInterval(() => {
        if (!isReady) {
            // Simulated smooth progress ramp-up while loading
            if (progress < 45) {
                progress += Math.floor(Math.random() * 10) + 8;
            } else if (progress < 78) {
                progress += Math.floor(Math.random() * 5) + 3;
            } else if (progress < 92) {
                progress += 1;
            }
        } else {
            // Assets ready, accelerate smoothly to 100%
            progress += 16;
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                finishLoading();
            }
        }

        if (progressBar) {
            progressBar.style.width = Math.min(progress, 100) + '%';
        }

        if (statusText && progress > 50 && msgIndex === 0) {
            msgIndex = 1;
            statusText.style.opacity = '0';
            setTimeout(() => {
                if (statusText) {
                    statusText.textContent = statusMessages[1];
                    statusText.style.opacity = '0.9';
                }
            }, 180);
        }
    }, 50);

    function finishLoading() {
        if (statusText) {
            statusText.textContent = 'Welcome to Nourish By Ekta';
            statusText.style.opacity = '1';
        }

        setTimeout(() => {
            loader.classList.add('loaded');
            // Trigger hero entrance after loader starts dissolving
            setTimeout(() => {
                initHeroEntrance();
                // Remove from rendering tree once opacity transition finishes
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 750);
            }, 180);
        }, 200);
    }

    function markReady() {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        setTimeout(() => {
            isReady = true;
        }, remainingTime);
    }

    if (document.readyState === 'complete') {
        markReady();
    } else {
        window.addEventListener('load', markReady, { once: true });
    }

    // Safety fallback timeout
    setTimeout(() => {
        isReady = true;
    }, 2200);
}

// ================================================
// 1. CMS Content
// ================================================
function initCMS() {
    function applyContent(c) {
        if (!c) return;

        // HERO
        if (c.hero) {
            const h = c.hero;
            if (h.title) {
                const titleEl = document.querySelector('.hero-title');
                if (titleEl) {
                    const textNode = [...titleEl.childNodes].find(n => n.nodeType === 3);
                    if (textNode) textNode.textContent = h.title + '\n';
                }
            }
            if (h.titleAccent) { const el = document.querySelector('.hero-title-accent'); if (el) el.textContent = h.titleAccent; }
            if (h.subtitle)    { const el = document.querySelector('.hero-subtitle');     if (el) el.textContent = h.subtitle; }
            if (h.stat1Num)    { const el = document.querySelector('[data-target="2000"]'); if (el) el.textContent = h.stat1Num; }
            if (h.stat1Label)  { const els = document.querySelectorAll('.stat-label'); if (els[0]) els[0].textContent = h.stat1Label; }
            if (h.stat2Num)    { const el = document.querySelector('[data-target="2"]');   if (el) el.textContent = h.stat2Num; }
            if (h.stat2Label)  { const els = document.querySelectorAll('.stat-label'); if (els[1]) els[1].textContent = h.stat2Label; }
        }

        // ABOUT
        if (c.about) {
            if (c.about.lead) { const el = document.querySelector('.about-lead'); if (el) el.textContent = c.about.lead; }
            if (c.about.body) { const el = document.querySelector('.about-text'); if (el) el.textContent = c.about.body; }
            if (Array.isArray(c.about.credentials)) {
                const spans = document.querySelectorAll('.about-credentials .credential span');
                c.about.credentials.forEach((text, i) => { if (spans[i]) spans[i].textContent = text; });
            }
        }

        // SERVICES
        if (c.services) {
            [['discovery','service-discovery'],['oneMonth','service-1month'],['threeMonth','service-3month']].forEach(([key, id]) => {
                const svc = c.services[key];
                const card = document.getElementById(id);
                if (!svc || !card) return;
                if (svc.title) { const el = card.querySelector('.service-title'); if (el) el.textContent = svc.title; }
                if (svc.desc)  { const el = card.querySelector('.service-desc');  if (el) el.textContent = svc.desc; }
                if (svc.price) { const el = card.querySelector('.price-amount');  if (el) el.textContent = svc.price; }
                if (Array.isArray(svc.features)) {
                    const lis = card.querySelectorAll('.service-features li');
                    svc.features.forEach((f, i) => { if (lis[i]) lis[i].textContent = f; });
                }
            });
        }

        // APPROACH
        if (Array.isArray(c.approach)) {
            c.approach.forEach((step, i) => {
                const card = document.getElementById(`step-${i + 1}`);
                if (!card) return;
                if (step.title) { const el = card.querySelector('h3'); if (el) el.textContent = step.title; }
                if (step.desc)  { const el = card.querySelector('p');  if (el) el.textContent = step.desc; }
            });
        }

        // TESTIMONIALS
        if (Array.isArray(c.testimonials)) {
            const cards = document.querySelectorAll('.testimonial-card');
            c.testimonials.forEach((t, i) => {
                if (!cards[i]) return;
                if (t.text)    { const el = cards[i].querySelector('.testimonial-text'); if (el) el.textContent = `"${t.text}"`; }
                if (t.name)    { const el = cards[i].querySelector('strong'); if (el) el.textContent = t.name; }
                if (t.tag)     { const el = cards[i].querySelector('span');   if (el) el.textContent = t.tag; }
                if (t.initial) { const el = cards[i].querySelector('.testimonial-avatar'); if (el) el.textContent = t.initial; }
            });
        }

        // BOOKING & SOCIALS
        if (c.booking) {
            if (c.booking.whatsapp) {
                document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
                    const qs = link.href.split('?')[1] || '';
                    link.href = `https://wa.me/${c.booking.whatsapp}${qs ? '?' + qs : ''}`;
                });
            }
            if (c.booking.instagram) document.querySelectorAll('a[href*="instagram.com"]').forEach(l => l.href = c.booking.instagram);
            if (c.booking.facebook)  document.querySelectorAll('a[href*="facebook.com"]').forEach(l => l.href = c.booking.facebook);
        }

        // FOOTER
        if (c.footer) {
            if (c.footer.email) {
                const el = document.querySelector('a[href*="mailto"]');
                if (el) { el.href = `mailto:${c.footer.email}`; el.textContent = c.footer.email; }
            }
            if (c.footer.phone) {
                const el = document.querySelector('.footer-contact a[href*="wa.me"]');
                if (el) el.textContent = c.footer.phone;
            }
            if (c.footer.copyright) {
                const el = document.querySelector('.footer-bottom p');
                if (el) el.textContent = c.footer.copyright;
            }
        }
    }

    try {
        const raw = localStorage.getItem('nbe_content');
        if (raw) applyContent(JSON.parse(raw));
    } catch (e) { console.warn('[NourishByEkta] Local content error:', e); }

    (async function syncFromCloud() {
        try {
            if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') return;

            // 5-minute client-side TTL to avoid redundant API queries on every page refresh
            const lastSync = localStorage.getItem('nbe_last_sync');
            const FIVE_MIN = 5 * 60 * 1000;
            if (lastSync && (Date.now() - parseInt(lastSync, 10)) < FIVE_MIN && localStorage.getItem('nbe_content')) {
                return;
            }

            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/site_content?select=data&id=eq.1`,
                {
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Accept': 'application/json'
                    }
                }
            );

            if (!res.ok) { console.warn('[NourishByEkta] Supabase fetch failed:', res.status); return; }

            const rows = await res.json();
            localStorage.setItem('nbe_last_sync', Date.now().toString());

            if (!rows || rows.length === 0 || !rows[0]?.data || Object.keys(rows[0].data).length === 0) return;

            const cloudContent = rows[0].data;
            localStorage.setItem('nbe_content', JSON.stringify(cloudContent));
            applyContent(cloudContent);
        } catch (e) { console.warn('[NourishByEkta] Cloud sync error:', e); }
    })();

    window.addEventListener('message', (event) => {
        try {
            const msg = event.data;
            if (!msg || typeof msg !== 'object') return;

            if (msg.type === 'nbe_preview') {
                applyContent(msg.content);
            }

            if (msg.type === 'nbe_scroll_to') {
                const sectionMap = {
                    hero: 'hero',
                    about: 'about',
                    services: 'services',
                    approach: 'results',
                    testimonials: 'testimonials',
                    booking: 'booking',
                    footer: 'footer'
                };
                const targetId = sectionMap[msg.section] || msg.section;
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        } catch (e) { console.warn('[NourishByEkta] Preview message error:', e); }
    });
}

// ================================================
// 2. Navigation
// ================================================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (currentScroll > lastScroll && currentScroll > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    }, { passive: true });

    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const navBackdrop = document.getElementById('navBackdrop');
    
    function closeMobileMenu() {
        if (!menuToggle || !navLinks) return;
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openMobileMenu() {
        if (!menuToggle || !navLinks) return;
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('open');
        if (navBackdrop) navBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        if (navBackdrop) {
            navBackdrop.addEventListener('click', closeMobileMenu);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('open')) {
                closeMobileMenu();
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });
}

// ================================================
// 3. Hero Entrance
// ================================================
function initHeroEntrance() {
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-social-proof, .hero-cta-group, .hero-stats, .hero-image-container, .hero-trust-bar');
    heroElements.forEach((el, i) => {
        el.style.transition = `opacity 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${i * 70}ms, transform 0.7s cubic-bezier(0.23, 1, 0.32, 1) ${i * 70}ms`;
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
}

// ================================================
// 4. Scroll Animations
// ================================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    document.querySelectorAll('.animate-on-scroll').forEach((el, i) => {
      el.style.setProperty('--stagger', i % 4);
      observer.observe(el);
    });
}

// ================================================
// Carousel Factory Function (Shared Logic)
// ================================================
function createCarousel(trackId, prevBtnId, nextBtnId, dotsId, itemSelector, visibleDesktop = 2) {
    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    const dotsContainer = document.getElementById(dotsId);
    if (!track) return;

    const cards = track.querySelectorAll(itemSelector);
    if (cards.length === 0) return;

    let currentSlide = 0;
    let autoPlay;

    function getVisible() {
        return window.innerWidth > 768 ? visibleDesktop : 1;
    }

    function getGap() {
        if (!track) return 0;
        const computed = parseFloat(window.getComputedStyle(track).gap);
        return isNaN(computed) ? (window.innerWidth > 768 ? 24 : 0) : computed;
    }

    function getTotal() {
        return Math.max(1, cards.length - getVisible() + 1);
    }

    function updateDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const total = getTotal();
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.className = `carousel-dot${i === currentSlide ? ' active' : ''}`;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function goToSlide(index, withTransition = true) {
        const total = getTotal();
        currentSlide = Math.max(0, Math.min(index, total - 1));
        const visible = getVisible();
        const gap = getGap();
        
        const containerWidth = track.parentElement.offsetWidth;
        const cardWidth = (containerWidth - gap * (visible - 1)) / visible;
        const offset = currentSlide * (cardWidth + gap);

        track.style.transition = withTransition ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)' : 'none';
        track.style.transform = `translateX(-${offset}px)`;

        if (dotsContainer) {
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }
        
        cards.forEach(card => {
            card.style.flex = `0 0 ${cardWidth}px`;
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
            restartAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
            restartAutoPlay();
        });
    }

    let touchStartX = 0;
    let touchDelta = 0;
    let isSwiping = false;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        isSwiping = true;
        track.style.transition = 'none';
        clearInterval(autoPlay);
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        touchDelta = e.touches[0].clientX - touchStartX;
        
        const containerWidth = track.parentElement.offsetWidth;
        const visible = getVisible();
        const gap = getGap();
        const cardWidth = (containerWidth - gap * (visible - 1)) / visible;
        const baseOffset = currentSlide * (cardWidth + gap);
        
        // Rubber-banding
        let currentOffset = baseOffset - touchDelta;
        const maxOffset = (getTotal() - 1) * (cardWidth + gap);
        
        if (currentOffset < 0) {
            currentOffset = currentOffset * 0.3; // resist left
        } else if (currentOffset > maxOffset) {
            currentOffset = maxOffset + (currentOffset - maxOffset) * 0.3; // resist right
        }
        
        track.style.transform = `translateX(-${currentOffset}px)`;
    }, { passive: true });

    track.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;
        
        if (touchDelta < -50) {
            goToSlide(currentSlide + 1);
        } else if (touchDelta > 50) {
            goToSlide(currentSlide - 1);
        } else {
            goToSlide(currentSlide);
        }
        touchDelta = 0;
        restartAutoPlay();
    });

    function restartAutoPlay() {
        clearInterval(autoPlay);
        autoPlay = setInterval(() => {
            goToSlide((currentSlide + 1) % getTotal());
        }, 5000);
    }

    track.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.addEventListener('mouseleave', restartAutoPlay);

    window.addEventListener('resize', () => {
        updateDots();
        goToSlide(Math.min(currentSlide, getTotal() - 1), false);
    });

    updateDots();
    goToSlide(0, false);
    restartAutoPlay();
}

// ================================================
// 5. Testimonial Carousel
// ================================================
function initTestimonialCarousel() {
    createCarousel('testimonialTrack', 'carouselPrev', 'carouselNext', 'carouselDots', '.testimonial-card', 2);
}

// ================================================
// 6. Approach Carousel
// ================================================
function initApproachCarousel() {
    createCarousel('approachTrack', 'approachPrev', 'approachNext', 'approachDots', '.approach-card', 2);
}

// ================================================
// 7. FAQ
// ================================================
function initFAQ() {
    const details = document.querySelectorAll('details');
    details.forEach((targetDetail) => {
        targetDetail.addEventListener('click', () => {
            details.forEach((detail) => {
                if (detail !== targetDetail) {
                    detail.removeAttribute('open');
                }
            });
        });
    });
}

// ================================================
// 8. WhatsApp FAB
// ================================================
function initWhatsAppFAB() {
    const fab = document.querySelector('.whatsapp-fab');
    if (!fab) return;
    
    const hero = document.getElementById('hero');
    const footer = document.querySelector('footer');
    
    window.addEventListener('scroll', () => {
        if (!hero || !footer) return;
        
        const heroBottom = hero.getBoundingClientRect().bottom;
        const footerTop = footer.getBoundingClientRect().top;
        const vh = window.innerHeight;
        
        if (heroBottom < 0 && footerTop > vh) {
            fab.classList.add('visible');
        } else {
            fab.classList.remove('visible');
        }
    }, { passive: true });
}
