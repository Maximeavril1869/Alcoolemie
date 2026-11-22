# Raccourcis Apple Santé

Deux raccourcis à créer une seule fois dans l'app Raccourcis. Les noms doivent être exactement ceux-ci, sans accent.

## 1. « Alcoolemie Lire » (poids et taille depuis Santé)

1. **Rechercher des échantillons de santé** : type Poids, trier par date de début (la plus récente d'abord), limite 1.
2. **Obtenir les détails des échantillons de santé** : Valeur, en kg.
3. **Rechercher des échantillons de santé** : type Taille, même tri, limite 1.
4. **Obtenir les détails des échantillons de santé** : Valeur, en cm.
5. **Texte** : `[Poids];[Taille]` avec les deux variables des étapes 2 et 4.
6. **Copier dans le presse-papiers** : le texte.
7. **Arrêter et sortir** avec le texte comme résultat.

## 2. « Alcoolemie Ecrire » (alcoolémie et verres vers Santé)

L'app envoie un texte `mg/L;verres` avec deux entiers, par exemple `420;3` (0,42 g/L et 3 verres). Pas de virgule ni de point : cela évite les erreurs de séparateur décimal.

1. **Diviser le texte** (entrée du raccourci) avec le séparateur personnalisé `;`.
2. **Obtenir l'élément de la liste** : premier élément.
3. **Obtenir des nombres de l'entrée** : c'est l'action qui transforme le texte en nombre (il n'existe pas d'action « Convertir en nombre »).
4. **Calculer** : le nombre ÷ 10000. Exemple : 420 devient 0,042.
5. **Enregistrer un échantillon de santé** : type Taux d'alcool dans le sang, valeur = résultat du calcul, unité %.
6. **Obtenir l'élément de la liste** (à partir de l'action Diviser) : dernier élément.
7. **Obtenir des nombres de l'entrée**.
8. **Enregistrer un échantillon de santé** : type Nombre de boissons alcoolisées, valeur = ce nombre.

## Points à vérifier à la première utilisation

- Les noms exacts des types de données et des unités peuvent varier selon la version d'iOS. Si un type est absent de la liste de l'action, signale-le dans le carnet de bord.
- Raccourcis demandera une autorisation d'accès à Santé la première fois.
- Si le retour automatique après la lecture n'arrive pas dans l'app, ouvre l'app et appuie sur « Coller ».
