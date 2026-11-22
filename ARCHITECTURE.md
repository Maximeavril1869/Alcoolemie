# Architecture

Application web statique, sans serveur ni dépendance externe. Elle fonctionne hors ligne une fois installée.

```
Alcoolemie/
├── index.html            Structure de la page (cartes : état, ajout, liste, profil, Santé) et boîte de dialogue de clôture
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
Formulaires ──> état (profil, verres, réglages, dernière soirée) ──> localStorage (clé alcoolemie.v1, copie IndexedDB)
                     │
                     ▼
              calc.js : simuler()  ──> points minute par minute
                     │
                     ▼
        app.js : rendre()  ──> taux actuel, verres standard, seuils, graphique (canvas), liste
                     │
                     ▼  « Nouvelle soirée »
        calc.js : exportSante()  ──> Raccourcis ──> Apple Santé
```

## Moteur de calcul (`calc.js`)

- `gramsAlcool(vol, deg)` : grammes d'alcool pur.
- `coefficientR(profil, methode)` : Widmark classique ou Watson (borné entre 0,45 et 0,8).
- `simuler(verres, profil, options)` : pas d'une minute. Chaque verre est absorbé linéairement sur 30, 60 ou 120 minutes selon le repas, avec un facteur de biodisponibilité (1, 0,95, 0,88). L'élimination est linéaire tant que le taux est positif.
- `valeurA(sim, t)`, `instantSousSeuil(sim, seuil)`, `niveau(c)` : lectures du résultat.
- `exportSante(verres, profil, options, maintenant)` : texte envoyé à Santé à la clôture (voir plus bas).

## Apple Santé

Une PWA n'a pas accès à HealthKit. L'échange passe par l'app Raccourcis, appelée via son schéma d'URL :

- Lecture : `shortcuts://x-callback-url/run-shortcut?name=Alcoolemie Lire&x-success=…?result=` ; le raccourci renvoie `poids;taille`. Repli : le raccourci copie aussi le résultat, et le bouton « Coller » le lit dans le presse-papiers.
- Écriture, **une seule fois à la clôture de la soirée** (« Nouvelle soirée ») : `shortcuts://run-shortcut?name=Alcoolemie Ecrire&input=text&text=…`. Le texte contient une ligne par enregistrement : `V;minutes;n` (verre, à son heure réelle) et `T;minutes;mgL` (taux estimé, un point toutes les 15 minutes du premier verre jusqu'à maintenant, ou jusqu'au retour à 0). Les heures sont des minutes avant maintenant, que le raccourci soustrait à la date actuelle. Le taux est un entier en mg/L (0,42 g/L = 420), divisé par 10000 par le raccourci pour obtenir le pourcentage de Santé.
- Seul le passé est écrit (un point déjà écrit ne peut plus être corrigé). Si le taux n'est pas revenu à 0 à la clôture, l'app prévient que la suite de la courbe sera perdue.
- La soirée clôturée est conservée (`derniereSoiree` dans l'état) : le bouton du menu Apple Santé permet de relancer l'envoi si le raccourci a échoué.

Le sexe et l'âge ne sont pas lisibles par les raccourcis et restent saisis à la main.
