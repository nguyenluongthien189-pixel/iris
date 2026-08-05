/* ==========================================================================
   IrisMC Server Website - JavaScript Logic & Interactive Features
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Navbar Scroll State & Mobile Menu ---
    initNavbar();

    // --- 3. Copy IP to Clipboard & Toast System ---
    initCopyIP();

    // --- 4. Live Player Counter Fluctuation ---
    initLiveStats();

    // --- 5. FAQ Accordion ---
    initFAQ();

    // --- 6. Modal Windows ---
    initModals();
});

/* ==========================================
   Navbar & Mobile Menu
   ========================================== */
function initNavbar() {
    const header = document.querySelector('.header');
    const toggleBtn = document.querySelector('.btn-toggle-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Removed single-page scroll spy logic since we are multi-page now
    });

    if (toggleBtn && navMenu) {
        toggleBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = toggleBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });

        // Close menu when clicking link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                if (toggleBtn.querySelector('i')) {
                    toggleBtn.querySelector('i').className = 'fa-solid fa-bars';
                }
            });
        });
    }
}

/* ==========================================
   Copy IP & Toast Notifications
   ========================================== */
const SERVER_IP = "irismc.asia";

function initCopyIP() {
    const copyBtns = document.querySelectorAll('.js-copy-ip');

    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(SERVER_IP).then(() => {
                showToast(`Đã sao chép IP: <strong>${SERVER_IP}</strong> vào clipboard!`, 'fa-solid fa-check-circle');
            }).catch(err => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = SERVER_IP;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast(`Đã sao chép IP: <strong>${SERVER_IP}</strong>!`, 'fa-solid fa-check-circle');
            });
        });
    });
}

function showToast(message, iconClass = 'fa-solid fa-bell') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <div>${message}</div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.35s ease forwards';
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}

/* ==========================================
   Live Player Count & Server Status (Real API)
   ========================================== */
let isStatusRefreshing = false;

