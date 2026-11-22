/* Alcoolemie - moteur de calcul (pur, sans accès au DOM).
 * Estimation de type Widmark avec absorption progressive et élimination linéaire.
 * Utilisable dans le navigateur (window.AlcoCalc) et sous Node (module.exports). */
(function (root) {
  'use strict';

  var DENSITE = 0.8; // g/mL d'éthanol
  var MIN = 60000;

  var REPAS = [
    { id: 'jeun', nom: 'À jeun', duree: 30, frac: 1.0 },
    { id: 'leger', nom: 'Repas léger', duree: 60, frac: 0.95 },
    { id: 'copieux', nom: 'Repas copieux', duree: 120, frac: 0.88 }
  ];

  var SEUILS = [0.2, 0.5, 0.8];

  function gramsAlcool(volMl, deg) {
    return volMl * deg / 100 * DENSITE;
  }

  /* Coefficient de diffusion r.
   * - 'widmark' : valeurs classiques (0,7 homme / 0,6 femme)
   * - 'watson'  : eau corporelle totale (Watson) si taille et âge connus */
  function coefficientR(p, methode) {
    var classique = p.sexe === 'F' ? 0.6 : 0.7;
    if (methode === 'watson' && p.poids > 0 && p.taille > 0 && p.age > 0) {
      var tbw;
      if (p.sexe === 'F') {
        tbw = -2.097 + 0.1069 * p.taille + 0.2466 * p.poids;
      } else {
        tbw = 2.447 - 0.09516 * p.age + 0.1074 * p.taille + 0.3362 * p.poids;
      }
      var r = tbw / (0.806 * p.poids);
      return Math.min(0.8, Math.max(0.45, r));
    }
    return classique;
  }

  function repasParId(id) {
    for (var i = 0; i < REPAS.length; i++) if (REPAS[i].id === id) return REPAS[i];
    return REPAS[0];
  }

  /* Simulation minute par minute.
   * drinks : [{t (ms), vol (mL), deg (%), n}]
   * Retourne { points:[{t,c}], pic:{t,c}, debut, fin } */
  function simuler(drinks, profil, opts) {
    if (!drinks.length || !(profil.poids > 0)) return { points: [], pic: null };
    var r = coefficientR(profil, opts.methode);
    var beta = opts.beta; // g/L/h
    var repas = repasParId(opts.repas);
    var dur = repas.duree;

    var apports = drinks.map(function (d) {
      var g = gramsAlcool(d.vol, d.deg) * (d.n || 1) * repas.frac;
      return { t0: Math.round(d.t / MIN), c: g / (r * profil.poids) };
    });
    var debut = Math.min.apply(null, apports.map(function (a) { return a.t0; }));
    var dernier = Math.max.apply(null, apports.map(function (a) { return a.t0; }));

    var c = 0, points = [], pic = { t: debut * MIN, c: 0 };
    var m = debut;
    var maxM = debut + 60 * 60; // 60 h max
    while (m <= maxM) {
      var entree = 0;
      for (var i = 0; i < apports.length; i++) {
        var a = apports[i];
        if (m >= a.t0 && m < a.t0 + dur) entree += a.c / dur;
      }
      c += entree;
      if (c > 0) c = Math.max(0, c - beta / 60);
      points.push({ t: m * MIN, c: c });
      if (c > pic.c) pic = { t: m * MIN, c: c };
      if (m > dernier + dur && c <= 0) break;
      m++;
    }
    return { points: points, pic: pic, debut: debut * MIN, fin: points[points.length - 1].t };
  }

  /* Maximum théorique : toute la quantité d'alcool dans le sang d'un coup, sans aucune élimination
   * ni effet du repas. Sert de garde-fou : le pic estimé de simuler() est toujours en dessous. */
  function picTheorique(drinks, profil, opts) {
    if (!drinks.length || !(profil.poids > 0)) return 0;
    var r = coefficientR(profil, opts.methode);
    var g = 0;
    drinks.forEach(function (d) { g += gramsAlcool(d.vol, d.deg) * (d.n || 1); });
    return g / (r * profil.poids);
  }

  function valeurA(sim, tMs) {
    if (!sim.points.length || tMs < sim.debut) return 0;
    if (tMs > sim.fin) return 0;
    var idx = Math.round((tMs - sim.debut) / MIN);
    idx = Math.min(sim.points.length - 1, Math.max(0, idx));
    return sim.points[idx].c;
  }

  /* Instant (ms) à partir duquel le taux passe durablement sous le seuil.
   * null si le seuil n'est jamais atteint. */
  function instantSousSeuil(sim, seuil) {
    var dernierAu = -1;
    for (var i = 0; i < sim.points.length; i++) {
      if (sim.points[i].c >= seuil) dernierAu = i;
    }
    if (dernierAu === -1) return null;
    var j = Math.min(dernierAu + 1, sim.points.length - 1);
    return sim.points[j].t;
  }

  function niveau(c) {
    if (c < 0.2) return 0;
    if (c < 0.5) return 1;
    if (c < 0.8) return 2;
    return 3;
  }

  var api = {
    REPAS: REPAS, SEUILS: SEUILS, DENSITE: DENSITE,
    gramsAlcool: gramsAlcool, coefficientR: coefficientR, simuler: simuler, picTheorique: picTheorique,
    valeurA: valeurA, instantSousSeuil: instantSousSeuil, niveau: niveau
  };
  root.AlcoCalc = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
