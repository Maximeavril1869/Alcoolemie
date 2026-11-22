/* Alcoolemie - interface. Tout est stocké en local (localStorage). */
(function () {
  'use strict';
  var C = window.AlcoCalc;
  var CLE = 'alcoolemie.v1';
  var MIN = 60000;
  var SHORTCUT_LIRE = 'Alcoolemie Lire';
  var SHORTCUT_ECRIRE = 'Alcoolemie Ecrire';

  var etat = charger();

  function defaut() {
    return {
      profil: { sexe: 'H', poids: 0, taille: 0, age: 0 },
      repas: 'jeun', methode: 'watson', beta: 0.15,
      verres: []
    };
  }
  function charger() {
    try {
      var brut = localStorage.getItem(CLE);
      if (brut) return Object.assign(defaut(), JSON.parse(brut));
    } catch (e) { /* stockage indisponible */ }
    return defaut();
  }
  function sauver() {
    try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch (e) { /* ignoré */ }
  }
  function $(id) { return document.getElementById(id); }

  function fmt(n, d) { return n.toFixed(d === undefined ? 2 : d).replace('.', ','); }
  function heure(ms) {
    var d = new Date(ms);
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }
  function jourHeure(ms) {
    var auj = new Date(); auj.setHours(0, 0, 0, 0);
    var d = new Date(ms);
    var j = new Date(ms); j.setHours(0, 0, 0, 0);
    var delta = Math.round((j - auj) / 86400000);
    var pref = delta === 0 ? '' : (delta === 1 ? 'demain ' : (delta === -1 ? 'hier ' : ''));
    return pref + heure(d.getTime());
  }
  function duree(ms) {
    var m = Math.max(0, Math.round(ms / MIN));
    var h = Math.floor(m / 60), r = m % 60;
    return h ? h + ' h ' + ('0' + r).slice(-2) : r + ' min';
  }

  function simulation() {
    return C.simuler(etat.verres, etat.profil, { methode: etat.methode, beta: etat.beta, repas: etat.repas });
  }

  /* ---------- Rendu ---------- */
  function rendre() {
    var maintenant = Date.now();
    var profilOk = etat.profil.poids > 0;
    var sim = profilOk ? simulation() : { points: [], pic: null };
    var c = profilOk ? C.valeurA(sim, maintenant) : 0;
    var niv = C.niveau(c);

    $('valeur').textContent = fmt(c);
    $('valeur').className = 'valeur n' + niv;
    $('valeur-air').textContent = fmt(c / 2) + ' mg/L d\'air';

    var msg = '';
    if (!profilOk) msg = 'Renseigne ton poids dans « Profil et repas » pour calculer.';
    else if (!etat.verres.length) msg = 'Ajoute un verre pour démarrer.';
    else if (niv === 0) msg = 'Sous 0,2 g/L.';
    else if (niv === 1) msg = 'Entre 0,2 et 0,5 g/L : au-dessus de la limite des permis probatoires.';
    else if (niv === 2) msg = 'Entre 0,5 et 0,8 g/L : au-dessus de la limite légale pour conduire.';
    else msg = 'Au-dessus de 0,8 g/L : délit en cas de conduite.';
    if (profilOk && sim.pic && sim.pic.c > 0 && maintenant < sim.pic.t) {
      msg += ' Le pic attendu est de ' + fmt(sim.pic.c) + ' g/L vers ' + heure(sim.pic.t) + '.';
    }
    $('message').textContent = msg;

    // Seuils
    var ul = $('seuils'); ul.innerHTML = '';
    C.SEUILS.forEach(function (s) {
      var li = document.createElement('li');
      var gauche = document.createElement('span');
      gauche.textContent = 'Sous ' + fmt(s, 1) + ' g/L';
      var droite = document.createElement('span');
      var t = profilOk && etat.verres.length ? C.instantSousSeuil(sim, s) : null;
      if (t === null) droite.textContent = profilOk && etat.verres.length ? 'jamais dépassé' : '—';
      else if (t <= maintenant) droite.textContent = 'depuis ' + heure(t);
      else droite.textContent = jourHeure(t) + ' (dans ' + duree(t - maintenant) + ')';
      li.appendChild(gauche); li.appendChild(droite); ul.appendChild(li);
    });
    var liZero = document.createElement('li');
    var l = document.createElement('span'); l.textContent = 'Retour à 0,00';
    var r = document.createElement('span');
    if (profilOk && etat.verres.length) {
      r.textContent = sim.fin <= maintenant ? 'depuis ' + heure(sim.fin) :
        jourHeure(sim.fin) + ' (dans ' + duree(sim.fin - maintenant) + ')';
    } else r.textContent = '—';
    liZero.appendChild(l); liZero.appendChild(r); ul.appendChild(liZero);

    // Liste des verres
    var liste = $('liste'); liste.innerHTML = '';
    etat.verres.slice().sort(function (a, b) { return a.t - b.t; }).forEach(function (v) {
      var li = document.createElement('li');
      var txt = document.createElement('span');
      var g = C.gramsAlcool(v.vol, v.deg) * v.n;
      txt.textContent = heure(v.t) + ' · ' + v.n + ' × ' + v.nom + ' (' + fmt(g, 0) + ' g)';
      var b = document.createElement('button');
      b.className = 'sup'; b.textContent = '×'; b.setAttribute('aria-label', 'Supprimer');
      b.onclick = function () {
        etat.verres = etat.verres.filter(function (x) { return x.id !== v.id; });
        sauver(); rendre();
      };
      li.appendChild(txt); li.appendChild(b); liste.appendChild(li);
    });
    $('liste-vide').style.display = etat.verres.length ? 'none' : 'block';

    dessiner(sim, maintenant);
  }

  function dessiner(sim, maintenant) {
    var cv = $('graphe');
    var dpr = window.devicePixelRatio || 1;
    var L = cv.clientWidth, H = 190;
    cv.width = L * dpr; cv.height = H * dpr;
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, L, H);
    var mg = { g: 34, d: 8, h: 8, b: 20 };
    var w = L - mg.g - mg.d, h = H - mg.h - mg.b;
    if (!sim.points.length) {
      g.fillStyle = '#99a0ab'; g.font = '13px sans-serif';
      g.fillText('Le graphique apparaît après le premier verre.', mg.g, H / 2);
      return;
    }
    var t0 = sim.debut - 15 * MIN, t1 = sim.fin + 15 * MIN;
    var cmax = Math.max(0.9, sim.pic.c * 1.1);
    function X(t) { return mg.g + (t - t0) / (t1 - t0) * w; }
    function Y(c) { return mg.h + h - c / cmax * h; }
    g.font = '11px sans-serif'; g.textBaseline = 'middle';
    var couleurs = { 0.2: '#3ecf8e', 0.5: '#f2933a', 0.8: '#ef5350' };
    C.SEUILS.forEach(function (s) {
      g.strokeStyle = couleurs[s]; g.globalAlpha = 0.5; g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(mg.g, Y(s)); g.lineTo(mg.g + w, Y(s)); g.stroke();
      g.globalAlpha = 1; g.setLineDash([]);
      g.fillStyle = '#99a0ab'; g.textAlign = 'right';
      g.fillText(fmt(s, 1), mg.g - 4, Y(s));
    });
    g.strokeStyle = '#5b9dff'; g.lineWidth = 2; g.beginPath();
    sim.points.forEach(function (p, i) {
      if (i === 0) g.moveTo(X(p.t), Y(p.c)); else g.lineTo(X(p.t), Y(p.c));
    });
    g.stroke();
    if (maintenant >= t0 && maintenant <= t1) {
      g.strokeStyle = '#eef0f3'; g.globalAlpha = 0.6; g.lineWidth = 1;
      g.beginPath(); g.moveTo(X(maintenant), mg.h); g.lineTo(X(maintenant), mg.h + h); g.stroke();
      g.globalAlpha = 1;
    }
    g.fillStyle = '#99a0ab'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    var pas = Math.max(1, Math.ceil((t1 - t0) / (4 * 3600000)));
    var debutH = new Date(t0); debutH.setMinutes(0, 0, 0);
    for (var t = debutH.getTime() + 3600000; t < t1; t += pas * 3600000) {
      if (t > t0) g.fillText(heure(t), X(t), H - 4);
    }
  }

  /* ---------- Formulaires ---------- */
  function initFormulaires() {
    var sel = $('boisson'), fmtSel = $('format');
    var parId = {};
    window.AlcoBoissons.groupes.forEach(function (g) {
      var og = document.createElement('optgroup'); og.label = g.nom;
      g.items.forEach(function (b) {
        parId[b.id] = b;
        var o = document.createElement('option'); o.value = b.id;
        o.textContent = b.nom + (b.v === false ? ' *' : '');
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
    function majLibre() { $('libre').classList.toggle('cache', fmtSel.value !== 'autre'); }
    function majBoisson() {
      var b = parId[sel.value];
      fmtSel.innerHTML = '';
      b.f.forEach(function (f) {
        var o = document.createElement('option'); o.value = String(f.vol); o.textContent = f.l; fmtSel.appendChild(o);
      });
      var autre = document.createElement('option'); autre.value = 'autre'; autre.textContent = 'Autre volume…';
      fmtSel.appendChild(autre);
      if (b.libre) fmtSel.value = 'autre';
      $('deg').value = b.deg || '';
      $('note-boisson').textContent = b.note || (b.v === false ? '* Degré indicatif : vérifie l\'étiquette.' : '');
      majLibre();
    }
    sel.onchange = majBoisson; fmtSel.onchange = majLibre;
    majBoisson();

    var rp = $('repas');
    C.REPAS.forEach(function (r) {
      var o = document.createElement('option'); o.value = r.id; o.textContent = r.nom; rp.appendChild(o);
    });

    $('heure').value = heure(Date.now());

    $('btn-ajout').onclick = function () {
      var b = parId[sel.value];
      var deg = parseFloat($('deg').value);
      var libreVol = fmtSel.value === 'autre';
      var vol = libreVol ? parseFloat($('libre-vol').value) * 10 : parseFloat(fmtSel.value);
      var n = parseInt($('quantite').value, 10);
      if (!(vol > 0) || !(deg > 0) || !(n > 0)) { alert('Volume, degré et quantité doivent être positifs.'); return; }
      var libelleVol = libreVol ? fmt(vol / 10, 1) + ' cl' : fmtSel.options[fmtSel.selectedIndex].text;
      var nom = (b.libre ? 'Boisson libre' : b.nom) + ' (' + libelleVol + ', ' + fmt(deg, 1) + ' %)';
      var hm = ($('heure').value || heure(Date.now())).split(':');
      var d = new Date(); d.setHours(parseInt(hm[0], 10), parseInt(hm[1], 10), 0, 0);
      if (d.getTime() > Date.now() + 2 * MIN) d.setDate(d.getDate() - 1); // heure future = la veille
      etat.verres.push({ id: String(Date.now()) + Math.random().toString(36).slice(2, 6), nom: nom, vol: vol, deg: deg, n: n, t: d.getTime() });
      $('quantite').value = 1; $('heure').value = heure(Date.now());
      sauver(); rendre();
    };

    $('btn-reset').onclick = function () {
      if (confirm('Effacer les verres de la soirée ?')) { etat.verres = []; sauver(); rendre(); }
    };

    // Profil
    var champs = { sexe: 'sexe', age: 'age', poids: 'poids', taille: 'taille' };
    Object.keys(champs).forEach(function (k) {
      var el = $(champs[k]);
      el.value = etat.profil[k] || (k === 'sexe' ? 'H' : '');
      el.onchange = function () {
        etat.profil[k] = k === 'sexe' ? el.value : (parseFloat(el.value) || 0);
        sauver(); rendre();
      };
    });
    rp.value = etat.repas; rp.onchange = function () { etat.repas = rp.value; sauver(); rendre(); };
    $('methode').value = etat.methode;
    $('methode').onchange = function () { etat.methode = $('methode').value; sauver(); rendre(); };
    var bt = $('beta');
    bt.value = etat.beta; $('beta-aff').textContent = fmt(etat.beta);
    bt.oninput = function () {
      etat.beta = parseFloat(bt.value); $('beta-aff').textContent = fmt(etat.beta); sauver(); rendre();
    };
  }

  /* ---------- Apple Santé via Raccourcis ---------- */
  function info(t) { $('sante-info').textContent = t; }

  function appliquerLecture(texte) {
    // Format attendu : "poids;taille", par ex. "75,5;178"
    var morceaux = String(texte).replace(/,/g, '.').split(/[;\n]/).map(function (s) { return parseFloat(s); });
    var poids = morceaux[0], taille = morceaux[1];
    var ok = false;
    if (poids >= 30 && poids <= 250) { etat.profil.poids = Math.round(poids * 10) / 10; $('poids').value = etat.profil.poids; ok = true; }
    if (taille >= 120 && taille <= 230) { etat.profil.taille = Math.round(taille); $('taille').value = etat.profil.taille; ok = true; }
    if (ok) { sauver(); rendre(); info('Poids et taille mis à jour depuis Santé.'); }
    else info('Valeurs non reconnues. Attendu : « poids;taille », par exemple 75,5;178.');
    return ok;
  }

  function initSante() {
    $('btn-lire').onclick = function () {
      var retour = location.origin + location.pathname;
      var url = 'shortcuts://x-callback-url/run-shortcut?name=' + encodeURIComponent(SHORTCUT_LIRE) +
        '&x-success=' + encodeURIComponent(retour + '?result=') +
        '&x-cancel=' + encodeURIComponent(retour);
      info('Si tu reviens sans valeurs, utilise « Coller » : le raccourci copie aussi le résultat.');
      location.href = url;
    };
    $('btn-coller').onclick = function () {
      if (!navigator.clipboard || !navigator.clipboard.readText) { info('Lecture du presse-papiers non disponible ici.'); return; }
      navigator.clipboard.readText().then(appliquerLecture, function () { info('Accès au presse-papiers refusé.'); });
    };
    $('btn-ecrire').onclick = function () {
      var sim = simulation();
      var c = etat.profil.poids > 0 ? C.valeurA(sim, Date.now()) : 0;
      var verres = etat.verres.reduce(function (s, v) { return s + v.n; }, 0);
      // Santé stocke l'alcoolémie en pourcentage : 0,5 g/L = 0,05 %
      var texte = (c / 10).toFixed(4) + ';' + verres;
      location.href = 'shortcuts://run-shortcut?name=' + encodeURIComponent(SHORTCUT_ECRIRE) +
        '&input=text&text=' + encodeURIComponent(texte);
    };
    var p = new URLSearchParams(location.search);
    if (p.has('result')) {
      var res = p.get('result');
      history.replaceState(null, '', location.pathname);
      if (res) appliquerLecture(res);
    }
  }

  /* ---------- Démarrage ---------- */
  initFormulaires();
  initSante();
  rendre();
  setInterval(rendre, 30000);
  window.addEventListener('resize', rendre);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) rendre(); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
