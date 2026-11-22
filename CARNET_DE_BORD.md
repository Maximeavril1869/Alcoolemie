# Carnet de bord

Où en est le projet : la version 1 est écrite et testée en local. Elle n'est pas encore poussée sur GitHub ni installée sur iPhone.

## 2026-11-22

- Cadrage : calculette d'alcoolémie personnelle, nommée Alcoolemie, en PWA locale pour iPhone et iPad.
- Choix validés : profil complet, boissons (liste et saisie libre), heures de prise avec élimination, repas, seuils 0,2 / 0,5 / 0,8 g/L, historique de la soirée sauvegardé en local.
- Apple Santé : une PWA ne peut pas accéder à HealthKit. Voie retenue : PWA et app Raccourcis, avec lecture (poids, taille) et écriture (alcoolémie, nombre de verres).
- Écriture du moteur de calcul (`calc.js`) et test sous Node (`tests/test_calc.js`) : tous les contrôles passent. Exemple : un homme de 75 kg qui boit 50 cl de bière à 5 % atteint 0,31 g/L au pic en mode Widmark à jeun, et revient à zéro en environ 2 h 30.
- Écriture de l'interface, du service worker, du manifeste et des icônes.
- Rédaction du README, de l'architecture et du guide des raccourcis.

## À faire

- Pousser le projet sur GitHub (dépôt Maximeavril1869/Alcoolemie, branche main) et activer GitHub Pages.
- Installer la PWA sur l'iPhone et créer les deux raccourcis (`docs/RACCOURCIS.md`).
- Tester le retour de la lecture Santé dans la PWA installée, et noter ici ce qui marche.
- Vérifier les types de données Santé disponibles dans Raccourcis.
