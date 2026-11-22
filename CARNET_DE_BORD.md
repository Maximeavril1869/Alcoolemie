# Carnet de bord

Où en est le projet : la version 1 est écrite, testée et poussée sur la branche main. Il reste à activer GitHub Pages, à installer la PWA sur l'iPhone et à créer les deux raccourcis.

## 2026-11-22

- Cadrage : calculette d'alcoolémie personnelle, nommée Alcoolemie, en PWA locale pour iPhone et iPad.
- Choix validés : profil complet, boissons (liste et saisie libre), heures de prise avec élimination, repas, seuils 0,2 / 0,5 / 0,8 g/L, historique de la soirée sauvegardé en local.
- Apple Santé : une PWA ne peut pas accéder à HealthKit. Voie retenue : PWA et app Raccourcis, avec lecture (poids, taille) et écriture (alcoolémie, nombre de verres).
- Écriture du moteur de calcul (`calc.js`) et test sous Node (`tests/test_calc.js`) : tous les contrôles passent. Exemple : un homme de 75 kg qui boit 50 cl de bière à 5 % atteint 0,31 g/L au pic en mode Widmark à jeun, et revient à zéro en environ 2 h 30.
- Écriture de l'interface, du service worker, du manifeste et des icônes.
- Rédaction du README, de l'architecture et du guide des raccourcis.
- Poussée de la version 1 sur main. L'activation de GitHub Pages n'est pas possible depuis l'environnement de développement : à faire dans Settings > Pages (branche main, dossier racine).

## 2026-11-22 (suite)

- Demande : 50 cl de Leffe et 50 cl de Guinness n'ont pas le même degré, et le vin doit se saisir avec le degré de la bouteille.
- Ajout d'un catalogue de marques (`boissons.js`, 66 entrées) : bières, cidres, vins, apéritifs, spiritueux, cocktails. Chaque boisson propose des formats usuels et un degré prérempli modifiable.
- Degrés vérifiés sur des sites de marques ou de distributeurs, sauf ceux marqués d'un astérisque (indicatifs). Point d'attention : Leffe Brune, 6,5 % selon le site Leffe France, 4,3 % selon une autre fiche ; la valeur retenue est 6,5 %.
- Les vins, champagne et crémants sont préremplis avec une valeur moyenne et un rappel de saisir le degré de la bouteille.
- Test dans un navigateur : le degré se préremplit selon la marque et reste modifiable, sans erreur.

## 2026-11-22 (ajouts de marques)

- Ajout de Super Bock (5,2 %, version vendue en France), de Menthe-Pastille Giffard (24 %), de Ricard Amande bio (45 %) et de Ricard prêt à boire (4,5 %, 20 cl).
- Correction : Get 27 passe de 21 % à 17,9 %, valeur actuelle des étiquettes françaises.
- Point ouvert : le produit « Ricard Amande Orgeat » n'a pas été retrouvé sous ce nom. Les deux candidats sont ajoutés en attendant confirmation.

## À faire

- Activer GitHub Pages (Settings > Pages, branche main, racine).
- Installer la PWA sur l'iPhone et créer les deux raccourcis (`docs/RACCOURCIS.md`).
- Tester le retour de la lecture Santé dans la PWA installée, et noter ici ce qui marche.
- Vérifier les types de données Santé disponibles dans Raccourcis.
