/* ========================================
   LINDSAY HARTLEY — Director & Writer
   Scrolling layout with inline previews
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Load gallery data
    let galleryData = {};
    fetch('gallery-data.json')
        .then(r => r.json())
        .then(data => { galleryData = data; })
        .catch(() => {});

    // ==========================================
    // TYPEWRITER EFFECT
    // ==========================================
    const typewriterEl = document.getElementById('typewriterText');
    if (typewriterEl) {
        const quote = '"Every frame is a chance to tell the truth."';
        let charIndex = 0;
        setTimeout(() => {
            const typeInterval = setInterval(() => {
                typewriterEl.textContent = quote.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex >= quote.length) {
                    clearInterval(typeInterval);
                    // Hide cursor after typing completes
                    setTimeout(() => {
                        const cursor = document.querySelector('.typewriter-cursor');
                        if (cursor) cursor.style.display = 'none';
                    }, 2000);
                }
            }, 60);
        }, 800);
    }

    // ==========================================
    // STAGGERED TITLE ENTRANCE
    // ==========================================
    document.querySelectorAll('.film-link').forEach((link, i) => {
        link.classList.add('stagger-in');
        link.style.animationDelay = (0.6 + i * 0.04) + 's';
    });

    // ==========================================
    // CUSTOM CURSOR
    // ==========================================
    const cursor = document.getElementById('cursor');
    let cursorX = 0, cursorY = 0, cursorCurrentX = 0, cursorCurrentY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursor.classList.add('visible');
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('visible');
    });

    function animateCursor() {
        cursorCurrentX += (cursorX - cursorCurrentX) * 0.35;
        cursorCurrentY += (cursorY - cursorCurrentY) * 0.35;
        cursor.style.left = cursorCurrentX + 'px';
        cursor.style.top = cursorCurrentY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Expand cursor on interactive elements
    document.querySelectorAll('a, button, .film-link, .pill').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    // ==========================================
    // CATEGORY FILTERS
    // ==========================================
    const filterBtns = document.querySelectorAll('.filters .pill');
    const filmLinks = document.querySelectorAll('.film-link');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            filmLinks.forEach(link => {
                if (filter === 'all') {
                    link.classList.remove('filtered-out');
                    link.classList.remove('filtered-in');
                } else {
                    const cat = link.getAttribute('data-cat');
                    link.classList.toggle('filtered-out', cat !== filter);
                    link.classList.toggle('filtered-in', cat === filter);
                }
            });
        });
    });

    // ==========================================
    // INLINE VIDEO/IMAGE PREVIEW (expands under title)
    // ==========================================
    let activePreview = null;
    let activeVideo = null;

    filmLinks.forEach(link => {
        const folder = link.getAttribute('data-folder');
        const imgPath = link.getAttribute('data-img');

        const previewEl = link.parentElement.querySelector('.inline-preview');

        link.addEventListener('mouseenter', () => {
            // Always close previous preview
            if (activePreview) {
                activePreview.classList.remove('active');
                activePreview.innerHTML = '';
                if (activeVideo) {
                    activeVideo.pause();
                    activeVideo = null;
                }
                activePreview = null;
            }

            // If this film has no folder and no image, nothing to show
            if (!folder && !imgPath) return;
            if (!previewEl) return;

            const entry = folder && galleryData[folder];
            const clip = entry && entry.clip;
            const trailer = entry && entry.trailer;

            // Use clip first, then trailer (local only), then still image
            if (clip) {
                previewEl.innerHTML = '<video src="' + clip + '" muted autoplay loop playsinline></video>';
                activeVideo = previewEl.querySelector('video');
                activeVideo.play().catch(() => {});
            } else if (trailer && !trailer.includes('youtube.com') && !trailer.includes('vimeo.com')) {
                previewEl.innerHTML = '<video src="' + trailer + '" muted autoplay loop playsinline></video>';
                activeVideo = previewEl.querySelector('video');
                activeVideo.play().catch(() => {});
            } else if (imgPath) {
                previewEl.innerHTML = '<img src="' + imgPath + '" alt="">';
                activeVideo = null;
            }

            previewEl.classList.add('active');
            activePreview = previewEl;
        });
    });

    // Close preview when mouse leaves the film grid entirely
    const filmGrid = document.getElementById('filmGrid');
    if (filmGrid) {
        filmGrid.addEventListener('mouseleave', () => {
            if (activePreview) {
                activePreview.classList.remove('active');
                setTimeout(() => { activePreview.innerHTML = ''; }, 600);
                if (activeVideo) {
                    activeVideo.pause();
                    activeVideo = null;
                }
                activePreview = null;
            }
        });
    }

    // ==========================================
    // PROJECT DETAIL OVERLAY
    // ==========================================
    const projectOverlay = document.getElementById('projectOverlay');
    const projectClose = document.getElementById('projectClose');
    const projectTitle = document.getElementById('projectTitle');
    const projectTags = document.getElementById('projectTags');
    const projectGallery = document.getElementById('projectGallery');

    filmLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const folder = link.getAttribute('data-folder');
            const title = link.childNodes[0].textContent.trim();
            const cat = link.getAttribute('data-cat');

            projectTitle.textContent = title;
            projectTags.innerHTML = '<button class="pill project-home-pill">Home</button><span class="pill pill-active">Director</span><span class="pill pill-active">' + cat.charAt(0).toUpperCase() + cat.slice(1) + '</span>';

            // Load gallery
            projectGallery.innerHTML = '';

            if (folder && galleryData[folder]) {
                const entry = galleryData[folder];
                const images = entry.images || [];
                const trailer = entry.trailer || null;

                // Add trailer if exists
                if (trailer) {
                    const videoWrap = document.createElement('div');
                    videoWrap.className = 'project-video';

                    if (trailer.includes('youtube.com') || trailer.includes('vimeo.com') || trailer.includes('dailymotion.com')) {
                        var src = trailer;
                        if (src.includes('youtube.com') && !src.includes('autoplay=1')) {
                            src += (src.includes('?') ? '&' : '?') + 'autoplay=1&mute=1';
                        }
                        if (src.includes('vimeo.com') && !src.includes('autoplay=1')) {
                            src += (src.includes('?') ? '&' : '?') + 'autoplay=1&muted=1';
                        }
                        videoWrap.innerHTML = '<iframe src="' + src + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
                    } else {
                        videoWrap.innerHTML = '<video controls autoplay muted preload="metadata"><source src="' + trailer + '" type="video/mp4"></video>';
                    }
                    projectGallery.appendChild(videoWrap);
                }

                // Add images — use layout if available, otherwise flat grid
                if (entry.layout) {
                    entry.layout.forEach(block => {
                        if (block.type === 'wide') {
                            const wrap = document.createElement('div');
                            wrap.className = 'gallery-wide';
                            const img = document.createElement('img');
                            img.src = block.src;
                            img.alt = title + ' - production still';
                            img.loading = 'lazy';
                            wrap.appendChild(img);
                            projectGallery.appendChild(wrap);
                        } else if (block.type === 'pair') {
                            const wrap = document.createElement('div');
                            wrap.className = 'gallery-pair';
                            block.src.forEach(s => {
                                const img = document.createElement('img');
                                img.src = s;
                                img.alt = title + ' - production still';
                                img.loading = 'lazy';
                                wrap.appendChild(img);
                            });
                            projectGallery.appendChild(wrap);
                        } else if (block.type === 'trio') {
                            const wrap = document.createElement('div');
                            wrap.className = 'gallery-trio';
                            block.src.forEach(s => {
                                const img = document.createElement('img');
                                img.src = s;
                                img.alt = title + ' - production still';
                                img.loading = 'lazy';
                                wrap.appendChild(img);
                            });
                            projectGallery.appendChild(wrap);
                        }
                    });
                } else {
                    images.forEach(imgSrc => {
                        const img = document.createElement('img');
                        img.src = imgSrc;
                        img.alt = title + ' - production still';
                        img.loading = 'lazy';
                        projectGallery.appendChild(img);
                    });
                }
                // Add blur-to-sharp loading effect
                projectGallery.querySelectorAll('img').forEach(img => {
                    if (img.complete) { img.classList.add('loaded'); }
                    else { img.addEventListener('load', () => img.classList.add('loaded')); }
                });

                // Add back-to-top button at end of gallery
                const topBtn = document.createElement('button');
                topBtn.className = 'gallery-top-btn';
                topBtn.textContent = '↑ Back to Top';
                topBtn.addEventListener('click', () => {
                    projectOverlay.scrollTo({ top: 0, behavior: 'smooth' });
                });
                projectGallery.appendChild(topBtn);
            } else {
                projectGallery.innerHTML = '<p style="text-align:center;color:#4a4640;font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:80px 0;">Gallery coming soon</p>';
            }

            // Make Home pill clickable
            const homePill = projectTags.querySelector('.project-home-pill');
            if (homePill) {
                homePill.addEventListener('click', () => closeProject());
            }

            projectOverlay.classList.add('open');
            projectOverlay.scrollTop = 0;
            document.body.style.overflow = 'hidden';

            // Close any inline preview
            if (activePreview) {
                activePreview.classList.remove('active');
                activePreview.innerHTML = '';
                activePreview = null;
            }
        });
    });

    const projectHomeBtn = document.getElementById('projectHomeBtn');

    function closeProject() {
        projectOverlay.classList.remove('open');
        document.body.style.overflow = '';
        projectGallery.querySelectorAll('video').forEach(v => v.pause());
        projectGallery.querySelectorAll('iframe').forEach(f => f.src = '');
    }

    if (projectHomeBtn) {
        projectHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeProject();
        });
    }

    // About link inside project overlay
    document.querySelectorAll('.project-about-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            projectOverlay.classList.remove('open');
            projectGallery.querySelectorAll('video').forEach(v => v.pause());
            projectGallery.querySelectorAll('iframe').forEach(f => f.src = '');
            aboutOverlay.classList.add('open');
        });
    });

    // ==========================================
    // ABOUT OVERLAY
    // ==========================================
    const aboutOverlay = document.getElementById('aboutOverlay');
    const aboutClose = document.getElementById('aboutClose');

    document.querySelectorAll('a[href="#about"], .mobile-menu-link[href="#about"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            aboutOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    aboutClose.addEventListener('click', () => {
        aboutOverlay.classList.remove('open');
        document.body.style.overflow = '';
    });

    const aboutHomeBtn = document.getElementById('aboutHomeBtn');
    if (aboutHomeBtn) {
        aboutHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            aboutOverlay.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // ==========================================
    // SOUND TOGGLE
    // ==========================================
    const soundToggle = document.getElementById('soundToggle');
    const bgReelVideo = document.getElementById('bgReelVideo');

    if (soundToggle && bgReelVideo) {
        let isMuted = true;
        soundToggle.addEventListener('click', () => {
            if (bgReelVideo.tagName === 'VIDEO') {
                bgReelVideo.muted = !bgReelVideo.muted;
                isMuted = bgReelVideo.muted;
            } else if (bgReelVideo.tagName === 'IFRAME') {
                // Toggle mute via Vimeo postMessage API
                const src = bgReelVideo.src;
                if (isMuted) {
                    bgReelVideo.src = src.replace('muted=1', 'muted=0').replace('background=1', 'background=0');
                } else {
                    bgReelVideo.src = src.replace('muted=0', 'muted=1').replace('background=0', 'background=1');
                }
                isMuted = !isMuted;
            }
            if (!isMuted) {
                soundToggle.classList.add('active');
                soundToggle.innerHTML = '&#9836;';
            } else {
                soundToggle.classList.remove('active');
                soundToggle.innerHTML = '&#9834;';
            }
        });
    }

    // ==========================================
    // MINI OVERLAYS (Writer / Actress)
    // ==========================================
    // ROMANCE REEL HOVER PREVIEW
    // ==========================================
    const romancePill = document.getElementById('romanceReelPill');
    const romancePreview = document.getElementById('romanceReelPreview');
    const romanceVideo = romancePreview ? romancePreview.querySelector('video') : null;
    if (romancePill && romancePreview && romanceVideo) {
        romancePill.addEventListener('mouseenter', () => {
            romancePreview.style.display = 'block';
            romanceVideo.currentTime = 0;
            romanceVideo.play().catch(() => {});
        });
        romancePill.addEventListener('mouseleave', () => {
            romancePreview.style.display = 'none';
            romanceVideo.pause();
        });
    }

    // ==========================================
    const writerOverlay = document.getElementById('writerOverlay');
    const actressOverlay = document.getElementById('actressOverlay');
    const writerBtn = document.getElementById('writerBtn');
    const actressBtn = document.getElementById('actressBtn');
    const writerClose = document.getElementById('writerClose');
    const actressClose = document.getElementById('actressClose');

    if (writerBtn) {
        writerBtn.addEventListener('click', () => {
            writerOverlay.classList.add('open');
        });
    }
    if (actressBtn) {
        actressBtn.addEventListener('click', () => {
            actressOverlay.classList.add('open');
        });
    }
    if (writerClose) {
        writerClose.addEventListener('click', () => writerOverlay.classList.remove('open'));
    }
    if (actressClose) {
        actressClose.addEventListener('click', () => actressOverlay.classList.remove('open'));
    }
    [writerOverlay, actressOverlay].forEach(overlay => {
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.classList.remove('open');
            });
        }
    });

    // ==========================================
    // LIGHTBOX
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    document.querySelectorAll('.bts-clickable').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('open');
        });
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('open');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('open');
        }
    });

    // ==========================================
    // HAMBURGER MENU
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });

        // Close menu when a link is clicked
        mobileMenu.querySelectorAll('.mobile-menu-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });
    }

    // Close overlays on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightbox.classList.contains('open')) {
                lightbox.classList.remove('open');
                return;
            }
            if (writerOverlay && writerOverlay.classList.contains('open')) {
                writerOverlay.classList.remove('open');
                return;
            }
            if (actressOverlay && actressOverlay.classList.contains('open')) {
                actressOverlay.classList.remove('open');
                return;
            }
            if (projectOverlay.classList.contains('open')) {
                projectOverlay.classList.remove('open');
                document.body.style.overflow = '';
                projectGallery.querySelectorAll('video').forEach(v => v.pause());
            }
            if (aboutOverlay.classList.contains('open')) {
                aboutOverlay.classList.remove('open');
                document.body.style.overflow = '';
            }
        }
    });

    // ==========================================
    // SCROLL ARROW — smooth scroll to films
    // ==========================================
    const scrollArrow = document.querySelector('.scroll-arrow');
    const filmsSection = document.querySelector('.films-section');
    if (scrollArrow && filmsSection) {
        scrollArrow.addEventListener('click', () => {
            filmsSection.scrollIntoView({ behavior: 'smooth' });
        });
        scrollArrow.style.cursor = 'pointer';
    }

    // ==========================================
    // PRELOAD HOVER CLIPS (first 6 after page load)
    // ==========================================
    setTimeout(() => {
        if (!galleryData) return;
        let preloaded = 0;
        for (const [film, entry] of Object.entries(galleryData)) {
            if (preloaded >= 6) break;
            if (entry.clip) {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = entry.clip;
                document.head.appendChild(link);
                preloaded++;
            }
        }
    }, 3000);

});

// Loading screen
window.addEventListener('load', () => {
    const ls = document.getElementById('loadingScreen');
    if (ls) {
        setTimeout(() => ls.classList.add('fade-out'), 300);
        setTimeout(() => ls.remove(), 1500);
    }
});
