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

- Ajout de Super Bock (5,2 %, version vendue en France), de Menthe-Pastille Giffard (24 %), et de Ricard Amande bio (45 %).
- Correction : Get 27 passe de 21 % à 17,9 %, valeur actuelle des étiquettes françaises.
- Précision : le produit voulu est Ricard Amande bio (45 %). L'entrée « Ricard prêt à boire » a été retirée.

## 2026-11-22 (raccourci Santé)

- Le texte reçu par le raccourci « Alcoolemie Ecrire » devient un nombre avec l'action « Obtenir des nombres de l'entrée ».
- Pour éviter les erreurs de virgule ou de point sur un iPhone en français, l'app envoie maintenant deux entiers (`420;3`) et le raccourci divise par 10000. Guide mis à jour.

## 2026-11-22 (perte de données à la fermeture)

- Constat : depuis l'icône de l'écran d'accueil, profil, verres et réglages disparaissent à chaque fermeture de l'app. Cause non identifiée.
- Renforcement : enregistrement à chaque frappe et à chaque mise en arrière-plan, copie de secours dans IndexedDB restaurée automatiquement si localStorage est vide, demande de stockage permanent à l'iPhone.
- Ajout d'une ligne d'état en bas de l'écran : données retrouvées au lancement ou non, heure de la dernière sauvegarde, stockage bloqué ou non, stockage permanent accordé ou non.
- À vérifier sur l'iPhone : fermer puis rouvrir l'app et lire la ligne d'état.

## 2026-11-22 (menus repliables)

- Les cartes « Ajouter un verre », « Verres de la soirée », « Profil et repas » et « Apple Santé » deviennent des menus repliables, fermés au lancement. La carte du taux et du graphique reste toujours visible.
- Le titre « Verres de la soirée » affiche le nombre de verres.
- Travail sur la branche `menus-repliables`, en attente de validation avant fusion dans `main`.

## À faire

- Activer GitHub Pages (Settings > Pages, branche main, racine).
- Installer la PWA sur l'iPhone et créer les deux raccourcis (`docs/RACCOURCIS.md`).
- Tester le retour de la lecture Santé dans la PWA installée, et noter ici ce qui marche.
- Vérifier les types de données Santé disponibles dans Raccourcis.
