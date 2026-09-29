/* ==========================================================================
   STUDIO XCELLENCE — Area Riservata (prototipo visivo)
   Dati finti, salvati in localStorage sul browser di chi naviga: nessun
   account reale, nessun server. Serve a validare schermate e logica prima
   di costruire un backend vero (vedi README).
   Indice:
   1. Dati di partenza e stato condiviso (localStorage)
   2. Utility date + mini calendario riusabile
   3. Motore Xscore
   4. Area Riservata (ingresso unificato)
   5. Area Professionista
   6. Area Studio
   7. Area Team (interna)
   ========================================================================== */

var XR_STATE_KEY = 'xr_area_riservata_v1';
var XR_MY_PRO_ID = 0; // "tu" quando sei loggato come professionista, nel prototipo
var XR_STUDIO_NAME = 'Studio Dentistico Prova';

var XR_MEDICI = ["Odontoiatria generale","Conservativa & Endodonzia","Protesi dentaria","Implantologia","Chirurgia orale","Parodontologia","Ortodonzia","Odontoiatria pediatrica","Odontoiatria estetica","Gnatologia","Radiologia odontoiatrica","Odontoiatria digitale","Medicina estetica del volto"];
var XR_ASO = ["Generalista","Chirurgia orale","Implantologia","Ortodonzia","Pedodontica","Protesica","Endodonzia & Conservativa","Parodontologia","Digitale","Sterilizzazione"];
var XR_TIPI = ["Fisso","Part-time","Sostituzione temporanea","Pronto intervento (urgenze)"];
var XR_GIORNI = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
var XR_FASCE = ["Mattina\n8–12","Pomeriggio\n14–18","Sera\n18–21"];

/* 1. DATI DI PARTENZA E STATO CONDIVISO ------------------------------------ */
function xrDefaultState() {
  return {
    candidates: [
      { id:0, nome:"Dott. Marco Bellini", ruolo:"Medico", zona:"Milano centro", spec:["Chirurgia orale","Implantologia"], esp:12, km:8, tipi:["Fisso","Pronto intervento (urgenze)"], tariffa:450, rating:4.8, badge:true, cert:false, docs:{} },
      { id:1, nome:"Dott.ssa Giulia Renna", ruolo:"Medico", zona:"Monza", spec:["Ortodonzia"], esp:6, km:22, tipi:["Part-time"], tariffa:380, rating:4.5, badge:false, cert:true, docs:{} },
      { id:2, nome:"Dott. Luca Ferretti", ruolo:"Medico", zona:"Bergamo", spec:["Odontoiatria generale","Protesi dentaria"], esp:15, km:35, tipi:["Fisso"], tariffa:500, rating:4.9, badge:true, cert:true, docs:{} },
      { id:3, nome:"Dott.ssa Chiara Moretti", ruolo:"Medico", zona:"Milano Navigli", spec:["Odontoiatria estetica","Medicina estetica del volto"], esp:9, km:14, tipi:["Part-time","Sostituzione temporanea"], tariffa:420, rating:4.6, badge:true, cert:true, docs:{} },
      { id:4, nome:"ASO Sara Colombo", ruolo:"ASO", zona:"Milano centro", spec:["Chirurgia orale","Sterilizzazione"], esp:10, km:5, tipi:["Fisso","Pronto intervento (urgenze)"], tariffa:140, rating:4.9, badge:true, cert:true, docs:{} },
      { id:5, nome:"ASO Elena Ricci", ruolo:"ASO", zona:"Sesto San Giovanni", spec:["Generalista","Digitale"], esp:3, km:18, tipi:["Part-time"], tariffa:100, rating:4.2, badge:false, cert:false, docs:{} },
      { id:6, nome:"ASO Martina Greco", ruolo:"ASO", zona:"Bergamo", spec:["Ortodonzia","Protesica"], esp:7, km:40, tipi:["Sostituzione temporanea","Pronto intervento (urgenze)"], tariffa:130, rating:4.7, badge:true, cert:true, docs:{} },
      { id:7, nome:"ASO Valeria Testa", ruolo:"ASO", zona:"Milano Città Studi", spec:["Parodontologia","Endodonzia & Conservativa"], esp:5, km:11, tipi:["Fisso"], tariffa:120, rating:4.4, badge:false, cert:true, docs:{} }
    ],
    requests: [],
    reqSeq: 1,
    avail: { "Lun-0": true, "Mar-0": true, "Mer-1": true, "Ven-2": true }
  };
}
function xrLoad() {
  try {
    var raw = localStorage.getItem(XR_STATE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.candidates && parsed.candidates.length) return parsed;
    }
  } catch (e) {}
  return xrDefaultState();
}
function xrSave(state) { try { localStorage.setItem(XR_STATE_KEY, JSON.stringify(state)); } catch (e) {} }
function xrReset() { try { localStorage.removeItem(XR_STATE_KEY); } catch (e) {} location.reload(); }

