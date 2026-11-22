const C = require('../calc.js');
const assert = (c, m) => { if (!c) { console.error('ECHEC', m); process.exit(1); } };
// 20 g d'alcool pour 2 demis à 5 %
assert(Math.abs(C.gramsAlcool(500,5)-20)<1e-9, 'grammes');
// Widmark classique : 20/(0.7*75) = 0.381
const p = {sexe:'H',poids:75,taille:175,age:40};
assert(Math.abs(C.coefficientR(p,'widmark')-0.7)<1e-9,'r widmark');
const rw = C.coefficientR(p,'watson');
assert(rw>0.69 && rw<0.72, 'r watson '+rw);
const t0 = Date.UTC(2026,10,22,18,0);
const sim = C.simuler([{t:t0,vol:500,deg:5,n:1}], p, {methode:'widmark',beta:0.15,repas:'jeun'});
assert(Math.abs(sim.pic.c - (20/(0.7*75) - 0.15*(30/60)))<0.03, 'pic ~ '+sim.pic.c);
// retour à zéro : ~0.38/0.15 h ≈ 2.5 h après début
const dureeH = (sim.fin - t0)/3600000;
assert(dureeH>2.3 && dureeH<3.2, 'duree '+dureeH);
// à jeun > repas copieux
const sim2 = C.simuler([{t:t0,vol:500,deg:5,n:1}], p, {methode:'widmark',beta:0.15,repas:'copieux'});
assert(sim2.pic.c < sim.pic.c, 'repas abaisse le pic');
// seuils
const s02 = C.instantSousSeuil(sim,0.2);
assert(s02 && s02 > sim.pic.t && s02 < sim.fin, 'seuil 0.2');
assert(C.instantSousSeuil(sim,0.8)===null,'0.8 jamais atteint');
assert(C.valeurA(sim, t0-3600000)===0 && C.valeurA(sim, sim.fin+3600000)===0, 'hors plage');
assert(C.niveau(0.1)===0&&C.niveau(0.3)===1&&C.niveau(0.6)===2&&C.niveau(0.9)===3,'niveaux');
console.log('pic', sim.pic.c.toFixed(3), 'duree h', dureeH.toFixed(2), 'tout OK');

// Catalogue de boissons
const B = require('../boissons.js');
const ids = new Set();
B.groupes.forEach(g => g.items.forEach(b => {
  assert(!ids.has(b.id), 'id unique ' + b.id); ids.add(b.id);
  if (!b.libre) { assert(b.deg > 0 && b.deg < 96, 'degre ' + b.id); assert(b.f.length > 0 && b.f.every(f => f.vol > 0), 'formats ' + b.id); }
}));
console.log('catalogue', ids.size, 'boissons OK');

// Maximum théorique : 4 Ricard 2 cl, homme 75 kg, r = 0,7 -> 28,8 g / 52,5 = 0,549
const ricard = {t: t0, vol: 20, deg: 45, n: 4};
const max = C.picTheorique([ricard], p, {methode:'widmark'});
assert(Math.abs(max - 28.8/(0.7*75)) < 1e-9, 'pic theorique ' + max);
const simR = C.simuler([ricard], p, {methode:'widmark',beta:0.15,repas:'jeun'});
assert(simR.pic.c < max, 'pic estime sous le maximum theorique');
console.log('maximum theorique', max.toFixed(3), 'pic estime', simR.pic.c.toFixed(3), 'OK');

// Export Santé (option B) : un verre de 50 cl à 5 % à t0, homme 75 kg
const un = [{t: t0, vol: 500, deg: 5, n: 1}];
const opt = {methode: 'widmark', beta: 0.10, repas: 'jeun'};
// 1) 10 min après le verre : taux non revenu à 0, seulement du passé
let ex = C.exportSante(un, p, opt, t0 + 10 * 60000);
assert(ex.lignes[0] === 'V;10;1', 'ligne verre ' + ex.lignes[0]);
assert(!ex.complet, 'incomplet à 10 min');
assert(ex.lignes[1] === 'T;10;' + Math.round(C.valeurA(C.simuler(un, p, opt), t0) * 1000), 'premier point au premier verre');
assert(ex.nbTaux === 1, 'un seul point à 10 min : ' + ex.nbTaux);
// 2) longtemps après : courbe complète jusqu'à 0, un point toutes les 15 min
const now2 = t0 + 12 * 3600000;
ex = C.exportSante(un, p, opt, now2);
assert(ex.complet, 'complet après 12 h');
const T = ex.lignes.filter(l => l[0] === 'T').map(l => l.split(';'));
assert(T[0][1] === '720', 'premier point = heure du premier verre');
assert(T[1][1] === '705', 'pas de 15 min');
assert(T[T.length - 1][2] === '0', 'dernier point à 0');
assert(T.every(x => +x[1] >= 0 && +x[2] >= 0), 'valeurs positives');
const sim5 = C.simuler(un, p, opt);
assert(T.every(x => Math.abs(+x[2] - C.valeurA(sim5, now2 - (+x[1]) * 60000) * 1000) <= 1.01 || x[2] === '0'), 'valeurs = simulation');
// 3) plusieurs verres : une ligne par verre, à l'heure réelle
ex = C.exportSante([{t: t0, vol: 500, deg: 5, n: 2}, {t: t0 + 3600000, vol: 250, deg: 12, n: 1}], p, opt, t0 + 2 * 3600000);
assert(ex.lignes[0] === 'V;120;2' && ex.lignes[1] === 'V;60;1' && ex.nbVerres === 3, 'verres à heure réelle');
// 4) sans poids : seulement les verres
ex = C.exportSante(un, {sexe: 'H', poids: 0}, opt, t0 + 3600000);
assert(ex.nbTaux === 0 && ex.nbVerres === 1, 'sans poids, pas de taux');
console.log('export Santé OK (' + C.exportSante(un, p, opt, now2).nbTaux + ' points sur 12 h)');
