# Architecture

Application web statique, sans serveur ni dépendance externe. Elle fonctionne hors ligne une fois installée.

```
Alcoolemie/
├── index.html            Structure de la page (cartes : état, ajout, liste, profil, Santé)
├── style.css             Thème sombre, mise en page mobile
├── boissons.js           Catalogue de boissons : marques, degrés, formats (degré toujours modifiable)
├── calc.js               Moteur de calcul pur (aucun accès au DOM), testable sous Node
├── app.js                Interface : rendu, formulaires, stockage local, Raccourcis
├── sw.js                 Service worker : cache pour l'usage hors ligne
├── manifest.webmanifest  Métadonnées PWA
├── icons/                Icônes 180, 192 et 512 px
├── tests/test_calc.js    Tests du moteur de calcul (node tests/test_calc.js)
├── docs/RACCOURCIS.md    Création des deux raccourcis iOS pour Apple Santé
├── README.md             Présentation
├── CARNET_DE_BORD.md     Historique des opérations
├── ARCHITECTURE.md       Ce fichier
└── LICENSE               Tous droits réservés
```

## Flux de données

```
Formulaires ──> état (profil, verres, réglages) ──> localStorage (clé alcoolemie.v1)
                     │
                     ▼
              calc.js : simuler()  ──> points minute par minute
                     │
                     ▼
        app.js : rendre()  ──> taux actuel, seuils, graphique (canvas), liste
```

## Moteur de calcul (`calc.js`)

- `gramsAlcool(vol, deg)` : grammes d'alcool pur.
- `coefficientR(profil, methode)` : Widmark classique ou Watson (borné entre 0,45 et 0,8).
- `simuler(verres, profil, options)` : pas d'une minute. Chaque verre est absorbé linéairement sur 30, 60 ou 120 minutes selon le repas, avec un facteur de biodisponibilité (1, 0,95, 0,88). L'élimination est linéaire tant que le taux est positif.
- `valeurA(sim, t)`, `instantSousSeuil(sim, seuil)`, `niveau(c)` : lectures du résultat.

## Apple Santé

Une PWA n'a pas accès à HealthKit. L'échange passe par l'app Raccourcis, appelée via son schéma d'URL :

- Lecture : `shortcuts://x-callback-url/run-shortcut?name=Alcoolemie Lire&x-success=…?result=` ; le raccourci renvoie `poids;taille`. Repli : le raccourci copie aussi le résultat, et le bouton « Coller » le lit dans le presse-papiers.
- Écriture : `shortcuts://run-shortcut?name=Alcoolemie Ecrire&input=text&text=mgL;verres`. L'alcoolémie est envoyée en entier (0,42 g/L = 420), le raccourci divise par 10000 pour obtenir le pourcentage de Santé.

Le sexe et l'âge ne sont pas lisibles par les raccourcis et restent saisis à la main.