/* 2. UTILITY DATE + MINI CALENDARIO ---------------------------------------- */
function xrPad2(n) { return n < 10 ? '0' + n : '' + n; }
function xrIso(y, m, d) { return y + '-' + xrPad2(m + 1) + '-' + xrPad2(d); }
function xrToday() { var t = new Date(); return xrIso(t.getFullYear(), t.getMonth(), t.getDate()); }
function xrFmtDate(iso) { if (!iso) return ''; var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }

function xrInitDatePicker(root, opts) {
  opts = opts || {};
  var input = root.querySelector('.dpick-input');
  var pop = root.querySelector('.dpick-pop');
  var monthEl = root.querySelector('.dpick-month');
  var gridEl = root.querySelector('.dpick-grid');
  var dowEl = root.querySelector('.dpick-dow');
  var view = new Date();
  var selectedIso = '';
  if (!dowEl.children.length) {
    ['LUN','MAR','MER','GIO','VEN','SAB','DOM'].forEach(function (d) { var s = document.createElement('span'); s.textContent = d; dowEl.appendChild(s); });
  }
  function renderDays() {
    monthEl.textContent = view.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    gridEl.innerHTML = '';
    var y = view.getFullYear(), m = view.getMonth();
    var first = new Date(y, m, 1), startPad = (first.getDay() + 6) % 7;
    var days = new Date(y, m + 1, 0).getDate();
    var min = opts.minToday ? xrToday() : null;
    for (var i = 0; i < startPad; i++) { var p = document.createElement('button'); p.type = 'button'; p.className = 'pad'; p.disabled = true; gridEl.appendChild(p); }
    for (var d = 1; d <= days; d++) {
      var iso = xrIso(y, m, d);
      var b = document.createElement('button'); b.type = 'button'; b.textContent = d;
      if (min && iso < min) { b.disabled = true; }
      else {
        b.addEventListener('click', function (isoVal) {
          return function () {
            selectedIso = isoVal;
            input.value = xrFmtDate(isoVal);
            pop.hidden = true;
            if (opts.onSelect) opts.onSelect(isoVal);
          };
        }(iso));
      }
      if (iso === xrToday()) b.classList.add('today');
      if (iso === selectedIso) b.classList.add('selected');
      gridEl.appendChild(b);
    }
  }
  root.querySelector('.dpick-prev').addEventListener('click', function (e) { e.stopPropagation(); view.setMonth(view.getMonth() - 1); renderDays(); });
  root.querySelector('.dpick-next').addEventListener('click', function (e) { e.stopPropagation(); view.setMonth(view.getMonth() + 1); renderDays(); });
  input.addEventListener('click', function (e) {
    e.stopPropagation();
    document.querySelectorAll('.dpick-pop').forEach(function (p) { if (p !== pop) p.hidden = true; });
    pop.hidden = !pop.hidden;
    if (!pop.hidden) renderDays();
  });
  document.addEventListener('click', function (e) { if (!root.contains(e.target)) pop.hidden = true; });
  return {
    getValue: function () { return selectedIso; },
    reset: function () { selectedIso = ''; input.value = ''; }
  };
}

/* 3. MOTORE XSCORE ---------------------------------------------------------
   4 criteri pesati (100 punti), come descritto nel business plan (cap. 5):
   Tecnico-clinico (specializzazione + esperienza), Temporale (tipologia di
   disponibilità), Logistico (distanza), Economico (tariffa vs budget).   */
