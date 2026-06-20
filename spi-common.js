/* ============================================
   SPI SYSTEM — Script condiviso
   Gestisce: cookie banner professionale, multilingua live
   ============================================ */

const SPI_COOKIE_TEXTS = {
  it: {
    title: "La tua privacy conta",
    text: "Utilizziamo solo cookie tecnici necessari al funzionamento del sito (es. lingua selezionata). Non utilizziamo cookie di tracciamento o pubblicitari.",
    accept: "Accetta",
    decline: "Rifiuta",
    customize: "Personalizza",
    settingsTitle: "Preferenze cookie",
    necessary: "Cookie tecnici (necessari)",
    necessaryDesc: "Indispensabili per il funzionamento del sito: lingua selezionata e preferenze di navigazione. Non possono essere disattivati.",
    analytics: "Cookie statistici",
    analyticsDesc: "Ci aiuterebbero a capire come viene usato il sito in forma anonima. Attualmente non sono utilizzati.",
    save: "Salva preferenze",
    privacyLink: "Leggi la Privacy Policy"
  },
  en: {
    title: "Your privacy matters",
    text: "We only use technical cookies necessary for the site to function (e.g. selected language). We do not use tracking or advertising cookies.",
    accept: "Accept",
    decline: "Decline",
    customize: "Customize",
    settingsTitle: "Cookie preferences",
    necessary: "Technical cookies (necessary)",
    necessaryDesc: "Essential for the site to work: selected language and navigation preferences. Cannot be disabled.",
    analytics: "Statistical cookies",
    analyticsDesc: "Would help us understand site usage anonymously. Currently not used.",
    save: "Save preferences",
    privacyLink: "Read Privacy Policy"
  },
  es: {
    title: "Tu privacidad importa",
    text: "Solo usamos cookies técnicas necesarias para el funcionamiento del sitio (idioma seleccionado). No usamos cookies de rastreo o publicidad.",
    accept: "Aceptar",
    decline: "Rechazar",
    customize: "Personalizar",
    settingsTitle: "Preferencias de cookies",
    necessary: "Cookies técnicas (necesarias)",
    necessaryDesc: "Esenciales para el funcionamiento del sitio: idioma seleccionado y preferencias de navegación. No se pueden desactivar.",
    analytics: "Cookies estadísticas",
    analyticsDesc: "Nos ayudarían a entender el uso del sitio de forma anónima. Actualmente no se usan.",
    save: "Guardar preferencias",
    privacyLink: "Leer Política de Privacidad"
  },
  fr: {
    title: "Votre vie privée compte",
    text: "Nous utilisons uniquement des cookies techniques nécessaires au fonctionnement du site (langue sélectionnée). Aucun cookie de suivi ou publicitaire.",
    accept: "Accepter",
    decline: "Refuser",
    customize: "Personnaliser",
    settingsTitle: "Préférences cookies",
    necessary: "Cookies techniques (nécessaires)",
    necessaryDesc: "Indispensables au fonctionnement du site : langue sélectionnée et préférences de navigation. Ne peuvent pas être désactivés.",
    analytics: "Cookies statistiques",
    analyticsDesc: "Nous aideraient à comprendre l'utilisation du site de façon anonyme. Non utilisés actuellement.",
    save: "Enregistrer",
    privacyLink: "Lire la Politique de Confidentialité"
  },
  de: {
    title: "Ihre Privatsphäre ist wichtig",
    text: "Wir verwenden nur technische Cookies, die für die Funktion der Website notwendig sind (ausgewählte Sprache). Keine Tracking- oder Werbe-Cookies.",
    accept: "Akzeptieren",
    decline: "Ablehnen",
    customize: "Anpassen",
    settingsTitle: "Cookie-Einstellungen",
    necessary: "Technische Cookies (notwendig)",
    necessaryDesc: "Unerlässlich für die Funktion der Website: ausgewählte Sprache und Navigationspräferenzen. Können nicht deaktiviert werden.",
    analytics: "Statistik-Cookies",
    analyticsDesc: "Würden uns helfen, die Nutzung anonym zu verstehen. Derzeit nicht verwendet.",
    save: "Einstellungen speichern",
    privacyLink: "Datenschutzerklärung lesen"
  }
};

