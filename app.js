/* Alcoolemie - interface. Tout est stocké en local (localStorage). */
(function () {
  'use strict';
  var C = window.AlcoCalc;
  var CLE = 'alcoolemie.v1';
  var MIN = 60000;
  var SHORTCUT_LIRE = 'Alcoolemie Lire';
  var SHORTCUT_ECRIRE = 'Alcoolemie Ecrire';
  var VERSION = '1.3.0';
  var SCHEMA = 2; // 2 : élimination par défaut 0,10 et dernière soirée conservée

  var etat = charger();

  function defaut() {
    return {
      profil: { sexe: 'H', poids: 0, taille: 0, age: 0 },
      repas: 'jeun', methode: 'watson', beta: 0.10,
      verres: [], derniereSoiree: null, schema: SCHEMA
    };
  }
  var trouveAuLancement = false;   // des données ont-elles été retrouvées dans localStorage ?
  var persistant = null;           // stockage marqué « persistant » par l'iPhone ?
  var dernierEtatStockage = null;  // true / false après une écriture

  function charger() {
    try {
      var brut = localStorage.getItem(CLE);
      if (brut) { trouveAuLancement = true; return hydrater(JSON.parse(brut)); }
    } catch (e) { /* stockage indisponible */ }
    return defaut();
  }

  // Reprend un état enregistré ; migration unique vers l'élimination par défaut de 0,10 (schéma 2).
  function hydrater(sauve) {
    var e = Object.assign(defaut(), sauve);
    if (!sauve.schema || sauve.schema < SCHEMA) { e.beta = 0.10; e.schema = SCHEMA; }
    return e;
  }

  // Copie de secours dans IndexedDB (autre mécanisme de stockage du navigateur)
  function ouvrirIdb() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) { rej(new Error('pas d\'IndexedDB')); return; }
      var r = indexedDB.open('alcoolemie', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('kv'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function ecrireIdb(json) {
    return ouvrirIdb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(json, 'etat');
        tx.oncomplete = res; tx.onerror = function () { rej(tx.error); };
      });
    }).catch(function () { /* ignoré */ });
  }
  function lireIdb() {
    return ouvrirIdb().then(function (db) {
      return new Promise(function (res, rej) {
        var rq = db.transaction('kv', 'readonly').objectStore('kv').get('etat');
        rq.onsuccess = function () { res(rq.result || null); };
        rq.onerror = function () { rej(rq.error); };
      });
    }).catch(function () { return null; });
  }

  function sauver() {
    var json = JSON.stringify(etat);
    var ok = false;
    try { localStorage.setItem(CLE, json); ok = localStorage.getItem(CLE) === json; } catch (e) { ok = false; }
    dernierEtatStockage = ok;
    ecrireIdb(json);
    majStatut();
  }

  function majStatut() {
    var el = document.getElementById('stockage');
    if (!el) return;
    var hm = new Date(); var h = ('0' + hm.getHours()).slice(-2) + ':' + ('0' + hm.getMinutes()).slice(-2);
    var txt;
    if (dernierEtatStockage === false) txt = '⚠ Stockage bloqué : les données risquent de ne pas être conservées.';
    else if (dernierEtatStockage === true) txt = 'Données enregistrées sur cet appareil à ' + h + '.';
    else txt = trouveAuLancement ? 'Données retrouvées au lancement.' : 'Aucune donnée retrouvée au lancement (premier lancement ou stockage vidé).';
    if (persistant === true) txt += ' Stockage permanent : oui.';
    else if (persistant === false) txt += ' Stockage permanent : non accordé.';
    el.textContent = txt;
  }

  function remplirChamps() {
    $('sexe').value = etat.profil.sexe || 'H';
    $('age').value = etat.profil.age || '';
    $('poids').value = etat.profil.poids || '';
    $('taille').value = etat.profil.taille || '';
    $('repas').value = etat.repas;
    $('methode').value = etat.methode;
    $('beta').value = etat.beta; $('beta-aff').textContent = fmt(etat.beta);
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
    var gTotal = etat.verres.reduce(function (s, v) { return s + C.gramsAlcool(v.vol, v.deg) * v.n; }, 0);
    $('verres-std').textContent = etat.verres.length ? '≈ ' + fmt(gTotal / 10, 1) + ' verres standard (10 g)' : '';

    var msg = '';
    if (!profilOk) msg = 'Renseigne ton poids dans « Profil et repas » pour calculer.';
    else if (!etat.verres.length) msg = 'Ajoute un verre pour démarrer.';
    else if (niv === 0) msg = 'Sous 0,2 g/L.';
    else if (niv === 1) msg = 'Entre 0,2 et 0,5 g/L : au-dessus de la limite des permis probatoires.';
    else if (niv === 2) msg = 'Entre 0,5 et 0,8 g/L : au-dessus de la limite légale pour conduire.';
    else msg = 'Au-dessus de 0,8 g/L : délit en cas de conduite.';
    $('message').textContent = msg;

    var pt = $('pic-theo');
    if (profilOk && etat.verres.length && sim.pic) {
      var max = C.picTheorique(etat.verres, etat.profil, { methode: etat.methode });
      var t = 'Pic estimé : ' + fmt(sim.pic.c) + ' g/L vers ' + heure(sim.pic.t) +
        '. Maximum théorique, sans aucune élimination : ' + fmt(max) + ' g/L.';
      if (max >= 0.5) t += ' Ce maximum dépasse 0,5 g/L : marge insuffisante pour conduire.';
      pt.textContent = t;
      pt.className = 'discret' + (max >= 0.5 ? ' n2' : '');
    } else {
      pt.textContent = '';
    }

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
    $('sum-liste').textContent = 'Verres de la soirée' + (etat.verres.length ? ' (' + etat.verres.length + ')' : '');

    majDerniere();
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

    $('btn-reset').onclick = nouvelleSoiree;

    // Profil
    var champs = { sexe: 'sexe', age: 'age', poids: 'poids', taille: 'taille' };
    Object.keys(champs).forEach(function (k) {
      var el = $(champs[k]);
      el.value = etat.profil[k] || (k === 'sexe' ? 'H' : '');
      el.onchange = function () {
        etat.profil[k] = k === 'sexe' ? el.value : (parseFloat(el.value) || 0);
        sauver(); rendre();
      };
      el.oninput = el.onchange; // enregistre à chaque frappe, sans attendre de quitter le champ
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

  /* ---------- Clôture de la soirée et envoi vers Santé ---------- */
  function dialogue(titre, texte, boutons) {
    $('dlg-titre').textContent = titre;
    $('dlg-texte').textContent = texte;
    var zone = $('dlg-btns'); zone.innerHTML = '';
    boutons.forEach(function (b) {
      var el = document.createElement('button');
      el.className = b.classe || 'secondaire'; el.textContent = b.l;
      el.onclick = function () { $('dlg').classList.add('cache'); if (b.action) b.action(); };
      zone.appendChild(el);
    });
    $('dlg').classList.remove('cache');
  }

  function exporter(verres) {
    return C.exportSante(verres, etat.profil, { methode: etat.methode, beta: etat.beta, repas: etat.repas }, Date.now());
  }

  function resume(ex) {
    var t = ex.nbVerres + ' verre' + (ex.nbVerres > 1 ? 's' : '') + ' (à leur heure réelle) et ' +
      ex.nbTaux + ' point' + (ex.nbTaux > 1 ? 's' : '') + ' de taux (un toutes les 15 min) seront écrits dans Santé.';
    if (!(etat.profil.poids > 0)) t += '\n\nPoids non renseigné : seuls les verres seront envoyés.';
    else if (!ex.complet) t += '\n\n⚠ Le taux n\'est pas encore revenu à 0 (retour prévu à ' + jourHeure(ex.fin) +
      '). La suite de la courbe ne sera pas envoyée et ne pourra pas être ajoutée plus tard.';
    return t;
  }

  function lancerEcriture(texte) {
    location.href = 'shortcuts://run-shortcut?name=' + encodeURIComponent(SHORTCUT_ECRIRE) +
      '&input=text&text=' + encodeURIComponent(texte);
  }

  function cloturer(envoyee) {
    var ex = exporter(etat.verres); // recalculé au moment du clic : les minutes sont relatives à l'instant de l'envoi
    etat.derniereSoiree = { verres: etat.verres, envoyee: envoyee, le: Date.now() };
    etat.verres = [];
    sauver(); rendre();
    if (envoyee) lancerEcriture(ex.texte);
  }

  function nouvelleSoiree() {
    if (!etat.verres.length) { dialogue('Nouvelle soirée', 'Aucun verre à clôturer.', [{ l: 'OK', classe: 'principal' }]); return; }
    var ex = exporter(etat.verres);
    dialogue('Clôturer la soirée', resume(ex), [
      { l: ex.complet ? 'Envoyer dans Santé et clôturer' : 'Envoyer quand même et clôturer', classe: 'principal', action: function () { cloturer(true); } },
      { l: 'Clôturer sans envoyer', action: function () { cloturer(false); } },
      { l: ex.complet ? 'Annuler' : 'Attendre', classe: 'lien' }
    ]);
  }

  function majDerniere() {
    var d = etat.derniereSoiree;
    var p = $('derniere'), b = $('btn-renvoyer');
    if (!d) { p.textContent = ''; b.classList.add('cache'); return; }
    var n = d.verres.reduce(function (s, v) { return s + v.n; }, 0);
    p.textContent = 'Dernière soirée : ' + n + ' verre' + (n > 1 ? 's' : '') + ', ' + (d.envoyee ? 'envoyée' : 'non envoyée') + ' dans Santé.';
    b.textContent = d.envoyee ? 'Renvoyer la dernière soirée' : 'Envoyer la dernière soirée';
    b.classList.remove('cache');
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
    $('btn-renvoyer').onclick = function () {
      var d = etat.derniereSoiree;
      if (!d) return;
      var ex = exporter(d.verres);
      dialogue('Envoyer la dernière soirée',
        resume(ex) + (d.envoyee ? '\n\nCette soirée a déjà été envoyée : un nouvel envoi crée des doublons dans Santé. À faire seulement si le premier envoi a échoué.' : ''),
        [{ l: 'Envoyer dans Santé', classe: 'principal', action: function () { d.envoyee = true; sauver(); majDerniere(); lancerEcriture(exporter(d.verres).texte); } },
         { l: 'Annuler', classe: 'lien' }]);
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
  majStatut();
  $('version').textContent = VERSION;

  // Si localStorage a été vidé, on tente de récupérer la copie de secours.
  if (!trouveAuLancement) {
    lireIdb().then(function (json) {
      if (!json) return;
      try {
        etat = hydrater(JSON.parse(json));
        trouveAuLancement = true;
        remplirChamps(); sauver(); rendre();
      } catch (e) { /* copie illisible */ }
    });
  }
  // Demande à l'iPhone de ne pas purger le stockage de l'app.
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then(function (p) { persistant = p; majStatut(); }, function () {});
  }

  setInterval(rendre, 30000);
  window.addEventListener('resize', rendre);
  window.addEventListener('pagehide', sauver);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) sauver(); else rendre();
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});
})();
