/* ==========================================================================
   STUDIO XCELLENCE — script unico
   Indice:
   1. Iniezione header/footer (partials)
   2. Header: effetto scroll + menu mobile + link attivo
   3. Transizione tra pagine
   4. Reveal on scroll
   5. Team card: tap-to-flip su touch
   6. Tabs (usato in magazine.html)
   7. FAQ accordion
   8. Form contatti (placeholder — vedi nota in fondo al file)
   ========================================================================== */

document.documentElement.classList.add('js');

/* 1. INIEZIONE PARTIALS ---------------------------------------------------- */
async function includePartials() {
  const slots = document.querySelectorAll('[data-include]');
  await Promise.all(
    Array.from(slots).map(async (slot) => {
      const file = slot.getAttribute('data-include');
      try {
        const res = await fetch(file);
        slot.innerHTML = await res.text();
      } catch (err) {
        console.error('Impossibile caricare', file, err);
      }
    })
  );
}

/* 2. HEADER: scroll + menu mobile + link attivo ---------------------------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
    });
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => navLinks.classList.remove('is-open'))
    );
  }

  const current = document.body.getAttribute('data-page');
  if (current) {
    const active = header.querySelector(`[data-nav="${current}"]`);
    if (active) active.classList.add('active');
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* 3. TRANSIZIONE TRA PAGINE -------------------------------------------------
   Overlay verde che copre lo schermo all'uscita e si ritira all'ingresso.
   Se vuoi disattivarla, basta rimuovere data-transition-link dai link
   in partials/header.html e partials/footer.html.                        */
function initPageTransitions() {
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  overlay.innerHTML = '<span class="mark">Studio Xcellence</span>';
  document.body.appendChild(overlay);

  requestAnimationFrame(() => document.body.classList.add('is-loaded'));

  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('[data-transition-link]');
    if (!link) return;
    const url = link.getAttribute('href');
    if (!url || url.startsWith('#') || link.target === '_blank') return;

    e.preventDefault();
    overlay.classList.add('leaving');
    setTimeout(() => { window.location.href = url; }, 550);
  });
}

/* 4. REVEAL ON SCROLL -------------------------------------------------------*/
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((item) => obs.observe(item));
}

/* 5. TEAM CARD: tap-to-flip su touch ---------------------------------------*/
function initTeamCards() {
  document.querySelectorAll('.team-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (window.matchMedia('(hover: none)').matches) {
        card.classList.toggle('is-flipped');
      }
    });
  });
}

/* 6. TABS (X Magazine) -------------------------------------------------------*/
function initTabs() {
  const buttons = document.querySelectorAll('[data-tab-btn]');
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab-btn');
      buttons.forEach((b) => b.classList.toggle('active', b === btn));
      document.querySelectorAll('[data-tab-panel]').forEach((panel) => {
        panel.classList.toggle('active', panel.getAttribute('data-tab-panel') === target);
      });
    });
  });
}

/* 7. FAQ ACCORDION -----------------------------------------------------------*/
function initFaq() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    if (!q || !a) return;

    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
    });
  });
}

/* 8. FORM CONTATTI ------------------------------------------------------------
   NOTA PER IL FUTURO: questo form al momento non invia dati a nessun server,
   mostra solo un messaggio di conferma finto lato client.
   Quando sarà pronto un backend (es. Supabase, Formspree, o un endpoint
   personalizzato) basterà sostituire il contenuto della funzione
   handleSubmit qui sotto con una vera chiamata fetch().                   */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const success = document.getElementById('formSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO: sostituire con una vera fetch() verso il backend quando disponibile.
    form.reset();
    if (success) success.classList.add('is-visible');
  });
}

/* INIT ------------------------------------------------------------------- */
(async function init() {
  await includePartials();
  initHeader();
  initPageTransitions();
  initReveal();
  initTeamCards();
  initTabs();
  initFaq();
  initContactForm();
})();
