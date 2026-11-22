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

## 2. « Alcoolemie Ecrire » (verres et courbe d'alcoolémie vers Santé)

Cet envoi se fait **à la clôture de la soirée** : dans l'app, « Nouvelle soirée » > « Envoyer dans Santé et clôturer ». Un envoi unique contient tous les verres et toute la courbe du taux.

### Ce que reçoit le raccourci

Un texte de plusieurs lignes, de deux sortes :

```
V;120;2      un verre : pris il y a 120 minutes, 2 boissons
T;120;0      un point de taux : il y a 120 minutes, 0 mg/L
T;105;85     un point de taux : il y a 105 minutes, 85 mg/L (0,085 g/L)
```

- `V` = verre (type « Nombre de boissons alcoolisées »), `T` = taux (type « Taux d'alcool dans le sang »).
- Un verre est enregistré à son heure réelle. Le taux est donné toutes les 15 minutes, du premier verre jusqu'à maintenant (ou jusqu'au retour à 0 si c'est déjà passé).
- L'heure est donnée en **minutes avant maintenant** : le raccourci soustrait ce nombre à la date actuelle, il n'y a donc aucun format de date à interpréter.
- Le taux est un entier en mg/L (0,42 g/L = 420), à diviser par 10000 pour obtenir le pourcentage attendu par Santé (0,042 %).

### Les actions, dans l'ordre

1. **Diviser le texte** : entrée du raccourci, séparateur **Nouvelles lignes**.
2. **Répéter avec chaque élément** : sur le résultat de l'étape 1. Tout ce qui suit est **à l'intérieur** de la boucle.
3. **Diviser le texte** : « Élément du répéter », séparateur **Personnalisé** `;`.
4. **Obtenir l'élément de la liste** : **Premier élément** de l'étape 3, puis **Définir la variable** `Type`.
5. **Obtenir l'élément de la liste** : **Élément à l'index** 2 de l'étape 3, puis **Obtenir des nombres de l'entrée**, puis **Définir la variable** `Minutes`.
6. **Obtenir l'élément de la liste** : **Dernier élément** de l'étape 3, puis **Obtenir des nombres de l'entrée**, puis **Définir la variable** `Valeur`.
7. **Date** : Date actuelle, puis **Ajuster la date** : **Soustraire** la variable `Minutes`, en **minutes**, puis **Définir la variable** `Quand`.
8. **Si** `Type` **est** `T` :
   1. **Calculer** : `Valeur` ÷ 10000.
   2. **Enregistrer un échantillon de santé** : type **Taux d'alcool dans le sang**, valeur = résultat du calcul, unité **%**, **date** = `Quand`.
9. **Sinon** :
   1. **Enregistrer un échantillon de santé** : type **Nombre de boissons alcoolisées**, valeur = `Valeur`, **date** = `Quand`.
10. **Fin Si**, puis **Fin Répéter**.

Remarques :

- Le champ « Type » de « Enregistrer un échantillon de santé » n'accepte pas de variable : c'est pour cela que deux actions distinctes sont placées dans le Si / Sinon.
- Si le champ **date** n'est pas visible dans l'action, touche la flèche pour afficher plus d'options.
- Si tu as déjà l'ancien raccourci (`mg/L;verres`), supprime toutes ses actions avant de refaire celles-ci : l'ancien format n'est plus envoyé.
- « Nombre de boissons alcoolisées » compte les boissons **telles que tu les ajoutes dans l'app** (la quantité de chaque ligne), pas des verres standard de 10 g.

### Limite à connaître

Seul le passé est écrit, parce qu'un point déjà écrit dans Santé ne peut plus être corrigé depuis Raccourcis. Si tu clôtures avant le retour à 0, l'app te prévient : la suite de la courbe est perdue. Un verre ajouté après coup avec une heure déjà passée n'est pas rattrapé non plus si la soirée a déjà été envoyée.

### Premier test conseillé

1. Ajoute un seul verre avec une heure ancienne (par exemple il y a 6 h), puis « Nouvelle soirée » > « Envoyer dans Santé et clôturer ».
2. Dans Santé > Parcourir > Signes vitaux (ou Autres données), ouvre « Taux d'alcool dans le sang » et « Nombre de boissons alcoolisées » : les points doivent être à l'heure du verre, puis toutes les 15 minutes.
3. Si l'envoi échoue, le bouton « Envoyer la dernière soirée » (menu Apple Santé de l'app) le relance. Efface ensuite les points de test dans Santé.

## Points à vérifier à la première utilisation

- Les noms exacts des types de données et des unités peuvent varier selon la version d'iOS. Si un type est absent de la liste de l'action, signale-le dans le carnet de bord.
- Raccourcis demandera une autorisation d'accès à Santé la première fois.
- Si le retour automatique après la lecture n'arrive pas dans l'app, ouvre l'app et appuie sur « Coller ».