async function checkServerStatus() {
    if (isStatusRefreshing) return;
    isStatusRefreshing = true;

    const playerCountElems = document.querySelectorAll('.js-player-count, #player-count');
    const statusBadgeElems = document.querySelectorAll('.js-status-badge, .hero-badge-text');
    const pulseDots = document.querySelectorAll('.pulse-dot');
    const onlineStateElem = document.getElementById('server-online-state');
    const pingElem = document.getElementById('server-ping');
    const statPingElem = document.getElementById('stat-ping');
    const versionElem = document.getElementById('server-version');
    const statVersionElem = document.getElementById('stat-version');
    const motdElem = document.getElementById('server-motd');
    const lastUpdatedElem = document.getElementById('status-last-updated');
    const progressBarElem = document.getElementById('player-progress-bar');
    const refreshBtnIcon = document.querySelector('#btn-refresh-status i');

    if (refreshBtnIcon) {
        refreshBtnIcon.classList.add('fa-spin');
    }

    const startTime = performance.now();
    let data = null;
    let isOnline = false;

    // List of reliable public Minecraft Server Status APIs with fallbacks
    const apis = [
        `https://api.mcsrvstat.us/3/${SERVER_IP}`,
        `https://api.mcsrvstat.us/2/${SERVER_IP}`,
        `https://api.minetools.eu/ping/${SERVER_IP}`
    ];

    for (const url of apis) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const resJson = await response.json();
                
                // MineTools API response structure adapter
                if (url.includes('minetools.eu')) {
                    if (!resJson.error) {
                        data = {
                            online: true,
                            players: {
                                online: resJson.players?.online ?? 0,
                                max: resJson.players?.max ?? 500
                            },
                            version: { name_clean: resJson.version?.name ?? "1.20.x - 1.21.x" },
                            motd: { clean: [resJson.description ?? ""] }
                        };
                    }
                } else {
                    data = resJson;
                }

                if (data && (data.online || (data.players && data.players.max > 0))) {
                    isOnline = true;
                    break;
                }
            }
        } catch (err) {
            console.warn(`API check ${url} failed or timed out:`, err);
        }
    }

    const endTime = performance.now();
    const pingMs = Math.round(endTime - startTime);

    if (data && (data.online || isOnline)) {
        const onlinePlayers = data.players?.online ?? 0;
        const maxPlayers = data.players?.max ?? 500;
        const percent = Math.min(100, Math.round((onlinePlayers / (maxPlayers || 1)) * 100));

        // Update player count text
        playerCountElems.forEach(elem => {
            elem.textContent = `${onlinePlayers} / ${maxPlayers}`;
        });

        // Update badge text
        statusBadgeElems.forEach(elem => {
            elem.innerHTML = `Đang Hoạt Động: <span id="player-count">${onlinePlayers} / ${maxPlayers}</span> Người Chơi`;
        });

        // Update pulse dots to online (green)
        pulseDots.forEach(dot => {
            dot.style.backgroundColor = '#4ade80';
            dot.style.boxShadow = '0 0 10px rgba(74, 222, 128, 0.6)';
        });

        if (onlineStateElem) {
            onlineStateElem.textContent = "Đang trực tuyến";
            onlineStateElem.className = "detail-value text-online";
        }

        // Update detailed elements if present
        if (pingElem) pingElem.textContent = `${pingMs} ms`;
        if (statPingElem) statPingElem.textContent = `${pingMs} ms`;

        const verString = data.version?.name_clean || data.version?.name || "1.20.x - 1.21.x";
        if (versionElem) versionElem.textContent = verString;
        if (statVersionElem) statVersionElem.textContent = verString;

        if (motdElem) {
            if (data.motd?.clean && data.motd.clean.length > 0) {
                const motdText = Array.isArray(data.motd.clean) ? data.motd.clean.join(' ').trim() : data.motd.clean;
                motdElem.textContent = motdText || "Chào mừng bạn đến với máy chủ IrisMC!";
            } else {
                motdElem.textContent = "Máy chủ IrisMC - Thế giới sinh tồn Survival SMP hấp dẫn!";
            }
        }

        if (progressBarElem) {
            progressBarElem.style.width = `${percent}%`;
        }

    } else {
        // Server offline or unreachable
        playerCountElems.forEach(elem => {
            elem.textContent = 'Ngoại tuyến';
        });

        statusBadgeElems.forEach(elem => {
            elem.innerHTML = `Trạng thái: <span style="color: #ef4444; font-weight: 700;">Ngoại tuyến (Offline)</span>`;
        });

        pulseDots.forEach(dot => {
            dot.style.backgroundColor = '#ef4444';
            dot.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.6)';
        });

        if (onlineStateElem) {
            onlineStateElem.textContent = "Không thể kết nối";
            onlineStateElem.className = "detail-value text-offline";
        }

        if (pingElem) pingElem.textContent = 'Timeout';
        if (motdElem) motdElem.textContent = 'Hiện tại không thể truy vấn thông tin máy chủ. Vui lòng kiểm tra lại sau!';
        if (progressBarElem) progressBarElem.style.width = '0%';
    }

    if (lastUpdatedElem) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        lastUpdatedElem.textContent = `Cập nhật: ${timeStr}`;
    }

    if (refreshBtnIcon) {
        setTimeout(() => refreshBtnIcon.classList.remove('fa-spin'), 600);
    }

    isStatusRefreshing = false;
}

function initLiveStats() {
    checkServerStatus();

    // Auto-refresh every 30 seconds
    setInterval(checkServerStatus, 30000);

    // Manual refresh button
    const refreshBtn = document.getElementById('btn-refresh-status');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            checkServerStatus();
        });
    }
}


/* ==========================================
   FAQ Accordion
   ========================================== */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* ==========================================
   Modals (Join & Store)
   ========================================== */
function initModals() {
    const modalButtons = document.querySelectorAll('[data-modal]');
    const closeButtons = document.querySelectorAll('.modal-close, .js-modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');

    modalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-modal');
            const targetModal = document.getElementById(targetId);
            if (targetModal) {
                targetModal.classList.add('active');
            }
        });
    });

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) modal.classList.remove('active');
        });
    });

    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
}