function xrScoreCandidate(c, req) {
  var specMatch = c.spec.indexOf(req.spec) !== -1;
  var specScore = specMatch ? 25 : (c.spec.length ? 8 : 0);
  var expRatio = req.esp > 0 ? Math.min(1, c.esp / req.esp) : 1;
  var expScore = Math.round(15 * expRatio);
  var tempoMatch = c.tipi.indexOf(req.tipo) !== -1;
  var tempo = tempoMatch ? 25 : (c.tipi.length ? 10 : 0);
  var log;
  if (c.km <= req.km) log = 20;
  else log = Math.max(0, Math.round(20 * (1 - (c.km - req.km) / Math.max(1, req.km))));
  var eco;
  if (c.tariffa <= req.budget) eco = 15;
  else { var over = (c.tariffa - req.budget) / req.budget; eco = Math.max(0, Math.round(15 * (1 - over / 0.3))); }
  var total = specScore + expScore + tempo + log + eco;
  return { total: total, specMatch: specMatch, expRatio: expRatio, tempoMatch: tempoMatch, logFull: c.km <= req.km, ecoFull: c.tariffa <= req.budget };
}
function xrExplain(c, s) {
  var bits = [];
  if (s.specMatch && s.expRatio >= 1) bits.push('possiede la competenza richiesta con esperienza adeguata');
  else if (s.specMatch) bits.push('possiede la competenza richiesta ma con meno anni di esperienza del richiesto');
  else bits.push('non ha la specializzazione esatta richiesta, ma opera nello stesso ambito');
  bits.push(s.tempoMatch ? 'copre la tipologia di disponibilità cercata' : 'ha una disponibilità diversa da quella richiesta');
  bits.push(s.logFull ? ('rientra nella distanza accettata (' + c.km + ' km)') : ('dista più del previsto (' + c.km + ' km)'));
  bits.push(s.ecoFull ? 'accetta il budget indicato' : ('richiede una tariffa superiore al budget (€' + c.tariffa + '/giorno)'));
  return bits[0].charAt(0).toUpperCase() + bits[0].slice(1) + ', ' + bits[1] + ', ' + bits[2] + ' e ' + bits[3] + '.';
}
function xrTier(total) { return total >= 85 ? 'good' : (total >= 65 ? 'mid' : 'low'); }

function xrStatoLabel(r) {
  switch (r.stato) {
    case 'inviata': return { txt: 'In lavorazione dal team Xcellence', pill: 'pill-mid' };
    case 'non_disponibile': return { txt: 'Il professionista non è disponibile per il ' + xrFmtDate(r.dataRichiesta), pill: 'pill-low' };
    case 'controproposta': return { txt: 'Il professionista propone il ' + xrFmtDate(r.dataProposta), pill: 'pill-mid' };
    case 'controproposta_rifiutata': return { txt: 'Data alternativa rifiutata — richiesta chiusa', pill: 'pill-low' };
    case 'controproposta_accettata': return { txt: 'Data ' + xrFmtDate(r.dataProposta) + ' accettata dallo studio — in attesa di conferma finale del team', pill: 'pill-mid' };
    case 'confermata': return { txt: '✓ Confermato per il ' + xrFmtDate(r.dataRichiesta), pill: 'pill-good' };
    case 'chiusa': return { txt: 'Richiesta chiusa', pill: 'pill-low' };
    default: return { txt: r.stato, pill: '' };
  }
}

/* 4. AREA RISERVATA (ingresso unificato) ----------------------------------- */
function xrInitEntry() {
  var entryEl = document.getElementById('ar-entry');
  if (!entryEl) return;
  var screens = ['entry', 'login', 'role'];
  function show(id) { screens.forEach(function (s) { document.getElementById('ar-' + s).hidden = (s !== id); }); window.scrollTo(0, 0); }
  document.getElementById('btnGoLogin').addEventListener('click', function () { show('login'); });
  document.getElementById('btnLogin').addEventListener('click', function () { show('role'); });
  document.querySelectorAll('.role-pick').forEach(function (card) {
    card.addEventListener('click', function () {
      window.location.href = card.getAttribute('data-role') === 'pro' ? 'area-professionista.html' : 'area-studio.html';
    });
  });
}

