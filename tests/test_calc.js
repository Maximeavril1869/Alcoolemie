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
