# Carnet de bord

Où en est le projet : version 1.3.1 poussée sur main. L'écriture dans Santé a été refaite (envoi unique à la clôture de la soirée) ; il reste à refaire le raccourci « Alcoolemie Ecrire » sur l'iPhone selon `docs/RACCOURCIS.md` et à le tester.

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
- Validé par l'utilisateur et fusionné dans `main`. La branche distante `menus-repliables` n'a pas pu être supprimée depuis l'environnement de développement : à supprimer sur GitHub.

## 2026-11-22 (maximum théorique)

- Constat : avec 4 Ricard de 2 cl, le pic estimé (0,45 g/L) reste sous 0,5 alors que le calcul brut, sans élimination, donne 0,54 g/L. Le pic estimé suppose une élimination dès le début de l'absorption, ce qui l'abaisse.
- Ajout d'une ligne sous le taux : pic estimé et maximum théorique sans aucune élimination, avec un avertissement orange si ce maximum dépasse 0,5 g/L.
- À traiter ensuite : l'écriture dans Santé, qui n'est pas concluante pour l'instant.

## 2026-11-22 (version 1.3.0 : écriture dans Santé, option B)

- Constat : l'ancien envoi écrivait un instantané (taux du moment et total de verres, tous datés de l'appui). Peu utile dans Santé.
- Décision : un envoi unique à la clôture de la soirée (« Nouvelle soirée »). Le bouton « Écrire dans Santé » est supprimé. Chaque verre est écrit à son heure réelle ; le taux estimé est écrit toutes les 15 minutes, du premier verre jusqu'à maintenant (ou jusqu'au retour à 0).
- Le taux juste après un verre est proche de 0 puis monte avec l'absorption : la courbe partant du premier verre rend bien cette montée, et le pic est le point le plus haut.
- Limite assumée : seul le passé est écrit (Raccourcis ne peut pas corriger un point déjà écrit). Si le taux n'est pas revenu à 0 à la clôture, l'app prévient et propose d'attendre ; la suite de la courbe est perdue si on envoie quand même.
- Format envoyé au raccourci : lignes `V;minutes;n` et `T;minutes;mgL`, avec des minutes avant maintenant (aucun format de date à interpréter). Fonction `exportSante()` dans `calc.js`, testée (`tests/test_calc.js`).
- Ajout d'une boîte de dialogue de clôture (envoyer et clôturer / clôturer sans envoyer / annuler ou attendre) et conservation de la dernière soirée, avec un bouton pour la renvoyer si le raccourci a échoué.
- Élimination par défaut ramenée à 0,10 g/L/h (plus prudent). Migration unique de l'état déjà enregistré (schéma 2) : le réglage passe à 0,10 une fois, à ajuster ensuite avec le curseur.
- Affichage du nombre de verres standard (10 g) à côté du taux. Affichage de la version en bas de l'écran. Cache du service worker passé en v6.
- Guide `docs/RACCOURCIS.md` réécrit pour le nouveau raccourci (boucle sur les lignes, date = maintenant moins les minutes). Types Santé : l'action « Enregistrer un échantillon de santé » accepte une date ; son champ « Type » n'accepte pas de variable, d'où le Si / Sinon.
- Testé dans un navigateur de test : migration, verres standard, boîte de dialogue, conservation de la dernière soirée, aucune erreur. Non testé : le raccourci lui-même et l'écriture réelle dans Santé (à faire sur l'iPhone).

## 2026-11-22 (version 1.3.1 : positionnement en haut de l'écran)

- Constat : sur l'iPhone, le haut de l'app était flou (barre d'état translucide au-dessus du contenu).
- Comparaison avec 5rois, 6quiprend, Flip7 et LeContrat : tous utilisent la barre d'état `default` et un décalage haut de `env(safe-area-inset-top) + 28px`.
- Alignement d'Alcoolemie sur ce réglage. Le style de barre d'état est lu à l'installation : pour qu'il change, supprimer l'app de l'écran d'accueil puis la réinstaller depuis Safari.

## À faire

- Activer GitHub Pages (Settings > Pages, branche main, racine).
- Installer la PWA sur l'iPhone, créer « Alcoolemie Lire » et refaire « Alcoolemie Ecrire » (`docs/RACCOURCIS.md`).
- Tester le retour de la lecture Santé dans la PWA installée, et noter ici ce qui marche.
- Vérifier sur l'iPhone les types « Taux d'alcool dans le sang » et « Nombre de boissons alcoolisées » dans Raccourcis, et la présence du champ date.
- Supprimer la branche distante `menus-repliables` sur GitHub (déjà fusionnée).
- Confirmer le degré de la Leffe Brune sur la bouteille (6,5 % retenu, 4,3 % selon une autre fiche).