/* 5. AREA PROFESSIONISTA ---------------------------------------------------- */
function xrInitProfessionista() {
  var root = document.getElementById('certPill');
  if (!root) return;
  var state = xrLoad();
  var me = state.candidates[XR_MY_PRO_ID];

  /* vista di default = solo richieste + disponibilità; il profilo (dati di
     registrazione) si apre solo su richiesta, da "Il mio profilo" */
  document.getElementById('linkMyProfile').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('pro-home').hidden = true;
    document.getElementById('pro-profile').hidden = false;
    window.scrollTo(0, 0);
  });
  document.getElementById('linkBackHome').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('pro-profile').hidden = true;
    document.getElementById('pro-home').hidden = false;
    window.scrollTo(0, 0);
  });

  var specSelected = {}; me.spec.forEach(function (s) { specSelected[s] = true; });
  var tipiSelected = {}; me.tipi.forEach(function (s) { tipiSelected[s] = true; });

  function renderChips(container, options, selectedMap, onToggle) {
    container.innerHTML = '';
    options.forEach(function (opt) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip' + (selectedMap[opt] ? ' active' : '');
      b.textContent = opt;
      b.addEventListener('click', function () { selectedMap[opt] = !selectedMap[opt]; onToggle(); });
      container.appendChild(b);
    });
  }
  function renderSpecs() {
    var ruolo = document.getElementById('pro-ruolo').value;
    document.getElementById('pro-spec-label').textContent = 'Specializzazioni (' + ruolo + ')';
    renderChips(document.getElementById('pro-spec-chips'), ruolo === 'Medico' ? XR_MEDICI : XR_ASO, specSelected, renderSpecs);
  }
  function renderTipi() { renderChips(document.getElementById('pro-tipo-chips'), XR_TIPI, tipiSelected, renderTipi); }

  document.getElementById('pro-ruolo').value = me.ruolo;
  document.getElementById('pro-esp').value = me.esp;
  document.getElementById('pro-zona').value = me.zona || '';
  document.getElementById('pro-km').value = me.km;
  document.getElementById('pro-tariffa').value = me.tariffa;
  document.getElementById('pro-ruolo').addEventListener('change', function () { specSelected = {}; renderSpecs(); });
  renderSpecs(); renderTipi();

  function renderCertPill() {
    var pill = document.getElementById('certPill');
    if (me.cert) { pill.className = 'pill pill-good'; pill.textContent = '✓ Certificato da Xcellence'; }
    else { pill.className = 'pill pill-mid'; pill.textContent = 'In attesa di certificazione'; }
  }
  renderCertPill();

  document.getElementById('btnSaveProfile').addEventListener('click', function () {
    me.ruolo = document.getElementById('pro-ruolo').value;
    me.spec = Object.keys(specSelected).filter(function (k) { return specSelected[k]; });
    me.esp = parseFloat(document.getElementById('pro-esp').value) || 0;
    me.zona = document.getElementById('pro-zona').value;
    me.km = parseFloat(document.getElementById('pro-km').value) || 0;
    me.tariffa = parseFloat(document.getElementById('pro-tariffa').value) || 0;
    me.tipi = Object.keys(tipiSelected).filter(function (k) { return tipiSelected[k]; });
    xrSave(state);
    var t = document.getElementById('toastProfile');
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2200);
  });

  /* documenti (upload finto, solo nome file) */
  document.querySelectorAll('.upload-row .upload-status').forEach(function (label) {
    var slot = label.getAttribute('data-slot');
    var input = label.querySelector('input[type=file]');
    var txt = label.querySelector('.txt');
    if (me.docs && me.docs[slot]) { label.classList.remove('empty'); txt.textContent = '✓ ' + me.docs[slot]; }
    input.addEventListener('change', function () {
      if (input.files && input.files[0]) {
        label.classList.remove('empty');
        txt.textContent = '✓ ' + input.files[0].name;
        me.docs = me.docs || {};
        me.docs[slot] = input.files[0].name;
        xrSave(state);
      }
    });
  });

  /* disponibilità: griglia giorni x fasce */
  function renderAvail() {
    var table = document.getElementById('availTable');
    table.innerHTML = '';
    table.appendChild(document.createElement('div'));
    XR_FASCE.forEach(function (f) { var h = document.createElement('div'); h.className = 'avail-head'; h.textContent = f; table.appendChild(h); });
    XR_GIORNI.forEach(function (g) {
      var lbl = document.createElement('div'); lbl.className = 'avail-day-label'; lbl.textContent = g;
      table.appendChild(lbl);
      XR_FASCE.forEach(function (f, fi) {
        var key = g + '-' + fi;
        var cell = document.createElement('button'); cell.type = 'button';
        cell.className = 'avail-cell' + (state.avail[key] ? ' on' : '');
        cell.textContent = state.avail[key] ? '✓' : '';
        cell.addEventListener('click', function () { state.avail[key] = !state.avail[key]; xrSave(state); renderAvail(); });
        table.appendChild(cell);
      });
    });
  }
  renderAvail();

  /* le tue richieste (sola lettura: le gestisce il team via telefono) */
  function renderRequests() {
    var el = document.getElementById('proRequests');
    var mine = state.requests.filter(function (r) { return r.candId === XR_MY_PRO_ID; });
    if (!mine.length) { el.innerHTML = '<p class="empty-note">Nessuna richiesta al momento.</p>'; return; }
    el.innerHTML = '';
    mine.slice().reverse().forEach(function (r) {
      var st = xrStatoLabel(r);
      var card = document.createElement('div'); card.className = 'req-card';
      card.innerHTML = '<div class="req-top"><h3>' + r.studioNome + '</h3><span class="pill ' + st.pill + '">' + st.txt + '</span></div>' +
        '<div class="req-meta">Data richiesta: ' + xrFmtDate(r.dataRichiesta) + '</div>';
      el.appendChild(card);
    });
  }
  renderRequests();
}

