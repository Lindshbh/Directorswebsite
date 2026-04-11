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
        if (!folder && !imgPath) return;

        const previewEl = link.parentElement.querySelector('.inline-preview');
        if (!previewEl) return;

        link.addEventListener('mouseenter', () => {
            // Close previous preview
            if (activePreview && activePreview !== previewEl) {
                activePreview.classList.remove('active');
                activePreview.innerHTML = '';
                if (activeVideo) {
                    activeVideo.pause();
                    activeVideo = null;
                }
            }

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
            projectTags.innerHTML = '<span class="pill pill-active">Director</span><span class="pill pill-active">' + cat.charAt(0).toUpperCase() + cat.slice(1) + '</span>';

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

                // Add images
                images.forEach(imgSrc => {
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.alt = title + ' - production still';
                    img.loading = 'lazy';
                    projectGallery.appendChild(img);
                });
            } else {
                projectGallery.innerHTML = '<p style="text-align:center;color:#4a4640;font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:80px 0;">Gallery coming soon</p>';
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

    projectClose.addEventListener('click', () => {
        projectOverlay.classList.remove('open');
        document.body.style.overflow = '';
        projectGallery.querySelectorAll('video').forEach(v => v.pause());
        projectGallery.querySelectorAll('iframe').forEach(f => f.src = '');
    });

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

    document.querySelectorAll('a[href="#about"]').forEach(link => {
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

    // ==========================================
    // SOUND TOGGLE
    // ==========================================
    const soundToggle = document.getElementById('soundToggle');
    const bgReelVideo = document.getElementById('bgReelVideo');

    if (soundToggle && bgReelVideo) {
        soundToggle.addEventListener('click', () => {
            if (bgReelVideo.muted) {
                bgReelVideo.muted = false;
                soundToggle.classList.add('active');
                soundToggle.innerHTML = '&#9836;';
            } else {
                bgReelVideo.muted = true;
                soundToggle.classList.remove('active');
                soundToggle.innerHTML = '&#9834;';
            }
        });
    }

    // ==========================================
    // MINI OVERLAYS (Writer / Actress)
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

});