/* Icona cookie elegante (SVG outline dorato, coerente con lo stile del sito) */
const SPI_COOKIE_ICON_SVG = `
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 12.5c-1.1 0-2-.9-2-2 0-.3 0-.6.1-.9-1.4.2-2.6-.8-2.6-2.2 0-.3 0-.5.1-.8-.4.1-.8.2-1.2.2-1.5 0-2.7-1.2-2.7-2.7 0-.1 0-.2 0-.3C12 3.3 12 3 12 3 7 3 3 7 3 12s4 9 9 9 9-4 9-9c0-.2 0-.3 0-.5z"/>
  <circle cx="8.5" cy="11.5" r="1" fill="currentColor" stroke="none"/>
  <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none"/>
  <circle cx="15.5" cy="10.5" r="1" fill="currentColor" stroke="none"/>
  <circle cx="10" cy="8.5" r=".8" fill="currentColor" stroke="none"/>
</svg>`;

function spiGetLang() {
  return localStorage.getItem('selectedLanguage') || 'it';
}

function spiCurrentCookieTexts() {
  return SPI_COOKIE_TEXTS[spiGetLang()] || SPI_COOKIE_TEXTS.it;
}

/* Aggiorna i testi del banner se già presente nel DOM (richiamato al cambio lingua) */
function spiRefreshCookieBannerTexts() {
  const banner = document.getElementById('spiCookieBanner');
  if (!banner) return;
  const t = spiCurrentCookieTexts();
  banner.querySelector('.spi-cookie-body h3').textContent = t.title;
  const p = banner.querySelector('.spi-cookie-body p');
  p.innerHTML = `${t.text} <a href="privacy.html" target="_blank">${t.privacyLink}</a>`;
  banner.querySelector('#spiCookieDecline').textContent = t.decline;
  banner.querySelector('#spiCookieCustomize').textContent = t.customize;
  banner.querySelector('#spiCookieAccept').textContent = t.accept;
}

function initCookieBanner() {
  const consent = localStorage.getItem('spi-cookie-consent');
  if (consent) return; // scelta già fatta in passato

  const t = spiCurrentCookieTexts();

  const banner = document.createElement('div');
  banner.id = 'spiCookieBanner';
  banner.className = 'spi-cookie-banner';
  banner.innerHTML = `
    <div class="spi-cookie-card">
      <div class="spi-cookie-icon">${SPI_COOKIE_ICON_SVG}</div>
      <div class="spi-cookie-body">
        <h3>${t.title}</h3>
        <p>${t.text} <a href="privacy.html" target="_blank">${t.privacyLink}</a></p>
      </div>
      <div class="spi-cookie-actions">
        <button class="spi-cookie-btn ghost" id="spiCookieDecline">${t.decline}</button>
        <button class="spi-cookie-btn outline" id="spiCookieCustomize">${t.customize}</button>
        <button class="spi-cookie-btn solid" id="spiCookieAccept">${t.accept}</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('show'));

  document.getElementById('spiCookieAccept').addEventListener('click', () => {
    localStorage.setItem('spi-cookie-consent', JSON.stringify({ necessary: true, analytics: true, date: Date.now() }));
    closeBanner();
  });
  document.getElementById('spiCookieDecline').addEventListener('click', () => {
    localStorage.setItem('spi-cookie-consent', JSON.stringify({ necessary: true, analytics: false, date: Date.now() }));
    closeBanner();
  });
  document.getElementById('spiCookieCustomize').addEventListener('click', () => {
    openSettingsModal(spiCurrentCookieTexts());
  });

  function closeBanner() {
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 350);
  }
}

function openSettingsModal(t) {
  t = t || spiCurrentCookieTexts();
  const existing = document.getElementById('spiCookieSettings');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'spiCookieSettings';
  modal.className = 'spi-cookie-modal';
  modal.innerHTML = `
    <div class="spi-cookie-modal-card">
      <h3>${t.settingsTitle}</h3>
      <div class="spi-cookie-row">
        <div>
          <strong>${t.necessary}</strong>
          <p>${t.necessaryDesc}</p>
        </div>
        <label class="spi-switch disabled">
          <input type="checkbox" checked disabled>
          <span class="spi-slider"></span>
        </label>
      </div>
      <div class="spi-cookie-row">
        <div>
          <strong>${t.analytics}</strong>
          <p>${t.analyticsDesc}</p>
        </div>
        <label class="spi-switch">
          <input type="checkbox" id="spiAnalyticsToggle">
          <span class="spi-slider"></span>
        </label>
      </div>
      <button class="spi-cookie-btn solid full" id="spiCookieSaveSettings">${t.save}</button>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('show'));

  document.getElementById('spiCookieSaveSettings').addEventListener('click', () => {
    const analytics = document.getElementById('spiAnalyticsToggle').checked;
    localStorage.setItem('spi-cookie-consent', JSON.stringify({ necessary: true, analytics, date: Date.now() }));
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
    const banner = document.getElementById('spiCookieBanner');
    if (banner) { banner.classList.remove('show'); setTimeout(() => banner.remove(), 300); }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCookieBanner();
});