/* 6. AREA STUDIO -------------------------------------------------------------- */
function xrInitStudio() {
  var findBtn = document.getElementById('btnFind');
  if (!findBtn) return;
  var state = xrLoad();

  function fillSelect(sel, options) { sel.innerHTML = options.map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join(''); }
  function renderReqSpecs() {
    var ruolo = document.getElementById('req-ruolo').value;
    document.getElementById('req-spec-label').textContent = 'Specializzazione richiesta (' + ruolo + ')';
    fillSelect(document.getElementById('req-spec'), ruolo === 'Medico' ? XR_MEDICI : XR_ASO);
  }
  document.getElementById('req-ruolo').addEventListener('change', renderReqSpecs);
  renderReqSpecs();
  fillSelect(document.getElementById('req-tipo'), XR_TIPI);
  document.getElementById('req-tipo').value = 'Pronto intervento (urgenze)';

  var pendingCand = null;
  var modalDatePicker = xrInitDatePicker(document.getElementById('modalDatePick'), { minToday: true });
  function openContactModal(c) {
    pendingCand = c;
    document.getElementById('modalCandName').textContent = c.nome;
    modalDatePicker.reset();
    document.getElementById('modalContact').hidden = false;
  }
  document.getElementById('modalCancel').addEventListener('click', function () { document.getElementById('modalContact').hidden = true; });
  document.getElementById('modalSend').addEventListener('click', function () {
    var dateVal = modalDatePicker.getValue();
    if (!dateVal) { document.querySelector('#modalDatePick .dpick-input').focus(); return; }
    state.requests.push({ id: state.reqSeq++, candId: pendingCand.id, studioNome: XR_STUDIO_NAME, dataRichiesta: dateVal, dataProposta: null, stato: 'inviata' });
    xrSave(state);
    document.getElementById('modalContact').hidden = true;
    renderStudioRequests();
    document.getElementById('resHead').scrollIntoView({ behavior: 'smooth' });
  });

  findBtn.addEventListener('click', function () {
    var req = {
      ruolo: document.getElementById('req-ruolo').value,
      spec: document.getElementById('req-spec').value,
      esp: parseFloat(document.getElementById('req-esp').value) || 0,
      tipo: document.getElementById('req-tipo').value,
      km: parseFloat(document.getElementById('req-km').value) || 0,
      budget: parseFloat(document.getElementById('req-budget').value) || 0
    };
    var pool = state.candidates.filter(function (c) { return c.ruolo === req.ruolo && c.cert; });
    var scored = pool.map(function (c) { return { c: c, s: xrScoreCandidate(c, req) }; });
    scored.sort(function (a, b) { return b.s.total - a.s.total; });

    var resultsEl = document.getElementById('results');
    resultsEl.innerHTML = '';
    document.getElementById('resHead').hidden = false;
    document.getElementById('resCount').textContent = scored.length + ' professionisti certificati trovati per "' + req.ruolo + '"';

    if (!scored.length) { resultsEl.innerHTML = '<p class="empty-note">Nessun professionista certificato di questo ruolo, al momento.</p>'; return; }

    scored.forEach(function (item) {
      var c = item.c, s = item.s, tier = xrTier(s.total);
      var el = document.createElement('article');
      el.className = 'cand-card tier-' + tier;
      el.innerHTML =
        '<div class="cand-score"><b>' + s.total + '%</b><small>Xscore</small></div>' +
        '<div style="flex:1;">' +
          '<div class="cand-top"><h3>' + c.nome + '</h3><span class="stars">★ ' + c.rating.toFixed(1) + '</span></div>' +
          '<div class="cand-meta"><span>' + c.ruolo + '</span><span>' + c.spec.join(', ') + '</span><span>' + c.esp + ' anni esp.</span><span>' + c.km + ' km</span><span>€' + c.tariffa + '/giorno</span><span>' + c.tipi.join(' · ') + '</span></div>' +
          '<p class="cand-expl">' + xrExplain(c, s) + '</p>' +
          '<div class="cand-foot">' + (c.badge ? '<span class="badge-academy">Badge Academy</span>' : '<span></span>') + '<button class="btn btn-outline btn-contact" type="button">Contatta</button></div>' +
        '</div>';
      el.querySelector('.btn-contact').addEventListener('click', function () { openContactModal(c); });
      resultsEl.appendChild(el);
    });
  });

  function renderStudioRequests() {
    var el = document.getElementById('studioRequests');
    var mine = state.requests.filter(function (r) { return r.studioNome === XR_STUDIO_NAME; });
    if (!mine.length) { el.innerHTML = '<p class="empty-note">Nessuna richiesta inviata finora — usa "Contatta" su un profilo nei risultati.</p>'; return; }
    el.innerHTML = '';
    mine.slice().reverse().forEach(function (r) {
      var c = state.candidates[r.candId];
      var st = xrStatoLabel(r);
      var card = document.createElement('div'); card.className = 'req-card';
      var actionsHtml = '';
      if (r.stato === 'controproposta') {
        actionsHtml = '<div class="req-actions"><button class="btn btn-primary btn-sm act-accept">Accetta il ' + xrFmtDate(r.dataProposta) + '</button><button class="btn btn-outline btn-sm act-reject">Rifiuta</button></div>';
      }
      card.innerHTML = '<div class="req-top"><h3>' + c.nome + '</h3><span class="pill ' + st.pill + '">' + st.txt + '</span></div>' +
        '<div class="req-meta">Richiesto per il ' + xrFmtDate(r.dataRichiesta) + ' · ' + c.ruolo + '</div>' + actionsHtml;
      if (r.stato === 'controproposta') {
        card.querySelector('.act-accept').addEventListener('click', function () { r.stato = 'controproposta_accettata'; xrSave(state); renderStudioRequests(); });
        card.querySelector('.act-reject').addEventListener('click', function () { r.stato = 'controproposta_rifiutata'; xrSave(state); renderStudioRequests(); });
      }
      el.appendChild(card);
    });
  }
  renderStudioRequests();
}

