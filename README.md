# Studio Xcellence — Sito Vetrina

Bozza del sito vetrina di Studio Xcellence Dental Consulting. HTML/CSS/JS puro, nessuna installazione richiesta per iniziare a modificarlo.

## Come vedere il sito in locale

I file usano `fetch()` per caricare header e footer condivisi (cartella `partials/`), quindi **non funzionano se apri semplicemente il file .html con doppio click** (il browser blocca il fetch su `file://`). Serve un piccolo server locale — due modi semplici:

**Opzione A — VS Code (consigliata)**
1. Installa l'estensione gratuita "Live Server" in VS Code.
2. Apri la cartella `studioxcellence-web`, tasto destro su `index.html` → "Open with Live Server".

**Opzione B — Python (già presente sul tuo PC)**
```bash
cd studioxcellence-web
python -m http.server 5500
```
Poi apri `http://localhost:5500` nel browser.

## Struttura dei file

```
studioxcellence-web/
├── index.html          Home
├── metodo.html          Il Metodo Xcellence
├── servizi.html         Servizi (Consulting, Digital, Network, Academy)
├── team.html             Team
├── contatti.html         Contatti + form
├── magazine.html         X Magazine (recensioni, articoli, FAQ)
├── partials/
│   ├── header.html       Menu di navigazione (uguale su tutte le pagine)
│   └── footer.html       Footer (uguale su tutte le pagine)
└── assets/
    ├── css/style.css     Tutto lo stile del sito, con commenti per sezione
    ├── js/main.js        Tutte le interazioni (menu, transizioni, flip, FAQ, form)
    └── images/           Loghi e immagini segnaposto
```

## Cosa modificare subito

1. **Logo**: sostituisci `assets/images/logo.svg` con il tuo file reale (va bene anche `.png`— in quel caso aggiorna i riferimenti in `partials/header.html`, `partials/footer.html` e i tag `<link rel="icon">` in ogni pagina).
2. **Foto segnaposto**: tutti i file `assets/images/placeholder-*.svg` sono disegni astratti temporanei. Cercali nel codice (sono facili da trovare, ogni `<img src="assets/images/placeholder-...">`) e sostituiscili con foto vere (stesso nome file, o cambia il percorso).
3. **Testi segnaposto**: cerca nel codice la parola `segnaposto` — sono i punti con indirizzo, contatti, bio del team, recensioni e articoli ancora da scrivere.
4. **Contatti reali**: indirizzo, email, telefono e social sono in `partials/footer.html` e in `contatti.html`.
5. **Team**: in `team.html` ci sono 3 card. Le prime info di Francesca Franchin sono già impostate, le altre 2 persone sono segnaposto (nome, ruolo, foto, bio).

## Colori e font

Tutta la palette è definita in un unico punto: le variabili `:root` all'inizio di `assets/css/style.css` (sezione "2. VARIABILI"). Cambiando quei valori (`--bg`, `--surface`, `--ink`, `--ink-soft`, `--line`) il colore si aggiorna automaticamente su tutto il sito.

Palette attuale — "quiet luxury" monocromatica, ispirata a Sweet Magnolia Dentistry: avorio caldo (`--bg` / `--surface`) e testo/dettagli in tortora-marrone (`--ink` / `--ink-soft`), **nessun colore d'accento**. L'unico momento scuro del sito è la transizione tra pagine (sipario in `--ink`), lasciata apposta come piccolo "colpo d'occhio" senza intaccare la quiete cromatica del resto.

I font (Marcellus per i titoli, Cormorant per corpo testo/etichette/citazioni) sono caricati da Google Fonts nella prima riga del CSS. Marcellus ha un solo peso (regular): l'enfasi nei titoli è affidata a dimensione e letter-spacing, non al grassetto.

## Il form contatti

Al momento il form in `contatti.html` **non invia dati a nessun server**: mostra solo un messaggio di conferma finto, per non promettere una funzione che ancora non esiste. La logica è isolata in `assets/js/main.js`, funzione `initContactForm()`, con un commento `TODO` che spiega dove agganciare un vero invio (es. un servizio come Formspree, oppure un endpoint personalizzato quando sarà pronto il backend).

## E il portale (login, dashboard, matching)?

Il business plan descrive anche un vero portale con aree riservate (Area Studio / Area Professionista), dashboard KPI e algoritmo di matching — quella è un'infrastruttura a sé, molto più grande di un sito vetrina, prevista come fase successiva.

Il percorso più semplice per arrivarci **senza dover riscrivere questo sito da zero**:
1. Tenere questo sito così com'è per la parte pubblica (vetrina).
2. Aggiungere nuove pagine statiche (es. `login.html`, `area-studio.html`) che usano un servizio "backend pronto all'uso" come **Supabase** o **Firebase**: gestiscono login, database e permessi senza dover scrivere un server da zero, e si collegano con poche righe di JavaScript, esattamente come già fa questo sito.
3. Solo se in futuro il portale diventa molto complesso (tante schermate, logica applicativa pesante) valuterete una migrazione a un framework come Next.js — ma non è necessaria per partire.

## Pubblicare il sito online

Essendo file statici, puoi pubblicarlo gratis in pochi minuti su **Netlify** o **Vercel** (basta trascinare la cartella `studioxcellence-web` nella loro dashboard) oppure su qualunque hosting tradizionale via FTP.
