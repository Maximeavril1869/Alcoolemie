# Alcoolémie

Calculette d'alcoolémie personnelle, en PWA locale pour iPhone et iPad. Tout reste sur l'appareil, rien n'est envoyé nulle part.

## Fonctions

- Profil : sexe, âge, poids, taille.
- Boissons : catalogue de marques courantes avec leur degré réel (Leffe, Guinness, Kronenbourg, Heineken, Chimay, Ricard, etc.), formats usuels, et saisie libre. Le degré est toujours modifiable : pour le vin, on saisit celui de la bouteille. Un astérisque signale un degré indicatif à confirmer sur l'étiquette.
- Heure de chaque verre, avec absorption progressive puis élimination.
- Repas : à jeun, léger ou copieux (ralentit l'absorption et abaisse un peu le pic).
- Taux actuel en g/L de sang et en mg/L d'air, graphique de la soirée.
- Seuils France : 0,2 / 0,5 / 0,8 g/L, avec l'heure de retour sous chaque seuil et l'heure de retour à zéro.
- Historique de la soirée sauvegardé sur l'appareil.
- Apple Santé via l'app Raccourcis : lecture du poids et de la taille, écriture de l'alcoolémie et du nombre de verres. Voir `docs/RACCOURCIS.md`.

## Méthode de calcul

- Alcool pur : `volume (mL) × degré / 100 × 0,8` grammes.
- Concentration : `grammes / (r × poids)`.
- `r` : Widmark classique (0,7 homme, 0,6 femme) ou eau corporelle totale de Watson (par défaut, si taille et âge sont renseignés).
- Élimination linéaire, réglable (0,15 g/L par heure par défaut).

C'est une estimation indicative. Elle ne remplace pas un éthylotest et le taux réel peut être plus élevé. Ne conduis pas après avoir bu.

## Installation sur iPhone

1. Ouvrir l'adresse GitHub Pages du dépôt dans Safari.
2. Partager, puis « Sur l'écran d'accueil ».

## Fichiers

Voir `ARCHITECTURE.md` pour l'organisation et `CARNET_DE_BORD.md` pour l'historique du projet.

## Licence

Tous droits réservés. Voir le fichier `LICENSE`.