/* 7. AREA TEAM (interna) ------------------------------------------------------ */
function xrInitTeam() {
  var loginBtn = document.getElementById('btnTeamLogin');
  if (!loginBtn) return;
  var state = xrLoad();

  loginBtn.addEventListener('click', function () {
    document.getElementById('ar-teamLogin').hidden = true;
    document.getElementById('ar-teamDash').hidden = false;
    renderCertList();
    renderTeamRequests();
    window.scrollTo(0, 0);
  });

  document.getElementById('btnResetDemo').addEventListener('click', function () {
    if (confirm('Azzerare tutti i dati finti (certificazioni, richieste, disponibilità) e ripartire da capo?')) xrReset();
  });

  function renderCertList() {
    var el = document.getElementById('certList');
    var pending = state.candidates.filter(function (c) { return !c.cert; });
    if (!pending.length) { el.innerHTML = '<p class="empty-note">Nessun professionista in attesa — tutti certificati.</p>'; return; }
    el.innerHTML = '';
    pending.forEach(function (c) {
      var row = document.createElement('div'); row.className = 'cert-row';
      row.innerHTML = '<div class="cert-info"><h3>' + c.nome + '</h3><span>' + c.ruolo + ' · ' + c.spec.join(', ') + ' · ' + c.esp + ' anni esp. · Documenti: CV ✓ · Albo ✓ · Assicurazione ✓</span></div><button class="btn btn-primary btn-sm act-cert">Certifica</button>';
      row.querySelector('.act-cert').addEventListener('click', function () { c.cert = true; xrSave(state); renderCertList(); });
      el.appendChild(row);
    });
  }

  function renderTeamRequests() {
    var el = document.getElementById('teamRequests');
    if (!state.requests.length) { el.innerHTML = '<p class="empty-note">Nessuna richiesta in arrivo.</p>'; return; }
    el.innerHTML = '';
    state.requests.slice().reverse().forEach(function (r) {
      var c = state.candidates[r.candId];
      var st = xrStatoLabel(r);
      var card = document.createElement('div'); card.className = 'req-card';
      var actionsHtml = '';
      if (r.stato === 'inviata') {
        actionsHtml =
          '<div class="req-actions"><button class="btn btn-primary btn-sm act-confirm">Il professionista conferma</button><button class="btn btn-outline btn-sm act-unavail">Non disponibile</button></div>' +
          '<div class="req-actions" style="margin-top:12px;"><div class="form-field" style="min-width:200px;"><label>Oppure propone una data diversa</label>' +
            '<div class="dpick alt-date-pick"><input type="text" class="dpick-input" readonly placeholder="Scegli una data">' +
              '<div class="dpick-pop" hidden><div class="dpick-head"><button type="button" class="dpick-prev">&lsaquo;</button><span class="dpick-month"></span><button type="button" class="dpick-next">&rsaquo;</button></div><div class="dpick-dow"></div><div class="dpick-grid"></div></div>' +
            '</div></div><button class="btn btn-outline btn-sm act-alt">Invia controproposta</button></div>';
      } else if (r.stato === 'controproposta_accettata') {
        actionsHtml = '<div class="req-actions"><button class="btn btn-primary btn-sm act-finalize">Conferma definitivamente</button></div>';
      }
      card.innerHTML = '<div class="req-top"><h3>' + c.nome + ' &rarr; ' + r.studioNome + '</h3><span class="pill ' + st.pill + '">' + st.txt + '</span></div>' +
        '<div class="req-meta">Data richiesta dallo studio: ' + xrFmtDate(r.dataRichiesta) + '</div>' + actionsHtml;

      if (r.stato === 'inviata') {
        var altPicker = xrInitDatePicker(card.querySelector('.alt-date-pick'), { minToday: true });
        card.querySelector('.act-confirm').addEventListener('click', function () { r.stato = 'confermata'; xrSave(state); renderTeamRequests(); });
        card.querySelector('.act-unavail').addEventListener('click', function () { r.stato = 'non_disponibile'; xrSave(state); renderTeamRequests(); });
        card.querySelector('.act-alt').addEventListener('click', function () {
          var v = altPicker.getValue();
          if (!v) { card.querySelector('.alt-date-pick .dpick-input').focus(); return; }
          r.dataProposta = v; r.stato = 'controproposta'; xrSave(state); renderTeamRequests();
        });
      } else if (r.stato === 'controproposta_accettata') {
        card.querySelector('.act-finalize').addEventListener('click', function () { r.dataRichiesta = r.dataProposta; r.stato = 'confermata'; xrSave(state); renderTeamRequests(); });
      }
      el.appendChild(card);
    });
  }
}

/* INIT ---------------------------------------------------------------------- */
(function () {
  xrInitEntry();
  xrInitProfessionista();
  xrInitStudio();
  xrInitTeam();
})();
