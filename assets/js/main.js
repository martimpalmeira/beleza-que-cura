/* ============================================
   BELEZA QUE CURA — Interaction & Animations
   ============================================ */

(() => {
    'use strict';

    /* ---------- LOADER ---------- */
    window.addEventListener('load', () => {
        const loader = document.getElementById('loader');
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = '';
            // Trigger initial reveals
            initialReveal();
        }, 1800);
    });

    document.body.style.overflow = 'hidden';

    /* ---------- CUSTOM CURSOR ---------- */
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursorFollower');

    if (cursor && follower && window.matchMedia('(min-width: 1025px)').matches) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        });

        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
            requestAnimationFrame(animateFollower);
        };
        animateFollower();

        const interactive = document.querySelectorAll('a, button, .btn, summary, [data-hover]');
        interactive.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover-active');
                follower.classList.add('hover-active');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover-active');
                follower.classList.remove('hover-active');
            });
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            follower.style.opacity = '0.5';
        });
    }

    /* ---------- NAV ON SCROLL ---------- */
    const nav = document.getElementById('nav');
    const scrollProgress = document.getElementById('scrollProgress');

    const onScroll = () => {
        const scrolled = window.scrollY;
        nav.classList.toggle('scrolled', scrolled > 60);

        // Progress bar
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / docHeight) * 100;
        scrollProgress.style.width = `${progress}%`;

        // Parallax (disabled on mobile to avoid layout gaps)
        if (window.matchMedia('(min-width: 1025px)').matches) {
            document.querySelectorAll('[data-parallax]').forEach(el => {
                const speed = parseFloat(el.dataset.parallax);
                const rect = el.getBoundingClientRect();
                const visible = rect.top < window.innerHeight && rect.bottom > 0;
                if (visible) {
                    const offset = (window.innerHeight - rect.top) * speed;
                    el.style.transform = `translate3d(0, ${-offset * 0.2}px, 0)`;
                }
            });
        }

        // Nav active section
        updateActiveNav();
    };

    window.addEventListener('scroll', () => {
        requestAnimationFrame(onScroll);
    }, { passive: true });

    /* ---------- ACTIVE NAV ---------- */
    const navLinks = document.querySelectorAll('[data-nav]');
    const sections = Array.from(navLinks).map(link => {
        const id = link.getAttribute('href').slice(1);
        return document.getElementById(id);
    }).filter(Boolean);

    const updateActiveNav = () => {
        const scrollPos = window.scrollY + 200;
        let current = null;
        sections.forEach((section, i) => {
            if (section && section.offsetTop <= scrollPos) {
                current = i;
            }
        });
        navLinks.forEach((link, i) => {
            link.classList.toggle('active', i === current);
        });
    };

    /* ---------- MOBILE MENU ---------- */
    const toggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            const isOpen = toggle.classList.toggle('active');
            mobileMenu.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
            toggle.setAttribute('aria-expanded', isOpen);
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                mobileMenu.classList.remove('open');
                document.body.style.overflow = '';
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- REVEAL ON SCROLL ---------- */
    const reveals = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt(el.dataset.delay || 0);
                setTimeout(() => el.classList.add('in'), delay);
                revealObserver.unobserve(el);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -80px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));

    const initialReveal = () => {
        // Hero elements already in viewport — animate them
        document.querySelectorAll('.hero .reveal').forEach(el => {
            const delay = parseInt(el.dataset.delay || 0);
            setTimeout(() => el.classList.add('in'), delay);
            revealObserver.unobserve(el);
        });
    };

    /* ---------- PILLARS SCROLL ACTIVATION ---------- */
    const pillarsSection = document.getElementById('experiencia');
    const pillarCards = pillarsSection ? pillarsSection.querySelectorAll('.pillar') : [];

    if (pillarsSection && pillarCards.length) {
        const updatePillars = () => {
            const rect = pillarsSection.getBoundingClientRect();
            const vh = window.innerHeight;
            // total scrollable distance: from section entering bottom of viewport to section leaving top
            const total = rect.height + vh * 0.6;
            // how far we've scrolled into that range
            const scrolled = vh * 0.85 - rect.top;
            const progress = Math.max(0, Math.min(0.999, scrolled / total));
            // map progress to card index
            const activeIdx = Math.floor(progress * pillarCards.length);

            pillarCards.forEach((card, i) => {
                // cumulative activation: every card up to current index becomes active
                card.classList.toggle('active', i <= activeIdx && progress > 0);
            });
        };
        window.addEventListener('scroll', updatePillars, { passive: true });
        updatePillars();
    }

    /* ---------- COUNTERS ---------- */
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const duration = 2000;
                const start = performance.now();

                const animate = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(eased * target);
                    if (progress < 1) requestAnimationFrame(animate);
                    else el.textContent = target;
                };
                requestAnimationFrame(animate);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));

    /* ---------- SMOOTH SCROLL ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* ---------- HERO TITLE LETTER STAGGER ---------- */
    // Add subtle hover effect on hero words
    document.querySelectorAll('.hero-word').forEach(word => {
        word.addEventListener('mouseenter', () => {
            word.style.transform = 'translateY(-4px)';
            word.style.transition = 'transform .6s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        word.addEventListener('mouseleave', () => {
            word.style.transform = '';
        });
    });

    /* ---------- MAGNETIC BUTTONS ---------- */
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    /* ---------- TILT ON CARDS ---------- */
    document.querySelectorAll('.pillar, .venue-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(max-width: 1024px)').matches) return;
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            card.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ---------- FAQ: close others when opening ---------- */
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                document.querySelectorAll('.faq-item').forEach(other => {
                    if (other !== item) other.open = false;
                });
            }
        });
    });

    /* ---------- DYNAMIC YEAR ---------- */
    const year = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(el => el.textContent = year);

})();
