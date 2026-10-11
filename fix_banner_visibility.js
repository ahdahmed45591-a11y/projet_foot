const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The upgraded, highly visible, unmissable red banner with fixed positioning above the fixed header
const newBannerHtml = `
<style id="top-banner-style">
.top-alert-banner {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    min-height: 48px !important;
    background: #e02424 !important;
    color: #ffffff !important;
    z-index: 999999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 14px !important;
    padding: 10px 16px !important;
    font-size: 15px !important;
    font-weight: 800 !important;
    letter-spacing: 0.3px !important;
    box-shadow: 0 4px 20px rgba(224, 36, 36, 0.5) !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
}
.top-alert-banner .badge-alert {
    background: #ffffff !important;
    color: #e02424 !important;
    font-size: 11px !important;
    font-weight: 900 !important;
    padding: 3px 9px !important;
    border-radius: 20px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2) !important;
}
.top-alert-banner .banner-link {
    background: #111823 !important;
    color: #ffffff !important;
    font-size: 13px !important;
    font-weight: 800 !important;
    padding: 6px 16px !important;
    border-radius: 20px !important;
    text-decoration: none !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
    transition: transform 0.2s, background 0.2s !important;
}
.top-alert-banner .banner-link:hover {
    background: #000000 !important;
    transform: scale(1.05) !important;
    color: #ffffff !important;
}
#header.sticky-desktop {
    top: 48px !important;
}
body {
    padding-top: 48px !important;
}
@media (max-width: 768px) {
    .top-alert-banner {
        font-size: 13px !important;
        padding: 8px 12px !important;
        flex-direction: column !important;
        gap: 6px !important;
        text-align: center !important;
    }
    #header.sticky-desktop {
        top: 64px !important;
    }
    body {
        padding-top: 64px !important;
    }
}
</style>
<div class="top-alert-banner">
    <span class="badge-alert">NOUVEAU</span>
    <span>Ajout de CV + vidéo que les recruteurs pourront regarder</span>
    <a href="/joueurs" class="banner-link">Déposer mon CV & Vidéo →</a>
</div>`;

// Replace previous banner
html = html.replace(/<div class="top-alert-banner"[\s\S]*?<\/div>/i, newBannerHtml);

fs.writeFileSync('index.html', html);
console.log('Top red banner updated and made 100% visible with fixed layout!');
