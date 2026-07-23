// mosala-components.js — Navbar + Footer partagés
// Injecté automatiquement dans toutes les pages Mosala

(function() {
  var NAVBAR = `<nav id="mosala-navbar" style="background:#fff;border-bottom:1px solid #e2e8f0;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;">
  <a href="/" style="font-size:1.4rem;font-weight:900;color:#00B87C;text-decoration:none;">Mosala 🦺</a>
  <div style="display:flex;gap:16px;align-items:center;">
    <a href="/pages/offres-emploi.html" style="color:#64748b;text-decoration:none;font-size:.9rem;">Offres d'emploi</a>
    <a href="/pages/blog.html" style="color:#64748b;text-decoration:none;font-size:.9rem;">Blog</a>
    <a href="/pages/login.html" style="color:#64748b;text-decoration:none;font-size:.9rem;">Connexion</a>
    <a href="/pages/register.html" style="background:#00B87C;color:#fff;padding:8px 20px;border-radius:10px;text-decoration:none;font-size:.9rem;font-weight:600;">S'inscrire</a>
  </div>
</nav>`;
  var FOOTER = `<footer id="mosala-footer" style="background:#0F172A;padding:48px 24px 32px;">
  <div style="max-width:1100px;margin:0 auto;">
    <!-- Logo + description -->
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:40px;">
      <div>
        <a href="/" style="font-size:1.4rem;font-weight:900;color:#00B87C;text-decoration:none;">Mosala 🦺</a>
        <p style="color:rgba(255,255,255,.5);font-size:.85rem;margin-top:12px;line-height:1.7;">La première plateforme freelance<br/>& emploi de la RDC 🇨🇩</p>
        <p style="color:rgba(255,255,255,.3);font-size:.8rem;margin-top:12px;">© 2026 Mosala Tech SARL<br/>Kinshasa, RDC</p>
      </div>
      <!-- Plateforme -->
      <div>
        <h4 style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:16px;">Plateforme</h4>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
          <li><a href="/pages/offres-emploi.html" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.5)'">Offres d'emploi</a></li>
          <li><a href="/#trouver-travail" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.5)'">Trouver du travail</a></li>
          <li><a href="/#poster-projet" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.5)'">Poster un projet</a></li>
          <li><a href="/pages/register.html" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.5)'">S'inscrire gratuitement</a></li>
        </ul>
      </div>
      <!-- Ressources -->
      <div>
        <h4 style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:16px;">Ressources</h4>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
          <li><a href="/pages/blog.html" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.5)'">Blog</a></li>
          <li><a href="/pages/centre-aide.html" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.5)'">Centre d'aide</a></li>
          <li><a href="/pages/a-propos.html" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.5)'">À propos</a></li>
        </ul>
      </div>
      <!-- Légal -->
      <div>
        <h4 style="color:#fff;font-weight:700;font-size:.9rem;margin-bottom:16px;">Légal</h4>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px;">
          <li><a href="/pages/conditions.html" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.5)'">Conditions d'utilisation</a></li>
          <li><a href="/pages/politique-confidentialite.html" style="color:rgba(255,255,255,.5);font-size:.85rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.5)'">Politique de confidentialité</a></li>
        </ul>
      </div>
    </div>
    <!-- Bas de footer -->
    <div style="border-top:1px solid rgba(255,255,255,.08);padding-top:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
      <span style="color:rgba(255,255,255,.3);font-size:.8rem;">🇨🇩 Made in Congo — Mosala Tech SARL 2026</span>
      <div style="display:flex;gap:16px;">
        <a href="mailto:support@mosala.io" style="color:rgba(255,255,255,.3);font-size:.8rem;text-decoration:none;" onmouseover="this.style.color='#00B87C'" onmouseout="this.style.color='rgba(255,255,255,.3)'">support@mosala.io</a>
      </div>
    </div>
  </div>
</footer>
<style>
  @media (max-width: 640px) {
    #mosala-footer > div > div:first-child > div:first-child {
      grid-template-columns: 1fr 1fr !important;
    }
  }
  @media (max-width: 480px) {
    #mosala-footer > div > div:first-child {
      grid-template-columns: 1fr !important;
    }
  }
</style>`;

  function injectNavbar() {
    // Cherche un nav existant ou injecte au début du body
    var existing = document.getElementById('mosala-navbar');
    if (existing) return; // déjà présent en statique
    var body = document.body;
    var tmp = document.createElement('div');
    tmp.innerHTML = NAVBAR;
    body.insertBefore(tmp.firstElementChild, body.firstChild);
  }

  function injectFooter() {
    var existing = document.getElementById('mosala-footer');
    if (existing) return; // déjà présent en statique
    var tmp = document.createElement('div');
    tmp.innerHTML = FOOTER;
    document.body.appendChild(tmp.firstElementChild);
    // Injecter aussi le style mobile
    var styleEl = tmp.querySelector('style');
    if (styleEl) document.head.appendChild(styleEl);
  }

  // Marquer le lien actif dans la navbar
  function markActive() {
    var path = window.location.pathname;
    var links = document.querySelectorAll('#mosala-navbar a');
    links.forEach(function(a) {
      if (a.getAttribute('href') === path || (path.endsWith(a.getAttribute('href')) && a.getAttribute('href') !== '/')) {
        a.style.color = '#00B87C';
        a.style.fontWeight = '700';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      injectNavbar();
      injectFooter();
      markActive();
    });
  } else {
    injectNavbar();
    injectFooter();
    markActive();
  }
})();
