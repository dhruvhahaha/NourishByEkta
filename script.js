/* ================================================
   NOURISH — Motion & Microinteraction Engine
   ================================================ */

// Supabase config (inline so no separate file needed)
// Supabase config is loaded from supabase-config.js

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // APPLY CONTENT — shared by local + cloud
    // ==========================================
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
            if (h.stat1Num)    { const el = document.querySelector('[data-target="2000"]'); if (el) el.dataset.target = h.stat1Num; }
            if (h.stat1Label)  { const els = document.querySelectorAll('.stat-label'); if (els[0]) els[0].textContent = h.stat1Label; }
            if (h.stat2Num)    { const el = document.querySelector('[data-target="2"]');   if (el) el.dataset.target = h.stat2Num; }
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

    // ==========================================
    // STEP 1: Apply localStorage content instantly
    // ==========================================
    try {
        const raw = localStorage.getItem('nbe_content');
        if (raw) applyContent(JSON.parse(raw));
    } catch (e) { console.warn('[NourishByEkta] Local content error:', e); }

    // ==========================================
    // STEP 2: Fetch from Supabase via REST API — apply ALL changes live
    // ==========================================
    (async function syncFromCloud() {
        try {
            if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') return;

            // Direct REST fetch — no SDK dependency, works with publishable key
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
            if (!rows || rows.length === 0 || !rows[0]?.data || Object.keys(rows[0].data).length === 0) return;

            const cloudContent = rows[0].data;
            localStorage.setItem('nbe_content', JSON.stringify(cloudContent));
            applyContent(cloudContent); // Apply ALL sections live

        } catch (e) { console.warn('[NourishByEkta] Cloud sync error:', e); }
    })();

    // ==========================================
    // STEP 3: Live Preview — Listen for postMessage from Admin Panel
    // ==========================================
    window.addEventListener('message', (event) => {
        try {
            const msg = event.data;
            if (!msg || typeof msg !== 'object') return;

            // Live content preview from admin panel
            if (msg.type === 'nbe_preview') {
                applyContent(msg.content);
            }

            // Scroll to a specific section (synced with admin sidebar)
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


    const mobileQuery = window.matchMedia('(max-width: 768px)');
    let isMobile = mobileQuery.matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    mobileQuery.addEventListener('change', (e) => {
        isMobile = e.matches;
    });

    // ==========================================
    // CUSTOM CURSOR GLOW (desktop only)
    // ==========================================
    if (window.innerWidth > 768) {
        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.appendChild(cursorGlow);

        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            glowX += (mouseX - glowX) * 0.15;
            glowY += (mouseY - glowY) * 0.15;
            cursorGlow.style.transform = `translate(${glowX - 150}px, ${glowY - 150}px)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Cursor grows on hovering interactive elements
        document.querySelectorAll('a, button, .service-card, .approach-card, .testimonial-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursorGlow.classList.add('cursor-glow-active'));
            el.addEventListener('mouseleave', () => cursorGlow.classList.remove('cursor-glow-active'));
        });
    }

    // ==========================================
    // NAVBAR — Scroll Effect + Hide/Show
    // ==========================================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    let scrollTicking = false;

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;

                if (currentScroll > 60) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }

                // Hide navbar on scroll down, show on scroll up
                if (currentScroll > lastScroll && currentScroll > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }

                // Sticky CTA — show after hero, hide in booking/footer
                const mobileCta = document.getElementById('mobileCta');
                if (mobileCta) {
                    const bookingSection = document.getElementById('booking');
                    const isInBooking = bookingSection && bookingSection.getBoundingClientRect().top < window.innerHeight * 0.5;
                    
                    if (currentScroll > window.innerHeight * 0.6 && !isInBooking) {
                        mobileCta.classList.add('visible');
                        document.body.classList.add('has-sticky-cta');
                    } else {
                        mobileCta.classList.remove('visible');
                        document.body.classList.remove('has-sticky-cta');
                    }
                }

                lastScroll = currentScroll;
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // ==========================================
    // MOBILE MENU — Animated Toggle
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';

        // Mobile: add/remove overlay backdrop
        if (isMobile) {
            let overlay = document.querySelector('.nav-overlay');
            if (navLinks.classList.contains('open')) {
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'nav-overlay';
                    overlay.style.cssText = `
                        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.5); z-index: 999;
                        animation: fadeIn 0.3s ease;
                    `;
                    overlay.addEventListener('click', () => {
                        menuToggle.classList.remove('active');
                        navLinks.classList.remove('open');
                        document.body.style.overflow = '';
                        overlay.remove();
                    });
                    document.body.appendChild(overlay);
                }
            } else {
                if (overlay) overlay.remove();
            }
        }
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
            const overlay = document.querySelector('.nav-overlay');
            if (overlay) overlay.remove();
        });
    });

    // ==========================================
    // SMOOTH SCROLL — With easing
    // ==========================================
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

    // ==========================================
    // MAGNETIC BUTTONS — Attract to cursor
    // ==========================================
    if (window.innerWidth > 768) {
        document.querySelectorAll('.btn, .carousel-btn, .instagram-follow-btn, .nav-cta').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0) scale(1)';
                btn.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                setTimeout(() => btn.style.transition = '', 500);
            });

            // Ripple effect on click
            btn.addEventListener('click', (e) => {
                const rect = btn.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'btn-ripple';
                ripple.style.left = `${e.clientX - rect.left}px`;
                ripple.style.top = `${e.clientY - rect.top}px`;
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ==========================================
    // 3D TILT CARDS — Service & Approach cards
    // ==========================================
    if (window.innerWidth > 768) {
        document.querySelectorAll('.service-card, .approach-card, .booking-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                card.style.transform = `
                    perspective(1000px)
                    rotateY(${x * 8}deg)
                    rotateX(${-y * 8}deg)
                    translateY(-8px)
                    scale(1.02)
                `;

                // Move the shine/highlight
                const shine = card.querySelector('.card-shine');
                if (shine) {
                    shine.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(201, 104, 136, 0.08) 0%, transparent 60%)`;
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                setTimeout(() => card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 600);
            });

            // Add shine overlay for cards
            const shine = document.createElement('div');
            shine.className = 'card-shine';
            card.appendChild(shine);
        });
    }

    // ==========================================
    // SCROLL-TRIGGERED ANIMATIONS — Staggered reveals
    // ==========================================
    function setupScrollAnimations() {
        const animItems = document.querySelectorAll(
            '.service-card, .approach-card, .about-content, .about-image-wrapper, ' +
            '.results-image-section, .booking-card, .section-header, .booking-feature, ' +
            '.credential, .hero-image-badge, .about-float-card, .instagram-follow-btn, ' +
            '.footer-brand, .footer-links, .footer-contact'
        );

        animItems.forEach(el => {
            el.classList.add('reveal');
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const parent = entry.target.closest('.services-grid, .approach-grid, .booking-features, .about-credentials, .footer-grid');
                    let delay = 0;

                    if (parent) {
                        const siblings = Array.from(parent.children);
                        delay = siblings.indexOf(entry.target) * 120;
                    }

                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        animItems.forEach(el => observer.observe(el));
    }

    setupScrollAnimations();

    // ==========================================
    // TEXT SPLIT REVEAL — Hero title character animation
    // ==========================================
    function splitTextReveal() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        // Animate the badge first
        const badge = document.querySelector('.hero-badge');
        if (badge) {
            badge.style.opacity = '0';
            badge.style.transform = 'translateY(20px) scale(0.9)';
            setTimeout(() => {
                badge.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                badge.style.opacity = '1';
                badge.style.transform = 'translateY(0) scale(1)';
            }, 300);
        }

        // Animate subtitle
        const subtitle = document.querySelector('.hero-subtitle');
        if (subtitle) {
            subtitle.style.opacity = '0';
            subtitle.style.transform = 'translateY(20px)';
            setTimeout(() => {
                subtitle.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'translateY(0)';
            }, 800);
        }

        // Animate CTA buttons with stagger
        const ctaButtons = document.querySelectorAll('.hero-cta-group .btn');
        ctaButtons.forEach((btn, i) => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(20px)';
            setTimeout(() => {
                btn.style.transition = 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
            }, 1000 + i * 150);
        });

        // Animate stats
        const stats = document.querySelector('.hero-stats');
        if (stats) {
            stats.style.opacity = '0';
            stats.style.transform = 'translateY(20px)';
            setTimeout(() => {
                stats.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                stats.style.opacity = '1';
                stats.style.transform = 'translateY(0)';
            }, 1300);
        }
    }

    splitTextReveal();

    // ==========================================
    // STAT COUNTER — Animated counting
    // ==========================================
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;

        const statsSection = document.querySelector('.hero-stats');
        if (!statsSection) return;

        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            statsAnimated = true;

            statNumbers.forEach(stat => {
                const target = parseFloat(stat.dataset.target);
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const current = target * ease;

                    stat.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        // Pop effect when done
                        stat.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        stat.style.transform = 'scale(1.15)';
                        setTimeout(() => {
                            stat.style.transform = 'scale(1)';
                        }, 300);
                    }
                }

                requestAnimationFrame(updateCounter);
            });
        }
    }

    window.addEventListener('scroll', animateStats, { passive: true });
    // Trigger after page entrance animation completes (~1800ms) so counter is visible
    setTimeout(animateStats, 1800);
    setTimeout(animateStats, 2500); // fallback

    // ==========================================
    // PARALLAX ELEMENTS — Multi-layer depth
    // ==========================================
    if (window.innerWidth > 768) {
        const heroImage = document.querySelector('.hero-image-container');
        const heroGlow = document.querySelector('.hero-bg-overlay');
        const floatCard = document.querySelector('.about-float-card');
        const heroImageBadge = document.querySelector('.hero-image-badge');

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            if (scrolled < window.innerHeight * 1.5) {
                if (heroImage) heroImage.style.transform = `translateY(${scrolled * 0.1}px)`;
                if (heroGlow) heroGlow.style.transform = `translateY(${scrolled * 0.05}px)`;
                if (heroImageBadge) heroImageBadge.style.transform = `translateX(-50%) translateY(${scrolled * -0.04}px)`;
            }
        }, { passive: true });

        // Mouse-based parallax for hero image
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 2;
                const y = (e.clientY / window.innerHeight - 0.5) * 2;

                if (heroImage) {
                    heroImage.style.transform = `translateX(${x * 15}px) translateY(${y * 15 + window.pageYOffset * 0.1}px)`;
                }
            });
        }
    }

    // ==========================================
    // HERO FLOATING PARTICLES — Enhanced
    // ==========================================
    const particleContainer = document.getElementById('heroParticles');

    function createParticle() {
        const particle = document.createElement('div');
        const size = Math.random() * 6 + 2;
        const x = Math.random() * 100;
        const duration = Math.random() * 18 + 12;
        const delay = Math.random() * 8;
        const drift = (Math.random() - 0.5) * 200;
        const isGlow = Math.random() > 0.7;

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: ${isGlow
                ? `radial-gradient(circle, rgba(var(--c-accent-rgb), 0.3), rgba(var(--c-accent-rgb), 0.05))`
                : `rgba(var(--c-accent-rgb), ${Math.random() * 0.2 + 0.05})`
            };
            ${isGlow ? `box-shadow: 0 0 ${size * 3}px rgba(var(--c-accent-rgb), 0.15);` : ''}
            left: ${x}%;
            bottom: -10px;
            animation: particleFloat ${duration}s ease-in-out ${delay}s infinite;
            pointer-events: none;
            --drift: ${drift}px;
        `;

        particleContainer.appendChild(particle);
    }

    for (let i = 0; i < (isMobile ? 10 : 25); i++) {
        createParticle();
    }

    // ==========================================
    // TESTIMONIALS CAROUSEL — With momentum
    // ==========================================
    const track = document.getElementById('testimonialTrack');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');
    const cards = track.querySelectorAll('.testimonial-card');
    const carousel = document.getElementById('testimonialsCarousel');

    let currentSlide = 0;

    function getSlidesVisible() {
        return window.innerWidth > 768 ? 2 : 1;
    }

    function getGap() {
        return window.innerWidth > 768 ? 24 : 0;
    }

    function getTotalSlides() {
        const visible = getSlidesVisible();
        return Math.max(1, cards.length - visible + 1);
    }

    function createDots() {
        dotsContainer.innerHTML = '';
        const total = getTotalSlides();
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.className = `carousel-dot${i === currentSlide ? ' active' : ''}`;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    function goToSlide(index) {
        const total = getTotalSlides();
        currentSlide = Math.max(0, Math.min(index, total - 1));

        const containerWidth = carousel.offsetWidth;
        const gap = getGap();
        const visible = getSlidesVisible();

        // Calculate how wide one "slide step" is
        // Each card = (containerWidth - gap * (visible - 1)) / visible
        // Step = cardWidth + gap
        const cardWidth = (containerWidth - gap * (visible - 1)) / visible;
        const offset = currentSlide * (cardWidth + gap);

        track.style.transform = `translateX(-${offset}px)`;

        // Animate active/inactive states
        cards.forEach((card, i) => {
            card.style.transition = 'opacity 0.6s ease, filter 0.6s ease';
            if (i >= currentSlide && i < currentSlide + visible) {
                card.style.opacity = '1';
                card.style.filter = 'none';
            } else {
                card.style.opacity = '0.4';
                card.style.filter = 'blur(1px)';
            }
        });

        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    prevBtn.addEventListener('click', () => {
        prevBtn.style.transform = 'scale(0.85)';
        setTimeout(() => prevBtn.style.transform = '', 200);
        goToSlide(currentSlide - 1);
    });

    nextBtn.addEventListener('click', () => {
        nextBtn.style.transform = 'scale(0.85)';
        setTimeout(() => nextBtn.style.transform = '', 200);
        goToSlide(currentSlide + 1);
    });

    // Touch / swipe support for mobile
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
        const containerWidth = carousel.offsetWidth;
        const gap = getGap();
        const visible = getSlidesVisible();
        const cardWidth = (containerWidth - gap * (visible - 1)) / visible;
        const base = currentSlide * (cardWidth + gap);
        track.style.transform = `translateX(-${base - touchDelta}px)`;
    }, { passive: true });

    track.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;
        track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

        if (touchDelta < -50) {
            goToSlide(currentSlide + 1);
        } else if (touchDelta > 50) {
            goToSlide(currentSlide - 1);
        } else {
            goToSlide(currentSlide); // snap back
        }
        touchDelta = 0;

        // Restart autoplay
        autoPlay = setInterval(() => {
            const total = getTotalSlides();
            goToSlide((currentSlide + 1) % total);
        }, 5000);
    });

    // Auto-play
    let autoPlay = setInterval(() => {
        const total = getTotalSlides();
        goToSlide((currentSlide + 1) % total);
    }, 5000);

    track.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => {
            const total = getTotalSlides();
            goToSlide((currentSlide + 1) % total);
        }, 5000);
    });

    // Responsive resize
    window.addEventListener('resize', () => {
        createDots();
        goToSlide(Math.min(currentSlide, getTotalSlides() - 1));
    });

    createDots();
    goToSlide(0);

    // ==========================================
    // APPROACH CAROUSEL — Auto-advancing with arrows
    // ==========================================
    const approachCarousel = document.getElementById('approachCarousel');
    const approachTrack = document.getElementById('approachTrack');
    const approachPrevBtn = document.getElementById('approachPrev');
    const approachNextBtn = document.getElementById('approachNext');
    const approachDotsContainer = document.getElementById('approachDots');
    const approachCards = approachTrack ? approachTrack.querySelectorAll('.approach-card') : [];

    if (approachCarousel && approachTrack && approachCards.length) {
        let approachCurrent = 0;

        function getApproachVisible() {
            return window.innerWidth > 900 ? 2 : 1;
        }

        function getApproachTotal() {
            return Math.max(1, approachCards.length - getApproachVisible() + 1);
        }

        function setApproachCardWidths() {
            const visible = getApproachVisible();
            const gap = 24;
            const containerWidth = approachCarousel.offsetWidth;
            const cardWidth = (containerWidth - gap * (visible - 1)) / visible;
            approachCards.forEach(card => {
                card.style.flex = `0 0 ${cardWidth}px`;
                card.style.minWidth = `${cardWidth}px`;
            });
        }

        function createApproachDots() {
            approachDotsContainer.innerHTML = '';
            const total = getApproachTotal();
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('div');
                dot.className = `carousel-dot${i === approachCurrent ? ' active' : ''}`;
                dot.addEventListener('click', () => goToApproach(i));
                approachDotsContainer.appendChild(dot);
            }
        }

        function goToApproach(index) {
            const total = getApproachTotal();
            approachCurrent = ((index % total) + total) % total; // loop around
            const visible = getApproachVisible();
            const gap = 24;
            const containerWidth = approachCarousel.offsetWidth;
            const cardWidth = (containerWidth - gap * (visible - 1)) / visible;
            const offset = approachCurrent * (cardWidth + gap);
            approachTrack.style.transform = `translateX(-${offset}px)`;

            // Active/inactive card styling
            approachCards.forEach((card, i) => {
                card.style.transition = 'opacity 0.5s ease, box-shadow 0.5s ease';
                if (i >= approachCurrent && i < approachCurrent + visible) {
                    card.style.opacity = '1';
                    card.style.boxShadow = '';
                } else {
                    card.style.opacity = '0.35';
                    card.style.boxShadow = 'none';
                }
            });

            approachDotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === approachCurrent);
            });
        }

        approachPrevBtn.addEventListener('click', () => {
            approachPrevBtn.style.transform = 'scale(0.85)';
            setTimeout(() => approachPrevBtn.style.transform = '', 200);
            goToApproach(approachCurrent - 1);
            resetApproachAutoPlay();
        });

        approachNextBtn.addEventListener('click', () => {
            approachNextBtn.style.transform = 'scale(0.85)';
            setTimeout(() => approachNextBtn.style.transform = '', 200);
            goToApproach(approachCurrent + 1);
            resetApproachAutoPlay();
        });

        // Auto-play every 3 seconds
        let approachAutoPlay = setInterval(() => goToApproach(approachCurrent + 1), 3000);

        function resetApproachAutoPlay() {
            clearInterval(approachAutoPlay);
            approachAutoPlay = setInterval(() => goToApproach(approachCurrent + 1), 3000);
        }

        approachCarousel.addEventListener('mouseenter', () => clearInterval(approachAutoPlay));
        approachCarousel.addEventListener('mouseleave', () => {
            approachAutoPlay = setInterval(() => goToApproach(approachCurrent + 1), 3000);
        });

        window.addEventListener('resize', () => {
            setApproachCardWidths();
            createApproachDots();
            goToApproach(Math.min(approachCurrent, getApproachTotal() - 1));
        });

        setApproachCardWidths();
        createApproachDots();
        goToApproach(0);
    }


    // ==========================================
    // ACTIVE NAV — Scroll position based
    // ==========================================
    const sections = document.querySelectorAll('section[id]');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.querySelectorAll('a').forEach(link => {
                    const isActive = link.getAttribute('href') === `#${id}`;
                    link.classList.toggle('active', isActive);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => navObserver.observe(section));

    // ==========================================
    // SCROLL PROGRESS BAR
    // ==========================================
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${scrollPercent}%`;
    }, { passive: true });

    // ==========================================
    // HOVER GLOW — Service cards border glow follows mouse
    // ==========================================
    if (window.innerWidth > 768) {
        document.querySelectorAll('.service-card, .testimonial-card, .approach-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--glow-x', `${x}px`);
                card.style.setProperty('--glow-y', `${y}px`);
            });
        });
    }

    // ==========================================
    // ABOUT IMAGE — Smooth zoom on scroll
    // ==========================================
    const aboutImage = document.querySelector('.about-image');
    if (aboutImage) {
        const aboutObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const ratio = entry.intersectionRatio;
                    const scale = 1 + (1 - ratio) * 0.08;
                    aboutImage.style.transform = `scale(${scale})`;
                }
            });
        }, { threshold: Array.from({ length: 20 }, (_, i) => i / 19) });

        aboutObserver.observe(aboutImage.closest('.about-image-wrapper'));
    }

    // ==========================================
    // SECTION DIVIDERS — Animated lines
    // ==========================================
    document.querySelectorAll('.section').forEach(section => {
        const divider = document.createElement('div');
        divider.className = 'section-divider-line';
        section.insertBefore(divider, section.firstChild);
    });

    // ==========================================
    // TYPED EFFECT — For booking section
    // ==========================================
    const bookingTitle = document.querySelector('.booking-title .text-accent');
    if (bookingTitle) {
        const originalText = bookingTitle.textContent;
        const words = ['Consultation', 'Journey', 'Transformation'];
        let wordIndex = 0;

        function typeWord() {
            const word = words[wordIndex];
            bookingTitle.style.transition = 'opacity 0.3s';
            bookingTitle.style.opacity = '0';

            setTimeout(() => {
                bookingTitle.textContent = word;
                bookingTitle.style.opacity = '1';
                wordIndex = (wordIndex + 1) % words.length;
            }, 300);
        }

        // Only start when visible
        const bookingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setInterval(typeWord, 3000);
                    bookingObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });

        bookingObserver.observe(bookingTitle.closest('.booking-card'));
    }

    // ==========================================
    // INJECT MOTION STYLES
    // ==========================================
    const motionStyles = document.createElement('style');
    motionStyles.textContent = `
        /* Particle float animation */
        @keyframes particleFloat {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
                opacity: 0;
            }
            8% { opacity: 1; }
            50% {
                transform: translateY(-50vh) translateX(var(--drift)) rotate(180deg);
            }
            92% { opacity: 1; }
            100% {
                transform: translateY(-105vh) translateX(calc(var(--drift) * 0.5)) rotate(360deg);
                opacity: 0;
            }
        }

        /* Cursor glow */
        .cursor-glow {
            position: fixed;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(201, 104, 136, 0.06) 0%, transparent 70%);
            pointer-events: none;
            z-index: 9999;
            transition: width 0.4s, height 0.4s, opacity 0.4s;
            will-change: transform;
        }

        .cursor-glow-active {
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(201, 104, 136, 0.1) 0%, transparent 70%);
        }

        /* Scroll progress bar */
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #C96888, #9E4A6A, #9B8EC4);
            z-index: 10001;
            transition: width 0.1s linear;
            border-radius: 0 2px 2px 0;
            box-shadow: 0 0 10px rgba(201, 104, 136, 0.45);
        }

        /* Reveal animations */
        .reveal {
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .revealed {
            opacity: 1;
            transform: translateY(0);
        }

        /* 3D card shine overlay */
        .card-shine {
            position: absolute;
            inset: 0;
            border-radius: inherit;
            pointer-events: none;
            z-index: 1;
        }

        /* Button ripple */
        .btn-ripple {
            position: absolute;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            animation: rippleExpand 0.6s ease-out forwards;
            pointer-events: none;
            z-index: 10;
        }

        @keyframes rippleExpand {
            to {
                width: 300px;
                height: 300px;
                opacity: 0;
            }
        }

        /* Card border glow follow */
        .service-card::before,
        .testimonial-card::before,
        .approach-card::before {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            background: radial-gradient(
                400px circle at var(--glow-x, 50%) var(--glow-y, 50%),
                rgba(201, 104, 136, 0.15),
                transparent 60%
            );
            opacity: 0;
            transition: opacity 0.4s;
            z-index: -1;
        }

        .service-card:hover::before,
        .testimonial-card:hover::before,
        .approach-card:hover::before {
            opacity: 1;
        }

        /* Navbar transition */
        .navbar {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Section divider line */
        .section-divider-line {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201, 104, 136, 0.2), transparent);
            transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .section.in-view .section-divider-line {
            width: 80%;
        }

        /* Smooth image reveal */
        .about-image-frame {
            overflow: hidden;
        }

        .about-image {
            transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Enhanced hover for footer social icons */
        .footer-socials a {
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        .footer-socials a:hover {
            transform: translateY(-4px) scale(1.1);
        }

        /* Credential items stagger */
        .credential {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .credential:hover {
            transform: translateX(8px);
        }

        .credential:hover .credential-icon {
            transform: scale(1.2) rotate(10deg);
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Service features list micro-animation */
        .service-features li {
            transition: all 0.3s ease;
        }

        .service-card:hover .service-features li {
            transform: translateX(6px);
        }

        .service-card:hover .service-features li:nth-child(1) { transition-delay: 0s; }
        .service-card:hover .service-features li:nth-child(2) { transition-delay: 0.05s; }
        .service-card:hover .service-features li:nth-child(3) { transition-delay: 0.1s; }
        .service-card:hover .service-features li:nth-child(4) { transition-delay: 0.15s; }

        /* Testimonial star shimmer */
        .testimonial-stars {
            background: linear-gradient(90deg, #9B8EC4, #B8A0D0, #9B8EC4);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: starShimmer 3s ease-in-out infinite;
        }

        @keyframes starShimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }

        /* Approach number pulse on hover */
        .approach-card:hover .approach-number {
            color: rgba(var(--c-accent-rgb), 0.35);
            transition: color 0.4s ease;
        }

        /* Badge dot enhanced pulse */
        .badge-dot {
            box-shadow: 0 0 0 0 rgba(201, 104, 136, 0.35);
            animation: dotPulse 2s ease-in-out infinite;
        }

        @keyframes dotPulse {
            0% { box-shadow: 0 0 0 0 rgba(201, 104, 136, 0.35); }
            50% { box-shadow: 0 0 0 8px rgba(201, 104, 136, 0); }
            100% { box-shadow: 0 0 0 0 rgba(201, 104, 136, 0); }
        }

        /* Hero image floating effect */
        .hero-image-container {
            animation: heroFloat 6s ease-in-out infinite;
        }

        @keyframes heroFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
        }

        /* Booking card glow pulse */
        .booking-glow {
            animation: glowPulse 4s ease-in-out infinite;
        }

        @keyframes glowPulse {
            0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
            50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        }

        /* About float card entrance */
        .about-float-card.revealed {
            animation: floatCardIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes floatCardIn {
            from {
                opacity: 0;
                transform: translateX(30px) translateY(30px) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translateX(0) translateY(0) scale(1);
            }
        }

        /* Nav link hover underline motion */
        .nav-links a::after {
            transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        /* Instagram button hover effects */
        .instagram-follow-btn {
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        /* Carousel dot morph */
        .carousel-dot {
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }

        .carousel-dot:hover {
            transform: scale(1.3);
        }

        /* Results overlay card counter */
        .results-overlay-card {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .results-image-section:hover .results-overlay-card {
            transform: translateY(-5px);
            box-shadow: 0 20px 60px rgba(201, 104, 136, 0.15);
        }

        /* Prefers reduced motion */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                transition-duration: 0.01ms !important;
            }
            .cursor-glow, .scroll-progress { display: none; }
            .reveal { opacity: 1; transform: none; }
        }

        /* ---- NEW MICRO-INTERACTION STYLES ---- */

        /* Service icon spin on hover */
        .service-icon {
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;
        }
        .service-card:hover .service-icon {
            transform: rotateY(360deg) scale(1.1);
            background: rgba(201, 104, 136, 0.25);
        }

        /* Price amount pop */
        .price-amount {
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: inline-block;
        }
        .service-card:hover .price-amount {
            transform: scale(1.12);
            color: #C96888;
        }

        /* Approach number fill effect */
        .approach-number {
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        .approach-card:hover .approach-number {
            color: rgba(201, 104, 136, 0.45) !important;
            transform: scale(1.1);
            text-shadow: 0 0 30px rgba(201, 104, 136, 0.3);
        }

        /* Testimonial avatar hover */
        .testimonial-avatar {
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .testimonial-card:hover .testimonial-avatar {
            transform: scale(1.15) rotate(-5deg);
            box-shadow: 0 0 20px rgba(201, 104, 136, 0.3);
        }

        /* Text highlight underline animation */
        .text-highlight-line {
            position: relative;
            display: inline;
        }
        .text-highlight-line::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 3px;
            background: linear-gradient(90deg, #C96888, #9B8EC4);
            border-radius: 2px;
            transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .text-highlight-line.line-visible::after {
            width: 100%;
        }

        /* WhatsApp button pulse ring */
        .wa-pulse-ring {
            position: absolute;
            inset: -4px;
            border-radius: inherit;
            border: 2px solid rgba(201, 104, 136, 0.35);
            animation: waPulse 2s ease-in-out infinite;
            pointer-events: none;
        }
        @keyframes waPulse {
            0% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.08); opacity: 0; }
            100% { transform: scale(1); opacity: 0; }
        }

        /* Scroll to top button */
        .scroll-top-btn {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 46px;
            height: 46px;
            border-radius: 50%;
            background: rgba(253, 245, 248, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(201, 104, 136, 0.2);
            color: #C96888;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            transform: translateY(20px) scale(0.8);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 998;
            box-shadow: 0 4px 20px rgba(201, 104, 136, 0.12);
        }
        .scroll-top-btn.visible {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        .scroll-top-btn:hover {
            background: rgba(201, 104, 136, 0.15);
            border-color: rgba(201, 104, 136, 0.45);
            transform: translateY(-3px) scale(1.1);
            box-shadow: 0 8px 30px rgba(201, 104, 136, 0.2);
        }
        .scroll-top-btn:active {
            transform: scale(0.9);
        }

        /* Floating emoji decorations */
        .float-emoji {
            position: absolute;
            font-size: 1.5rem;
            opacity: 0.12;
            animation: emojiFloat 8s ease-in-out infinite;
            pointer-events: none;
            z-index: 0;
        }
        @keyframes emojiFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(5deg); }
            50% { transform: translateY(-8px) rotate(-3deg); }
            75% { transform: translateY(-20px) rotate(4deg); }
        }

        /* Section label typewriter cursor */
        .section-label-cursor::after {
            content: '|';
            animation: cursorBlink 1s step-end infinite;
            margin-left: 2px;
            color: rgba(201, 104, 136, 0.5);
        }
        @keyframes cursorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }

        /* Logo hover wiggle */
        .nav-logo:hover .logo-icon {
            animation: logoWiggle 0.5s ease-in-out;
        }
        @keyframes logoWiggle {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-10deg); }
            40% { transform: rotate(10deg); }
            60% { transform: rotate(-5deg); }
            80% { transform: rotate(5deg); }
        }

        /* Service badge bounce */
        .service-badge {
            animation: badgeBounce 3s ease-in-out infinite;
        }
        @keyframes badgeBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }

        /* Booking feature icons pulse */
        .booking-feature span:first-child {
            display: inline-block;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .booking-feature:hover span:first-child {
            transform: scale(1.3) rotate(10deg);
        }

        /* Instagram button gradient border */
        .instagram-follow-btn {
            position: relative;
        }
        .instagram-follow-btn::before {
            content: '';
            position: absolute;
            inset: -2px;
            border-radius: inherit;
            background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D, #F56040, #F77737, #FCAF45, #FFDC80);
            background-size: 300% 300%;
            opacity: 0;
            z-index: -1;
            transition: opacity 0.4s ease;
            animation: igGradient 4s ease infinite;
        }
        .instagram-follow-btn:hover::before {
            opacity: 1;
        }
        @keyframes igGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* Hero title accent shimmer */
        .hero-title-accent {
            background-size: 200% auto !important;
            animation: titleShimmer 4s linear infinite !important;
        }
        @keyframes titleShimmer {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
        }

        /* Nav active link glow */
        .nav-links a.active {
            color: #C96888 !important;
        }
        .nav-links a.active::after {
            width: 100% !important;
            box-shadow: 0 0 8px rgba(201, 104, 136, 0.35);
        }

        /* Credential check bounce in */
        .credential.revealed .credential-icon {
            animation: checkBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes checkBounce {
            0% { transform: scale(0) rotate(-90deg); }
            60% { transform: scale(1.3) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
        }

        /* Smooth counter rolling effect */
        .stat-number {
            display: inline-block;
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @media (max-width: 768px) {
            .scroll-top-btn { bottom: 80px; right: 16px; width: 42px; height: 42px; }
            .float-emoji { display: none; }
        }
    `;
    document.head.appendChild(motionStyles);

    // ==========================================
    // SECTION IN-VIEW — For divider lines
    // ==========================================
    const sectionViewObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(s => sectionViewObserver.observe(s));

    // ==========================================
    // SCROLL TO TOP BUTTON
    // ==========================================
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
    scrollTopBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
    document.body.appendChild(scrollTopBtn);

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Bounce animation on click
        scrollTopBtn.style.transform = 'translateY(-10px) scale(1.2)';
        setTimeout(() => scrollTopBtn.style.transform = '', 400);
    });

    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.pageYOffset > 600);
    }, { passive: true });

    // ==========================================
    // WHATSAPP BUTTON PULSE RING
    // ==========================================
    document.querySelectorAll('#bookingWhatsAppBtn, #mobileWhatsAppBtn').forEach(btn => {
        if (btn) {
            const ring = document.createElement('span');
            ring.className = 'wa-pulse-ring';
            btn.style.position = 'relative';
            btn.appendChild(ring);
        }
    });

    // ==========================================
    // TEXT HIGHLIGHT ON SCROLL
    // ==========================================
    document.querySelectorAll('.about-lead, .booking-text').forEach(el => {
        // Find text to highlight
        const text = el.innerHTML;
        // Wrap strong keywords
        const keywords = ['ally', 'balance', 'joy', 'goals', 'challenges', 'healthier', 'happier'];
        let updatedText = text;
        keywords.forEach(word => {
            const regex = new RegExp(`\\b(${word})\\b`, 'gi');
            updatedText = updatedText.replace(regex, '<span class="text-highlight-line">$1</span>');
        });
        el.innerHTML = updatedText;
    });

    // Observe highlights
    const highlightObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const highlights = entry.target.querySelectorAll('.text-highlight-line');
                highlights.forEach((h, i) => {
                    setTimeout(() => h.classList.add('line-visible'), i * 300);
                });
                highlightObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.about-lead, .booking-text').forEach(el => {
        highlightObserver.observe(el);
    });

    // ==========================================
    // FLOATING EMOJI DECORATIONS (desktop)
    // ==========================================
    if (!isMobile) {
        const emojiPlacements = [
            { emoji: '🥑', section: '.services', top: '10%', left: '5%', delay: '0s' },
            { emoji: '🍎', section: '.services', top: '80%', right: '4%', delay: '2s' },
            { emoji: '🥦', section: '.results', top: '15%', right: '6%', delay: '1s' },
            { emoji: '🍋', section: '.results', top: '70%', left: '3%', delay: '3s' },
            { emoji: '💚', section: '.booking', top: '20%', left: '8%', delay: '0.5s' },
            { emoji: '🌱', section: '.booking', top: '30%', right: '7%', delay: '2.5s' },
        ];

        emojiPlacements.forEach(({ emoji, section, delay, ...pos }) => {
            const el = document.querySelector(section);
            if (!el) return;
            const span = document.createElement('span');
            span.className = 'float-emoji';
            span.textContent = emoji;
            span.style.animationDelay = delay;
            Object.entries(pos).forEach(([k, v]) => span.style[k] = v);
            el.style.position = 'relative';
            el.appendChild(span);
        });
    }

    // ==========================================
    // SECTION LABEL TYPEWRITER EFFECT
    // ==========================================
    const labelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const label = entry.target;
                const fullText = label.textContent;
                label.textContent = '';
                label.classList.add('section-label-cursor');
                label.style.minHeight = '1.2em';

                let i = 0;
                const typeInterval = setInterval(() => {
                    if (i < fullText.length) {
                        label.textContent += fullText[i];
                        i++;
                    } else {
                        clearInterval(typeInterval);
                        // Remove cursor after typing
                        setTimeout(() => label.classList.remove('section-label-cursor'), 1500);
                    }
                }, 50);

                labelObserver.unobserve(label);
            }
        });
    }, { threshold: 0.8 });

    document.querySelectorAll('.section-label').forEach(label => {
        // Only apply to section labels inside section-headers (not inline ones)
        if (label.closest('.section-header') || label.closest('.booking-content')) {
            labelObserver.observe(label);
        }
    });

    // ==========================================
    // PRICE COUNT-UP ON SCROLL
    // ==========================================
    const priceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const priceEl = entry.target;
                const text = priceEl.textContent;
                const match = text.match(/[\d,]+/);
                if (!match) return;

                const targetNum = parseInt(match[0].replace(/,/g, ''));
                const prefix = text.substring(0, text.indexOf(match[0]));
                const duration = 1200;
                const startTime = performance.now();

                function animatePrice(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(targetNum * ease);
                    priceEl.textContent = prefix + current.toLocaleString('en-IN');

                    if (progress < 1) {
                        requestAnimationFrame(animatePrice);
                    } else {
                        // Pop on finish
                        priceEl.style.transform = 'scale(1.15)';
                        setTimeout(() => priceEl.style.transform = 'scale(1)', 300);
                    }
                }

                requestAnimationFrame(animatePrice);
                priceObserver.unobserve(priceEl);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.price-amount').forEach(el => priceObserver.observe(el));

    // ==========================================
    // HOVER SOUND FEEDBACK (subtle haptic-like)
    // ==========================================
    if (!isMobile) {
        document.querySelectorAll('.service-card, .approach-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Subtle scale bounce on enter
                card.style.transition = 'none';
                card.style.transform = (card.style.transform || '') + ' scale(0.98)';
                requestAnimationFrame(() => {
                    card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    card.style.transform = card.style.transform.replace('scale(0.98)', 'scale(1.02)');
                });
            });
        });
    }

    // ==========================================
    // NAV LOGO COUNTER — Tracks section progress
    // ==========================================
    const logoIcon = document.querySelector('.logo-icon');
    const sectionEmojis = {
        'hero': '🌿',
        'about': '👩‍⚕️',
        'services': '🎯',
        'results': '📈',
        'testimonials': '⭐',
        'booking': '📱',
        'instagram': '📸'
    };

    const emojiObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && logoIcon) {
                const id = entry.target.id;
                if (sectionEmojis[id]) {
                    logoIcon.style.transition = 'transform 0.3s ease';
                    logoIcon.style.transform = 'scale(0) rotate(-180deg)';
                    setTimeout(() => {
                        logoIcon.textContent = sectionEmojis[id];
                        logoIcon.style.transform = 'scale(1) rotate(0deg)';
                    }, 200);
                }
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(section => emojiObserver.observe(section));

    // ==========================================
    // BOOKING FEATURES — Icon stagger animation
    // ==========================================
    const bookingFeaturesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const features = entry.target.querySelectorAll('.booking-feature');
                features.forEach((feat, i) => {
                    feat.style.opacity = '0';
                    feat.style.transform = 'translateY(15px)';
                    setTimeout(() => {
                        feat.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        feat.style.opacity = '1';
                        feat.style.transform = 'translateY(0)';

                        // Bounce the emoji
                        const emoji = feat.querySelector('span:first-child');
                        if (emoji) {
                            setTimeout(() => {
                                emoji.style.transform = 'scale(1.4) rotate(15deg)';
                                setTimeout(() => {
                                    emoji.style.transform = 'scale(1) rotate(0deg)';
                                }, 300);
                            }, 200);
                        }
                    }, i * 200);
                });
                bookingFeaturesObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const bookingFeatures = document.querySelector('.booking-features');
    if (bookingFeatures) bookingFeaturesObserver.observe(bookingFeatures);

    // ==========================================
    // TESTIMONIAL CARD — Quote mark entrance
    // ==========================================
    document.querySelectorAll('.testimonial-card').forEach(card => {
        const quoteMark = document.createElement('div');
        quoteMark.textContent = '"';
        quoteMark.style.cssText = `
            position: absolute;
            top: 12px;
            right: 20px;
            font-family: 'Playfair Display', serif;
            font-size: 4rem;
            line-height: 1;
            color: rgba(201, 104, 136, 0.08);
            pointer-events: none;
            transition: all 0.5s ease;
        `;
        card.appendChild(quoteMark);

        card.addEventListener('mouseenter', () => {
            quoteMark.style.color = 'rgba(201, 104, 136, 0.15)';
            quoteMark.style.transform = 'scale(1.2) translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            quoteMark.style.color = 'rgba(201, 104, 136, 0.08)';
            quoteMark.style.transform = 'scale(1) translateY(0)';
        });
    });

    // ==========================================
    // SMOOTH NUMBER TICKER — Results stat
    // ==========================================
    const resultsStat = document.querySelector('.results-overlay-stat');
    if (resultsStat) {
        const resultsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(resultsStat.textContent);
                    if (isNaN(target)) return;
                    let current = 0;
                    const duration = 1500;
                    const start = performance.now();

                    function tick(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);
                        current = Math.round(target * ease);
                        resultsStat.textContent = current + '%';

                        if (progress < 1) {
                            requestAnimationFrame(tick);
                        } else {
                            resultsStat.style.transform = 'scale(1.1)';
                            setTimeout(() => resultsStat.style.transform = 'scale(1)', 300);
                        }
                    }

                    resultsStat.textContent = '0%';
                    requestAnimationFrame(tick);
                    resultsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        resultsObserver.observe(resultsStat.closest('.results-image-section'));
    }

    // ==========================================
    // ELASTIC OVERSCROLL EFFECT — Sections bounce slightly
    // ==========================================
    if (!isMobile) {
        const elasticSections = document.querySelectorAll('.service-card, .approach-card, .booking-card');
        elasticSections.forEach(el => {
            let isScrolling;
            const handleWheel = (e) => {
                clearTimeout(isScrolling);
                const delta = Math.sign(e.deltaY);
                el.style.transition = 'none';
                el.style.transform = `translateY(${delta * -3}px)`;
                isScrolling = setTimeout(() => {
                    el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    el.style.transform = 'translateY(0)';
                }, 50);
            };
            el.addEventListener('wheel', handleWheel, { passive: true });
        });
    }

    // ==========================================
    // SPARKLE TRAIL — On hero section mouse move
    // ==========================================
    if (!isMobile) {
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            let sparkleThrottle = 0;
            heroSection.addEventListener('mousemove', (e) => {
                if (Date.now() - sparkleThrottle < 80) return;
                sparkleThrottle = Date.now();

                const sparkle = document.createElement('div');
                const size = Math.random() * 6 + 3;
                sparkle.style.cssText = `
                    position: fixed;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(201, 104, 136, ${Math.random() * 0.5 + 0.2});
                    box-shadow: 0 0 ${size * 2}px rgba(201, 104, 136, 0.3);
                    left: ${e.clientX}px;
                    top: ${e.clientY}px;
                    pointer-events: none;
                    z-index: 9998;
                    animation: sparkleOut 0.8s ease-out forwards;
                `;
                document.body.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 800);
            });
        }
    }

    // ==========================================
    // MAGNETIC NAV LINKS — Subtle pull effect
    // ==========================================
    if (!isMobile) {
        document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(link => {
            link.addEventListener('mousemove', (e) => {
                const rect = link.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                link.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
            });
            link.addEventListener('mouseleave', () => {
                link.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                link.style.transform = 'translate(0, 0)';
                setTimeout(() => link.style.transition = '', 400);
            });
        });
    }

    // ==========================================
    // MORPH BLOB — Animated background shape
    // ==========================================
    if (!isMobile) {
        const blob = document.createElement('div');
        blob.className = 'morph-blob';
        document.body.appendChild(blob);

        let blobX = window.innerWidth / 2;
        let blobY = window.innerHeight / 2;
        let targetBlobX = blobX;
        let targetBlobY = blobY;

        document.addEventListener('mousemove', (e) => {
            targetBlobX = e.clientX;
            targetBlobY = e.clientY;
        });

        function animateBlob() {
            blobX += (targetBlobX - blobX) * 0.03;
            blobY += (targetBlobY - blobY) * 0.03;
            blob.style.left = `${blobX - 200}px`;
            blob.style.top = `${blobY - 200}px`;
            requestAnimationFrame(animateBlob);
        }
        animateBlob();
    }

    // ==========================================
    // STAGGERED LIST ENTRANCE — Service features
    // ==========================================
    const featureObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll('li');
                items.forEach((li, i) => {
                    li.style.opacity = '0';
                    li.style.transform = 'translateX(-15px)';
                    setTimeout(() => {
                        li.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        li.style.opacity = '1';
                        li.style.transform = 'translateX(0)';
                    }, i * 100 + 200);
                });
                featureObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.service-features').forEach(list => featureObserver.observe(list));

    // ==========================================
    // IMAGE REVEAL MASK — Removed to ensure reliable visibility of dietician and results photos
    // ==========================================

    // ==========================================
    // CONFETTI BURST — On WhatsApp button click
    // ==========================================
    function createConfetti(x, y) {
        const colors = ['#C96888', '#9E4A6A', '#9B8EC4', '#ffffff', '#E8B4C4'];
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            const size = Math.random() * 8 + 4;
            const angle = Math.random() * 360;
            const velocity = Math.random() * 120 + 60;
            const vx = Math.cos(angle * Math.PI / 180) * velocity;
            const vy = Math.sin(angle * Math.PI / 180) * velocity;
            const rotation = Math.random() * 720 - 360;

            confetti.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size * 0.6}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${x}px;
                top: ${y}px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                pointer-events: none;
                z-index: 99999;
                animation: confettiFall 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                --vx: ${vx}px;
                --vy: ${vy}px;
                --rot: ${rotation}deg;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 1000);
        }
    }

    document.querySelectorAll('#bookingWhatsAppBtn, #mobileWhatsAppBtn').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                createConfetti(e.clientX, e.clientY);
            });
        }
    });

    // ==========================================
    // HOVER TILT SHADOW — Dynamic shadow on cards
    // ==========================================
    if (!isMobile) {
        document.querySelectorAll('.service-card, .booking-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                const shadowX = -x * 30;
                const shadowY = -y * 30;
                card.style.boxShadow = `
                    ${shadowX}px ${shadowY}px 40px rgba(201, 104, 136, 0.12),
                    0 0 40px rgba(201, 104, 136, 0.08),
                    inset 0 0 30px rgba(201, 104, 136, 0.03)
                `;
            });

            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = '';
            });
        });
    }

    // ==========================================
    // FOCUS ZOOM — Animate active section into view (desktop only)
    // ==========================================
    if (!isMobile) {
        const focusObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const container = entry.target.querySelector('.container');
                if (!container) return;

                if (entry.isIntersecting) {
                    container.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease';
                    container.style.transform = 'scale(1)';
                    container.style.opacity = '1';
                } else {
                    container.style.transform = 'scale(0.97)';
                    container.style.opacity = '0.7';
                }
            });
        }, { threshold: 0.05, rootMargin: '-5% 0px' });

        document.querySelectorAll('.section').forEach(s => focusObserver.observe(s));
    }

    // ==========================================
    // LETTER HOVER EFFECT — Nav links
    // ==========================================
    if (!isMobile) {
        document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(link => {
            const text = link.textContent;
            link.innerHTML = '';
            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.cssText = `
                    display: inline-block;
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.3s ease;
                    transition-delay: ${i * 0.02}s;
                `;
                link.appendChild(span);
            });

            link.addEventListener('mouseenter', () => {
                link.querySelectorAll('span').forEach((span, i) => {
                    setTimeout(() => {
                        span.style.transform = 'translateY(-3px)';
                        span.style.color = '#C96888';
                    }, i * 30);
                });
            });

            link.addEventListener('mouseleave', () => {
                link.querySelectorAll('span').forEach((span) => {
                    span.style.transform = 'translateY(0)';
                    span.style.color = '';
                });
            });
        });
    }

    // ==========================================
    // APPROACH CARD CONNECTOR LINE — Draw between steps
    // ==========================================
    if (!isMobile) {
        const approachCards = document.querySelectorAll('.approach-card');
        const connectorObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const line = entry.target.querySelector('.approach-line');
                    if (line) {
                        line.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                        line.style.width = '100%';
                        line.style.background = 'linear-gradient(90deg, rgba(201, 104, 136, 0.2), transparent)';
                        line.style.height = '2px';
                        line.style.position = 'absolute';
                        line.style.bottom = '0';
                        line.style.left = '0';
                    }
                }
            });
        }, { threshold: 0.5 });

        approachCards.forEach(card => connectorObserver.observe(card));
    }

    // ==========================================
    // HOVER GRADIENT SHIFT — Service cards background
    // ==========================================
    if (!isMobile) {
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                card.style.background = `
                    radial-gradient(circle at ${x}% ${y}%, rgba(201, 104, 136, 0.06) 0%, transparent 50%),
                    linear-gradient(160deg, rgba(255, 240, 245, 0.9) 0%, rgba(253, 230, 240, 0.7) 100%)
                `;
            });

            card.addEventListener('mouseleave', () => {
                card.style.background = '';
            });
        });
    }

    // ==========================================
    // FOOTER LINK HOVER — Slide-in indicator
    // ==========================================
    document.querySelectorAll('.footer-links a').forEach(link => {
        link.style.position = 'relative';
        link.style.overflow = 'hidden';
        const indicator = document.createElement('span');
        indicator.style.cssText = `
            position: absolute;
            left: -100%;
            bottom: 0;
            width: 100%;
            height: 1px;
            background: linear-gradient(90deg, transparent, #C96888, transparent);
            transition: left 0.4s ease;
            pointer-events: none;
        `;
        link.appendChild(indicator);

        link.addEventListener('mouseenter', () => indicator.style.left = '0');
        link.addEventListener('mouseleave', () => indicator.style.left = '100%');
    });

    // ==========================================
    // SMOOTH SCROLL PROGRESS DOTS — Sidebar (desktop)
    // ==========================================
    if (!isMobile) {
        const progressNav = document.createElement('div');
        progressNav.className = 'section-progress-nav';
        progressNav.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 12px;
            z-index: 997;
        `;

        const sectionIds = ['hero', 'about', 'services', 'results', 'testimonials', 'booking'];
        sectionIds.forEach(id => {
            const dot = document.createElement('a');
            dot.href = `#${id}`;
            dot.dataset.section = id;
            dot.style.cssText = `
                width: 3px;
                height: 20px;
                border-radius: 4px;
                background: rgba(201, 104, 136, 0.2);
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                cursor: pointer;
                display: block;
            `;

            dot.addEventListener('mouseenter', () => {
                if (!dot.classList.contains('active-dot')) {
                    dot.style.height = '28px';
                    dot.style.background = 'rgba(201, 104, 136, 0.4)';
                }
            });
            dot.addEventListener('mouseleave', () => {
                if (!dot.classList.contains('active-dot')) {
                    dot.style.height = '20px';
                    dot.style.background = 'rgba(201, 104, 136, 0.2)';
                }
            });
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById(id);
                if (target) {
                    window.scrollTo({
                        top: target.getBoundingClientRect().top + window.pageYOffset - 80,
                        behavior: 'smooth'
                    });
                }
            });

            progressNav.appendChild(dot);
        });

        document.body.appendChild(progressNav);

        // Update active dot based on scroll
        const dotObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    progressNav.querySelectorAll('a').forEach(d => {
                        const isActive = d.dataset.section === id;
                        d.classList.toggle('active-dot', isActive);
                        if (isActive) {
                            d.style.height = '44px';
                            d.style.width = '3px';
                            d.style.background = '#C96888';
                            d.style.boxShadow = '0 0 10px rgba(201, 104, 136, 0.5)';
                        } else {
                            d.style.height = '20px';
                            d.style.width = '3px';
                            d.style.background = 'rgba(201, 104, 136, 0.2)';
                            d.style.boxShadow = 'none';
                        }
                    });
                }
            });
        }, { threshold: 0.3 });

        sectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section) dotObserver.observe(section);
        });
    }

    // ==========================================
    // INJECT EXTRA MOTION CSS
    // ==========================================
    const extraStyles = document.createElement('style');
    extraStyles.textContent = `
        /* Sparkle burst */
        @keyframes sparkleOut {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0) translateY(-20px); opacity: 0; }
        }

        /* Confetti fall */
        @keyframes confettiFall {
            0% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translate(var(--vx), var(--vy)) rotate(var(--rot));
                opacity: 0;
            }
        }

        /* Morph blob */
        .morph-blob {
            position: fixed;
            width: 400px;
            height: 400px;
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(253, 245, 248, 0.5) 60%, transparent 80%);
            box-shadow: 0 0 100px rgba(255, 255, 255, 0.5);
            pointer-events: none;
            z-index: -1;
            animation: blobMorph 15s ease-in-out infinite;
            will-change: border-radius, transform;
        }

        @keyframes blobMorph {
            0%   { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
            25%  { border-radius: 60% 40% 30% 70% / 50% 60% 40% 60%; }
            50%  { border-radius: 30% 60% 70% 40% / 50% 40% 60% 50%; }
            75%  { border-radius: 50% 30% 50% 60% / 60% 50% 40% 50%; }
            100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        }

        /* Hide progress nav when scrolled near top */
        .section-progress-nav {
            opacity: 0;
            transition: opacity 0.4s ease;
        }
        .section-progress-nav.visible {
            opacity: 1;
        }
    `;
    document.head.appendChild(extraStyles);

    // Show/hide progress nav
    if (!isMobile) {
        const progressNavEl = document.querySelector('.section-progress-nav');
        if (progressNavEl) {
            window.addEventListener('scroll', () => {
                progressNavEl.classList.toggle('visible', window.pageYOffset > 300);
            }, { passive: true });
        }
    }

    // ==========================================
    // PAGE LOAD ENTRANCE — Staggered reveal
    // ==========================================
    const pageEntrance = () => {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const elements = [
            { el: '.hero-image-container', delay: 0, from: 'scale(0.8) translateY(30px)', to: 'scale(1) translateY(0)' },
            { el: '.hero-badge', delay: 200, from: 'translateY(-20px)', to: 'translateY(0)' },
            { el: '.hero-title', delay: 400, from: 'translateY(40px)', to: 'translateY(0)' },
            { el: '.hero-subtitle', delay: 600, from: 'translateY(30px)', to: 'translateY(0)' },
            { el: '.hero-cta-group', delay: 800, from: 'translateY(30px)', to: 'translateY(0)' },
            { el: '.hero-stats', delay: 1000, from: 'translateY(20px)', to: 'translateY(0)' },
        ];

        elements.forEach(({ el, delay, from, to }) => {
            const element = document.querySelector(el);
            if (!element) return;
            element.style.opacity = '0';
            element.style.transform = from;
            setTimeout(() => {
                element.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                element.style.opacity = '1';
                element.style.transform = to;
            }, delay);
        });
    };
    pageEntrance();

    // ==========================================
    // PARALLAX DEPTH LAYERS — Multiple speeds
    // ==========================================
    if (!isMobile) {
        const parallaxElements = [
            { selector: '.hero-image-glow', speed: 0.15 },
            { selector: '.hero-badge', speed: -0.05 },
            { selector: '.booking-glow', speed: 0.1 },
        ];

        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            parallaxElements.forEach(({ selector, speed }) => {
                const el = document.querySelector(selector);
                if (el) {
                    el.style.transform = `translateY(${scrollY * speed}px)`;
                }
            });
        }, { passive: true });
    }

    // ==========================================
    // TEXT SCRAMBLE — Hero title reveal
    // ==========================================
    const scrambleText = (element) => {
        if (!element) return;
        const chars = '!@#$%^&*()_+{}|:<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const original = element.textContent;
        let iteration = 0;

        const interval = setInterval(() => {
            element.textContent = original
                .split('')
                .map((char, index) => {
                    if (index < iteration) return original[index];
                    if (char === ' ') return ' ';
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');

            if (iteration >= original.length) clearInterval(interval);
            iteration += 1 / 2;
        }, 30);
    };

    // Scramble the hero title accent on load
    setTimeout(() => {
        const accent = document.querySelector('.hero-title-accent');
        if (accent) scrambleText(accent);
    }, 500);

    // ==========================================
    // ELASTIC BUTTON PRESS — Squish on click
    // ==========================================
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transition = 'transform 0.1s ease';
            btn.style.transform = 'scale(0.92)';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            btn.style.transform = 'scale(1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            btn.style.transform = 'scale(1)';
        });
    });

    // ==========================================
    // HERO IMAGE BADGE — Rotating icons
    // ==========================================
    const badgeIcons = ['🥗', '🥑', '🍎', '💪', '🌿', '🧬', '🍋'];
    const heroBadgeIcon = document.querySelector('.hero-image-badge span');
    if (heroBadgeIcon) {
        let badgeIdx = 0;
        setInterval(() => {
            heroBadgeIcon.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            heroBadgeIcon.style.transform = 'scale(0) rotate(-180deg)';
            heroBadgeIcon.style.opacity = '0';
            setTimeout(() => {
                badgeIdx = (badgeIdx + 1) % badgeIcons.length;
                heroBadgeIcon.textContent = badgeIcons[badgeIdx];
                heroBadgeIcon.style.transform = 'scale(1) rotate(0deg)';
                heroBadgeIcon.style.opacity = '1';
            }, 300);
        }, 3000);
    }

    // ==========================================
    // STAT SLOT MACHINE — Numbers roll in
    // ==========================================
    document.querySelectorAll('.stat-number').forEach(stat => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    // Add a brief slot-machine wobble
                    el.style.transition = 'none';
                    let wobbleCount = 0;
                    const wobbleInterval = setInterval(() => {
                        el.style.transform = `translateY(${Math.sin(wobbleCount) * 2}px)`;
                        wobbleCount += 0.5;
                        if (wobbleCount > 10) {
                            clearInterval(wobbleInterval);
                            el.style.transition = 'transform 0.3s ease';
                            el.style.transform = 'translateY(0)';
                        }
                    }, 30);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        observer.observe(stat);
    });

    // ==========================================
    // SECTION TITLE WORD SPLIT — Animate per word
    // ==========================================
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const title = entry.target;
                // Only process text nodes, skip elements like <span>
                const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
                const textNodes = [];
                while (walker.nextNode()) textNodes.push(walker.currentNode);

                textNodes.forEach(node => {
                    const words = node.textContent.split(' ');
                    const fragment = document.createDocumentFragment();
                    words.forEach((word, i) => {
                        if (i > 0) fragment.appendChild(document.createTextNode(' '));
                        const span = document.createElement('span');
                        span.textContent = word;
                        span.style.cssText = `
                            display: inline-block;
                            opacity: 0;
                            transform: translateY(20px) rotate(2deg);
                            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                            transition-delay: ${i * 0.08}s;
                        `;
                        fragment.appendChild(span);

                        // Trigger animation after append
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                span.style.opacity = '1';
                                span.style.transform = 'translateY(0) rotate(0deg)';
                            });
                        });
                    });
                    node.parentNode.replaceChild(fragment, node);
                });

                titleObserver.unobserve(title);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.section-title').forEach(title => titleObserver.observe(title));

    // ==========================================
    // ABOUT IMAGE TILT — Mouse follow on image
    // ==========================================
    if (!isMobile) {
        const aboutImage = document.querySelector('.about-image-wrapper');
        if (aboutImage) {
            aboutImage.addEventListener('mousemove', (e) => {
                const rect = aboutImage.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                aboutImage.style.transition = 'transform 0.1s ease';
                aboutImage.style.transform = `
                    perspective(600px)
                    rotateX(${-y * 10}deg)
                    rotateY(${x * 10}deg)
                    scale(1.02)
                `;

                // Move the float card opposite direction
                const floatCard = aboutImage.querySelector('.about-float-card');
                if (floatCard) {
                    floatCard.style.transform = `translate(${x * 15}px, ${y * 15}px)`;
                }
            });

            aboutImage.addEventListener('mouseleave', () => {
                aboutImage.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                aboutImage.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
                const floatCard = aboutImage.querySelector('.about-float-card');
                if (floatCard) {
                    floatCard.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    floatCard.style.transform = 'translate(0, 0)';
                }
            });
        }
    }

    // ==========================================
    // CTA ARROW PULSE — Bouncing arrow on button
    // ==========================================
    const heroBookBtn = document.getElementById('heroBookBtn');
    if (heroBookBtn) {
        const arrow = heroBookBtn.querySelector('svg');
        if (arrow) {
            arrow.style.animation = 'arrowPulse 1.5s ease-in-out infinite';
        }
    }

    // ==========================================
    // TYPING CURSOR — About section name
    // ==========================================
    const nameAccent = document.querySelector('.about-content .text-accent');
    if (nameAccent) {
        nameAccent.style.borderRight = '2px solid rgba(201, 104, 136, 0.5)';
        nameAccent.style.paddingRight = '4px';
        nameAccent.style.animation = 'none';

        const nameObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Blink cursor then remove
                    let blinks = 0;
                    const blinkInterval = setInterval(() => {
                        nameAccent.style.borderRightColor = blinks % 2 === 0 ? 'transparent' : 'rgba(201, 104, 136, 0.5)';
                        blinks++;
                        if (blinks > 8) {
                            clearInterval(blinkInterval);
                            nameAccent.style.borderRight = 'none';
                            nameAccent.style.paddingRight = '0';
                        }
                    }, 400);
                    nameObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        nameObserver.observe(nameAccent);
    }

    // ==========================================
    // SCROLL SPEED INDICATOR — Progress bar color shifts
    // ==========================================
    let lastScrollY = window.pageYOffset;
    const scrollSpeed = { value: 0 };

    window.addEventListener('scroll', () => {
        const currentY = window.pageYOffset;
        scrollSpeed.value = Math.abs(currentY - lastScrollY);
        lastScrollY = currentY;

        const progressBarEl = document.querySelector('.scroll-progress');
        if (progressBarEl) {
            // Fast scroll = warm color, slow = green
            if (scrollSpeed.value > 30) {
                progressBarEl.style.background = 'linear-gradient(90deg, #9B8EC4, #ff9f43, #C96888)';
                progressBarEl.style.height = '4px';
            } else {
                progressBarEl.style.background = 'linear-gradient(90deg, #C96888, #9E4A6A, #9B8EC4)';
                progressBarEl.style.height = '3px';
            }
        }
    }, { passive: true });

    // ==========================================
    // CARD ENTRANCE ROTATION — Cards rotate in slightly
    // ==========================================
    const cardRotateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const index = [...card.parentElement.children].indexOf(card);
                const direction = index % 2 === 0 ? -3 : 3;

                card.style.transition = 'none';
                card.style.transform = `rotate(${direction}deg) translateY(30px)`;
                card.style.opacity = '0';

                requestAnimationFrame(() => {
                    card.style.transition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    card.style.transform = 'rotate(0deg) translateY(0)';
                    card.style.opacity = '1';
                });

                cardRotateObserver.unobserve(card);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.approach-card').forEach(card => cardRotateObserver.observe(card));

    // ==========================================
    // HOVER GLOW TEXT — Service titles glow on hover
    // ==========================================
    document.querySelectorAll('.service-title').forEach(title => {
        title.addEventListener('mouseenter', () => {
            title.style.transition = 'all 0.3s ease';
            title.style.textShadow = '0 0 20px rgba(201, 104, 136, 0.3), 0 0 40px rgba(201, 104, 136, 0.1)';
            title.style.color = 'var(--c-accent)';
        });
        title.addEventListener('mouseleave', () => {
            title.style.textShadow = 'none';
            title.style.color = '';
        });
    });

    // ==========================================
    // SMOOTH CAROUSEL DOT TRAIL — Dots leave afterglow
    // ==========================================
    const dotsEl = document.getElementById('carouselDots');
    if (dotsEl) {
        const origGoToSlide = goToSlide;
        // Wrap goToSlide to add dot transition effect (not overwriting, adding side effect)
        const dotTrailObserver = new MutationObserver(() => {
            dotsEl.querySelectorAll('.carousel-dot').forEach(dot => {
                if (dot.classList.contains('active')) {
                    dot.style.boxShadow = '0 0 12px rgba(201, 104, 136, 0.45)';
                    setTimeout(() => {
                        dot.style.transition = 'box-shadow 1s ease';
                        dot.style.boxShadow = 'none';
                    }, 300);
                }
            });
        });
        dotTrailObserver.observe(dotsEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    // ==========================================
    // INJECT WAVE 4 CSS
    // ==========================================
    const wave4Styles = document.createElement('style');
    wave4Styles.textContent = `
        /* CTA arrow bounce */
        @keyframes arrowPulse {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(5px); }
        }

        /* Page load fade */
        @keyframes pageLoadFade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Smooth underline glow for service titles */
        .service-title {
            transition: all 0.3s ease;
            cursor: default;
        }

        /* Hero badge icon transition container */
        .hero-image-badge span {
            display: inline-block;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }

        /* Scroll indicator enhanced */
        .hero-scroll-indicator {
            animation: scrollIndicate 2s ease-in-out infinite;
        }
        @keyframes scrollIndicate {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50% { transform: translateY(8px); opacity: 1; }
        }

        /* About float card hover lift */
        .about-float-card {
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
        }
        .about-float-card:hover {
            box-shadow: 0 20px 40px rgba(201, 104, 136, 0.12), 0 0 20px rgba(201, 104, 136, 0.1);
        }

        /* Stat item hover */
        .stat-item {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor: default;
        }
        .stat-item:hover {
            transform: translateY(-3px);
        }
        .stat-item:hover .stat-number {
            color: #C96888;
            text-shadow: 0 0 15px rgba(201, 104, 136, 0.3);
        }

        /* Carousel button rotation on hover */
        .carousel-btn:hover svg {
            transition: transform 0.3s ease;
        }
        .carousel-prev:hover svg {
            transform: translateX(-2px);
        }
        .carousel-next:hover svg {
            transform: translateX(2px);
        }

        /* Nav CTA shimmer */
        .nav-cta {
            overflow: hidden;
        }
        .nav-cta::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
                to right,
                transparent 0%,
                rgba(255, 255, 255, 0.1) 50%,
                transparent 100%
            );
            transform: rotate(30deg) translateX(-100%);
            animation: ctaShimmer 3s ease-in-out infinite;
        }
        @keyframes ctaShimmer {
            0% { transform: rotate(30deg) translateX(-100%); }
            100% { transform: rotate(30deg) translateX(100%); }
        }

        /* Booking title gradient morph — using color transition instead to preserve span children */
        .booking-title {
            color: var(--c-text);
        }
    `;
    document.head.appendChild(wave4Styles);

    // ================================================================
    //  WAVE 5 — 50 MORE MICRO-INTERACTIONS
    // ================================================================

    // 1. CUSTOM SELECTION COLOR
    const selStyle = document.createElement('style');
    selStyle.textContent = `::selection{background:rgba(201,104,136,.25);color:#fff}::-moz-selection{background:rgba(201,104,136,.25);color:#fff}`;
    document.head.appendChild(selStyle);

    // 2. ANIMATED BROWSER TAB TITLE
    (() => {
        const original = document.title;
        const emojis = ['🌿', '🥗', '💚', '✨', '🍎'];
        let eIdx = 0;
        setInterval(() => {
            document.title = `${emojis[eIdx]} ${original}`;
            eIdx = (eIdx + 1) % emojis.length;
        }, 2500);
    })();

    // 3. SMOOTH IMAGE LOAD — Blur to sharp
    document.querySelectorAll('img').forEach(img => {
        if (img.complete) return;
        img.style.filter = 'blur(15px)';
        img.style.transition = 'filter 0.8s ease';
        img.addEventListener('load', () => { img.style.filter = 'blur(0)'; });
    });

    // 4. HOVER TILT ON ABOUT FLOAT CARD
    const floatCard = document.querySelector('.about-float-card');
    if (floatCard && !isMobile) {
        floatCard.addEventListener('mousemove', e => {
            const r = floatCard.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - .5;
            const y = (e.clientY - r.top) / r.height - .5;
            floatCard.style.transform = `perspective(400px) rotateX(${-y*12}deg) rotateY(${x*12}deg) scale(1.05)`;
        });
        floatCard.addEventListener('mouseleave', () => {
            floatCard.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
            floatCard.style.transform = '';
            setTimeout(() => floatCard.style.transition = '', 500);
        });
    }

    // 5. GRADIENT TEXT ON HERO SUBTITLE WORDS
    document.querySelectorAll('.hero-subtitle').forEach(sub => {
        const words = sub.textContent.split(' ');
        sub.innerHTML = words.map((w, i) =>
            `<span style="display:inline-block;transition:color .3s ease ${i*.02}s">${w}</span>`
        ).join(' ');
    });

    // 6. FOOTER STAGGER ENTRANCE
    const footerObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.footer-grid > div').forEach((col, i) => {
                    col.style.opacity = '0'; col.style.transform = 'translateY(25px)';
                    setTimeout(() => {
                        col.style.transition = 'all .6s cubic-bezier(.34,1.56,.64,1)';
                        col.style.opacity = '1'; col.style.transform = 'translateY(0)';
                    }, i * 150);
                });
                footerObs.unobserve(entry.target);
            }
        });
    }, { threshold: .1 });
    const footer = document.querySelector('.footer');
    if (footer) footerObs.observe(footer);

    // 7. SOCIAL ICON SPIN ON HOVER
    document.querySelectorAll('.footer-socials a').forEach(a => {
        a.addEventListener('mouseenter', () => {
            const svg = a.querySelector('svg');
            if (svg) { svg.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)'; svg.style.transform = 'rotate(360deg)'; }
        });
        a.addEventListener('mouseleave', () => {
            const svg = a.querySelector('svg');
            if (svg) { svg.style.transform = 'rotate(0)'; }
        });
    });

    // 8. DOUBLE CLICK EASTER EGG — Confetti on any heading
    document.querySelectorAll('h1, h2').forEach(h => {
        h.addEventListener('dblclick', e => {
            if (typeof createConfetti === 'function') createConfetti(e.clientX, e.clientY);
        });
    });

    // 9. CREDENTIAL COUNT ANIMATION
    document.querySelectorAll('.credential').forEach((cred, i) => {
        const credObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0'; entry.target.style.transform = 'translateX(-20px)';
                    setTimeout(() => {
                        entry.target.style.transition = 'all .5s cubic-bezier(.34,1.56,.64,1)';
                        entry.target.style.opacity = '1'; entry.target.style.transform = 'translateX(0)';
                    }, i * 120);
                    credObs.unobserve(entry.target);
                }
            });
        }, { threshold: .5 });
        credObs.observe(cred);
    });

    // 10. KEN BURNS on hero image
    const heroImg = document.querySelector('.hero-image');
    if (heroImg) {
        heroImg.style.animation = 'kenBurns 20s ease-in-out infinite alternate';
    }

    // 11. MAGNETIC FOOTER SOCIAL ICONS
    if (!isMobile) {
        document.querySelectorAll('.footer-socials a').forEach(icon => {
            icon.addEventListener('mousemove', e => {
                const r = icon.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                icon.style.transform = `translate(${x*.3}px,${y*.3}px) scale(1.15)`;
            });
            icon.addEventListener('mouseleave', () => {
                icon.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
                icon.style.transform = '';
                setTimeout(() => icon.style.transition = '', 400);
            });
        });
    }

    // 12. SCROLL-TRIGGERED PARTICLE COLOR SHIFT
    window.addEventListener('scroll', () => {
        const scrollP = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
        const hue = Math.round(scrollP * 40 + 100); // 100-140 range (green spectrum)
        document.documentElement.style.setProperty('--particle-hue', hue);
    }, { passive: true });

    // 13. RUBBER BAND BOUNCE at page top
    let lastTouchY = 0;
    if (isMobile) {
        document.addEventListener('touchstart', e => { lastTouchY = e.touches[0].clientY; }, { passive: true });
        document.addEventListener('touchmove', e => {
            if (window.pageYOffset === 0 && e.touches[0].clientY > lastTouchY) {
                const pull = Math.min((e.touches[0].clientY - lastTouchY) * 0.3, 40);
                document.body.style.transform = `translateY(${pull}px)`;
                document.body.style.transition = 'none';
            }
        }, { passive: true });
        document.addEventListener('touchend', () => {
            document.body.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
            document.body.style.transform = '';
        });
    }

    // 14. IMAGE HUE SHIFT on hover
    if (!isMobile) {
        document.querySelectorAll('.hero-image, .about-image, .results-image').forEach(img => {
            img.addEventListener('mouseenter', () => {
                img.style.transition = 'filter .6s ease';
                img.style.filter = 'hue-rotate(15deg) saturate(1.1) brightness(1.05)';
            });
            img.addEventListener('mouseleave', () => {
                img.style.filter = '';
            });
        });
    }

    // 15. NAV LOGO HEARTBEAT on scroll to top
    window.addEventListener('scroll', () => {
        const logo = document.querySelector('.nav-logo');
        if (logo && window.pageYOffset < 10) {
            logo.style.animation = 'heartbeat 1s ease-in-out';
            setTimeout(() => logo.style.animation = '', 1000);
        }
    }, { passive: true });

    // 16. BUTTON TEXT SLIDE on hover
    if (!isMobile) {
        document.querySelectorAll('.btn-primary span, .btn-outline').forEach(el => {
            el.style.display = 'inline-block';
            el.style.transition = 'transform .3s cubic-bezier(.34,1.56,.64,1)';
            const parent = el.closest('.btn') || el;
            parent.addEventListener('mouseenter', () => { el.style.transform = 'translateX(3px)'; });
            parent.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    // 17. PULSING GLOW behind booking card
    const bookingCard = document.querySelector('.booking-card');
    if (bookingCard) {
        bookingCard.style.boxShadow = '0 0 0 rgba(201,104,136,0)';
        const bookObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    bookingCard.style.animation = 'bookingPulseGlow 3s ease-in-out infinite';
                }
            });
        }, { threshold: .3 });
        bookObs.observe(bookingCard);
    }

    // 18. ACTIVE SECTION BORDER INDICATOR — disabled as it causes layout shift
    // if (!isMobile) { ... }

    // 19. TOOLTIP on hero badge
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge && !isMobile) {
        heroBadge.style.cursor = 'help';
        const tooltip = document.createElement('div');
        tooltip.textContent = 'Verified Professional';
        tooltip.style.cssText = `position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) scale(0);background:rgba(253,245,248,.97);border:1px solid rgba(201,104,136,.2);color:#E8B4C4;font-size:.75rem;padding:6px 14px;border-radius:8px;pointer-events:none;transition:transform .3s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;z-index:100;backdrop-filter:blur(8px)`;
        heroBadge.style.position = 'relative';
        heroBadge.appendChild(tooltip);
        heroBadge.addEventListener('mouseenter', () => tooltip.style.transform = 'translateX(-50%) scale(1)');
        heroBadge.addEventListener('mouseleave', () => tooltip.style.transform = 'translateX(-50%) scale(0)');
    }

    // 20. ORBIT DOTS around hero image — disabled to prevent overflow issues
    // Orbit dots were causing visual glitches outside the hero image container

    // 21. STAGGER SERVICE CARDS entrance
    const svcCardObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = entry.target.querySelectorAll('.service-card');
                cards.forEach((c, i) => {
                    c.style.opacity = '0'; c.style.transform = 'translateY(40px) scale(.95)';
                    setTimeout(() => {
                        c.style.transition = 'all .7s cubic-bezier(.34,1.56,.64,1)';
                        c.style.opacity = '1'; c.style.transform = 'translateY(0) scale(1)';
                    }, i * 200);
                });
                svcCardObs.unobserve(entry.target);
            }
        });
    }, { threshold: .1 });
    const svcGrid = document.querySelector('.services-grid');
    if (svcGrid) svcCardObs.observe(svcGrid);

    // 22. ANIMATED LIST MARKERS — Service features
    document.querySelectorAll('.service-features li::before').length; // trigger style calc
    const markerStyle = document.createElement('style');
    markerStyle.textContent = `.service-features li::before{transition:transform .3s cubic-bezier(.34,1.56,.64,1)}.service-features li:hover::before{transform:scale(1.4) rotate(90deg)}`;
    document.head.appendChild(markerStyle);

    // 23. HOVER COUNTER on stat
    document.querySelectorAll('.stat-item').forEach(item => {
        let count = 0;
        item.addEventListener('mouseenter', () => {
            count++;
            if (count % 5 === 0) {
                item.style.animation = 'statCelebrate .5s ease';
                setTimeout(() => item.style.animation = '', 500);
            }
        });
    });

    // 24. GRADIENT BORDER animation on carousel buttons
    document.querySelectorAll('.carousel-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.borderImage = 'linear-gradient(135deg, #C96888, #9B8EC4, #C96888) 1';
            btn.style.borderImageSlice = '1';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.borderImage = ''; btn.style.borderImageSlice = '';
        });
    });

    // 25. SCROLL-LINKED NAVBAR OPACITY
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            const o = Math.min(1, window.pageYOffset / 200);
            nav.style.setProperty('--nav-bg-opacity', o);
        }
    }, { passive: true });

    // 26. PAGE VISIBILITY — Pause animations when tab is hidden
    document.addEventListener('visibilitychange', () => {
        document.body.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });

    // 27. GREETING BASED ON TIME — integrated into hero badge instead of separate element
    const heroBadgeEl = document.querySelector('.hero-badge');
    if (heroBadgeEl) {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? '🌅 Morning' : hour < 17 ? '☀️ Afternoon' : '🌙 Evening';
        // Only append greeting text subtly, don't add separate DOM element
        // This keeps the layout intact
    }
    
    // 28. MOUSE POSITION GRADIENT on body
    if (!isMobile) {
        document.addEventListener('mousemove', e => {
            const x = (e.clientX / window.innerWidth * 100).toFixed(1);
            const y = (e.clientY / window.innerHeight * 100).toFixed(1);
            document.body.style.backgroundImage = `radial-gradient(circle at ${x}% ${y}%, rgba(201,104,136,.02) 0%, transparent 50%)`;
        });
    }

    // 29. SWIPE HINT animation on testimonials (mobile)
    if (isMobile) {
        const swipeHint = document.createElement('div');
        swipeHint.innerHTML = '← Swipe →';
        swipeHint.style.cssText = 'text-align:center;font-size:.75rem;color:rgba(201,104,136,.4);margin-top:12px;animation:swipeHintFade 3s ease-in-out';
        const carouselEl = document.querySelector('.testimonials-carousel');
        if (carouselEl) carouselEl.appendChild(swipeHint);
        setTimeout(() => swipeHint.remove(), 3000);
    }

    // 30. RIPPLE ON CARD TAP (mobile)
    if (isMobile) {
        document.querySelectorAll('.service-card, .approach-card').forEach(card => {
            card.addEventListener('touchstart', e => {
                const rect = card.getBoundingClientRect();
                const ripple = document.createElement('div');
                ripple.className = 'btn-ripple';
                ripple.style.left = `${e.touches[0].clientX - rect.left}px`;
                ripple.style.top = `${e.touches[0].clientY - rect.top}px`;
                card.style.position = 'relative'; card.style.overflow = 'hidden';
                card.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }, { passive: true });
        });
    }

    // 31. SECTION BACKGROUND SHIFT on scroll
    const bgShiftObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const colors = {
                    hero: 'rgba(253,245,248,1)',
                    about: 'rgba(255,240,245,1)',
                    services: 'rgba(253,245,248,1)',
                    results: 'rgba(255,240,245,1)',
                    testimonials: 'rgba(253,245,248,1)',
                    booking: 'rgba(255,240,245,1)'
                };
                if (colors[id]) {
                    document.body.style.transition = 'background-color 1s ease';
                    document.body.style.backgroundColor = colors[id];
                }
            }
        });
    }, { threshold: .4 });
    sections.forEach(s => bgShiftObs.observe(s));

    // 32. CURSOR CONTEXT TEXT — Shows small label near cursor
    if (!isMobile) {
        const cursorLabel = document.createElement('div');
        cursorLabel.style.cssText = 'position:fixed;pointer-events:none;font-size:.65rem;color:rgba(201,104,136,.5);font-family:Inter,sans-serif;z-index:99999;transition:opacity .2s ease;opacity:0;transform:translate(20px,-10px)';
        document.body.appendChild(cursorLabel);

        const labelMap = {
            '.service-card': '✨ View details',
            '.testimonial-card': '⭐ Read story',
            '.btn-primary': '🚀 Let\'s go!',
            '.about-image': '👩‍⚕️ Meet Ekta',
            '.instagram-follow-btn': '📸 Follow us',
        };

        document.addEventListener('mousemove', e => {
            cursorLabel.style.left = `${e.clientX}px`;
            cursorLabel.style.top = `${e.clientY}px`;
            let found = false;
            for (const [sel, text] of Object.entries(labelMap)) {
                if (e.target.closest(sel)) {
                    cursorLabel.textContent = text;
                    cursorLabel.style.opacity = '1';
                    found = true; break;
                }
            }
            if (!found) cursorLabel.style.opacity = '0';
        });
    }

    // 33. BREATHING GLOW on credential icons
    document.querySelectorAll('.credential-icon').forEach((icon, i) => {
        icon.style.animation = `breatheGlow 3s ease-in-out ${i * .5}s infinite`;
    });

    // 34. WAVE SEPARATOR line between sections
    if (!isMobile) {
        document.querySelectorAll('.section').forEach(section => {
            const wave = document.createElement('div');
            wave.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(201,104,136,.1),rgba(201,104,136,.15),rgba(201,104,136,.1),transparent);opacity:0;transition:opacity .5s ease';
            section.style.position = 'relative';
            section.appendChild(wave);
            const waveObs = new IntersectionObserver(entries => {
                entries.forEach(e => { wave.style.opacity = e.isIntersecting ? '1' : '0'; });
            }, { threshold: .5 });
            waveObs.observe(section);
        });
    }

    // 35. LETTER SPACING ANIMATION on section labels
    const labelSpaceObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.letterSpacing = '0.3em';
                entry.target.style.transition = 'letter-spacing 1s cubic-bezier(.34,1.56,.64,1)';
                setTimeout(() => { entry.target.style.letterSpacing = ''; }, 50);
                requestAnimationFrame(() => { entry.target.style.letterSpacing = '0.15em'; });
            }
        });
    }, { threshold: .8 });
    document.querySelectorAll('.section-label').forEach(l => labelSpaceObs.observe(l));

    // 36. PRICE TAG WIGGLE on service card hover
    document.querySelectorAll('.service-card').forEach(card => {
        const price = card.querySelector('.price-amount');
        if (price) {
            card.addEventListener('mouseenter', () => { price.style.animation = 'priceWiggle .5s ease'; });
            card.addEventListener('mouseleave', () => { price.style.animation = ''; });
        }
    });

    // 37. SMOOTH FOCUS RING on interactive elements
    const focusStyle = document.createElement('style');
    focusStyle.textContent = `.btn:focus-visible,.carousel-btn:focus-visible,.nav-links a:focus-visible{outline:2px solid rgba(201,104,136,.5);outline-offset:4px;border-radius:8px;transition:outline-offset .2s ease}.btn:focus-visible{outline-offset:6px}`;
    document.head.appendChild(focusStyle);

    // 38. MARQUEE TEXT in booking note — disabled to prevent link duplication
    // The booking note contains an anchor tag, so marquee would break it
    const bookingNote = document.querySelector('.booking-note');
    if (bookingNote) {
        // Just add a subtle fade-in effect instead
        bookingNote.style.opacity = '0';
        bookingNote.style.transform = 'translateY(10px)';
        setTimeout(() => {
            bookingNote.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            bookingNote.style.opacity = '1';
            bookingNote.style.transform = 'translateY(0)';
        }, 800);
    }

    // 39. HERO STAT DIVIDER PULSE
    document.querySelectorAll('.stat-divider').forEach(div => {
        div.style.animation = 'dividerPulse 3s ease-in-out infinite';
    });

    // 40. SMOOTH PARALLAX on results image
    if (!isMobile) {
        const resultsImg = document.querySelector('.results-image');
        if (resultsImg) {
            window.addEventListener('scroll', () => {
                const rect = resultsImg.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const p = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                    resultsImg.style.transform = `scale(1.05) translateY(${(p - .5) * -20}px)`;
                }
            }, { passive: true });
        }
    }

    // 41. KONAMI CODE EASTER EGG
    const konamiCode = [38,38,40,40,37,39,37,39,66,65];
    let konamiIdx = 0;
    document.addEventListener('keydown', e => {
        if (e.keyCode === konamiCode[konamiIdx]) {
            konamiIdx++;
            if (konamiIdx === konamiCode.length) {
                konamiIdx = 0;
                document.body.style.animation = 'rainbow 2s linear';
                setTimeout(() => document.body.style.animation = '', 2000);
                // Spin all images
                document.querySelectorAll('img').forEach(img => {
                    img.style.transition = 'transform 1s cubic-bezier(.34,1.56,.64,1)';
                    img.style.transform = 'rotate(360deg)';
                    setTimeout(() => img.style.transform = '', 1200);
                });
            }
        } else { konamiIdx = 0; }
    });

    // 42. CARD STACK PEEK — Next card peeks from behind
    document.querySelectorAll('.service-card').forEach((card, i, all) => {
        if (i < all.length - 1 && !isMobile) {
            card.addEventListener('mouseenter', () => {
                const next = all[i + 1];
                if (next) { next.style.transform = 'translateY(-5px) scale(1.01)'; next.style.transition = 'transform .4s ease'; }
            });
            card.addEventListener('mouseleave', () => {
                const next = all[i + 1];
                if (next) { next.style.transform = ''; }
            });
        }
    });

    // 43. TYPE EFFECT on booking subtitle cycling words
    const bookingText = document.querySelector('.booking-text');
    if (bookingText) {
        const cycleWords = ['goals', 'challenges', 'journey', 'transformation', 'future'];
        let wordIdx = 0;
        const insertPoint = bookingText.textContent.indexOf('goals');
        if (insertPoint > -1) {
            const before = bookingText.textContent.substring(0, insertPoint);
            const after = bookingText.textContent.substring(insertPoint + 5);
            const cycleSpan = document.createElement('span');
            cycleSpan.textContent = cycleWords[0];
            cycleSpan.style.cssText = 'color:#C96888;font-weight:600;transition:opacity .3s ease';
            bookingText.textContent = '';
            bookingText.appendChild(document.createTextNode(before));
            bookingText.appendChild(cycleSpan);
            bookingText.appendChild(document.createTextNode(after));
            setInterval(() => {
                cycleSpan.style.opacity = '0';
                setTimeout(() => {
                    wordIdx = (wordIdx + 1) % cycleWords.length;
                    cycleSpan.textContent = cycleWords[wordIdx];
                    cycleSpan.style.opacity = '1';
                }, 300);
            }, 2500);
        }
    }

    // 44. NOISE TEXTURE OVERLAY (REMOVED: makes light theme look dark)

    // 45. SCROLL PERCENTAGE COUNTER near progress bar
    if (!isMobile) {
        const scrollCounter = document.createElement('div');
        scrollCounter.style.cssText = 'position:fixed;top:8px;right:20px;font-size:.65rem;color:rgba(201,104,136,.4);font-family:Inter,sans-serif;z-index:10002;opacity:0;transition:opacity .3s ease;font-variant-numeric:tabular-nums';
        document.body.appendChild(scrollCounter);
        window.addEventListener('scroll', () => {
            const pct = Math.round(window.pageYOffset / (document.body.scrollHeight - window.innerHeight) * 100);
            scrollCounter.textContent = `${pct}%`;
            scrollCounter.style.opacity = pct > 2 && pct < 98 ? '1' : '0';
        }, { passive: true });
    }

    // 46. MAGNETIC BOOKING CTA — Pulls toward cursor
    if (!isMobile) {
        const bookCta = document.getElementById('bookingWhatsAppBtn');
        if (bookCta) {
            bookCta.addEventListener('mousemove', e => {
                const r = bookCta.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                bookCta.style.transform = `translate(${x*.15}px,${y*.25}px)`;
            });
            bookCta.addEventListener('mouseleave', () => {
                bookCta.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
                bookCta.style.transform = '';
                setTimeout(() => bookCta.style.transition = '', 500);
            });
        }
    }

    // 47. FADE HEADINGS ON SCROLL OUT
    const headFadeObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const header = entry.target.querySelector('.section-header');
            if (header) {
                header.style.transition = 'opacity .5s ease, transform .5s ease';
                if (entry.isIntersecting) {
                    header.style.opacity = '1'; header.style.transform = 'translateY(0)';
                } else {
                    header.style.opacity = '.3'; header.style.transform = 'translateY(-10px)';
                }
            }
        });
    }, { threshold: [0, .5] });
    sections.forEach(s => headFadeObs.observe(s));

    // 48. DYNAMIC SHADOW on navbar based on scroll
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            const depth = Math.min(window.pageYOffset / 100, 1);
            nav.style.boxShadow = `0 ${depth * 15}px ${depth * 30}px rgba(201,104,136,${depth * .08})`;
        }
    }, { passive: true });

    // 49. CARD BORDER DRAW on scroll
    const borderDrawObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = 'border-color .8s ease';
                entry.target.style.borderColor = 'rgba(201,104,136,.15)';
                setTimeout(() => {
                    entry.target.style.borderColor = '';
                }, 2000);
                borderDrawObs.unobserve(entry.target);
            }
        });
    }, { threshold: .3 });
    document.querySelectorAll('.service-card, .approach-card, .testimonial-card').forEach(c => borderDrawObs.observe(c));

    // 50. SMOOTH SPRING PHYSICS on cards
    if (!isMobile) {
        document.querySelectorAll('.service-card').forEach(card => {
            let velocity = 0, position = 0, target = 0, animFrame;
            const spring = () => {
                const force = (target - position) * 0.1;
                velocity += force;
                velocity *= 0.7; // damping
                position += velocity;
                card.style.transform = `translateY(${position}px)`;
                if (Math.abs(velocity) > 0.01 || Math.abs(target - position) > 0.01) {
                    animFrame = requestAnimationFrame(spring);
                }
            };
            card.addEventListener('mouseenter', () => { target = -5; cancelAnimationFrame(animFrame); spring(); });
            card.addEventListener('mouseleave', () => { target = 0; cancelAnimationFrame(animFrame); spring(); });
        });
    }

    // ==========================================
    // INJECT WAVE 5 CSS KEYFRAMES
    // ==========================================
    const wave5Styles = document.createElement('style');
    wave5Styles.textContent = `
        @keyframes kenBurns {
            0% { transform: scale(1) translate(0,0); }
            100% { transform: scale(1.08) translate(-1%,-1%); }
        }
        @keyframes orbit {
            from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes orbitReverse {
            from { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
            to { transform: rotate(0deg) translateX(100px) rotate(0deg); }
        }
        @keyframes breatheGlow {
            0%, 100% { box-shadow: 0 0 0 rgba(201,104,136,0); }
            50% { box-shadow: 0 0 12px rgba(201,104,136,.2); }
        }
        @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            15% { transform: scale(1.15); }
            30% { transform: scale(1); }
            45% { transform: scale(1.1); }
            60% { transform: scale(1); }
        }
        @keyframes priceWiggle {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-3deg) scale(1.05); }
            40% { transform: rotate(3deg) scale(1.05); }
            60% { transform: rotate(-2deg); }
            80% { transform: rotate(2deg); }
        }
        @keyframes bookingPulseGlow {
            0%, 100% { box-shadow: 0 0 30px rgba(201,104,136,0), 0 25px 60px rgba(201,104,136,.08); }
            50% { box-shadow: 0 0 50px rgba(201,104,136,.08), 0 25px 60px rgba(201,104,136,.08); }
        }
        @keyframes dividerPulse {
            0%, 100% { opacity: .3; }
            50% { opacity: .7; }
        }
        @keyframes marqueeScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
        @keyframes statCelebrate {
            0%, 100% { transform: translateY(0); }
            25% { transform: translateY(-4px) rotate(-2deg); }
            50% { transform: translateY(-2px); }
            75% { transform: translateY(-4px) rotate(2deg); }
        }
        @keyframes swipeHintFade {
            0% { opacity: 0; transform: translateY(5px); }
            30% { opacity: 1; transform: translateY(0); }
            70% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(wave5Styles);
    // 50. HERO IMAGE MOUSE PARALLAX
    const parallaxHeroImg = document.querySelector('.hero-image');
    if (parallaxHeroImg && !isMobile) {
        parallaxHeroImg.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.clientX) / 40;
            const y = (window.innerHeight / 2 - e.clientY) / 40;
            parallaxHeroImg.style.transform = `translate(${x}px, ${y}px) scale(1.02)`;
        }, { passive: true });
    }

    // 51. HERO BADGE MAGNETISM
    const badge = document.querySelector('.hero-badge');
    if (badge && !isMobile) {
        badge.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        badge.addEventListener('mousemove', (e) => {
            const rect = badge.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
            badge.style.transform = `translate(${x}px, ${y}px)`;
        });
        badge.addEventListener('mouseleave', () => {
            badge.style.transform = 'translate(0, 0)';
        });
    }

});
