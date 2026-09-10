# Cadence — emploi du temps par blocs

Cadence est une application web personnelle et autonome pour organiser son temps en **blocs** sur une grille horaire. Elle fonctionne comme une **PWA** installable et conserve les données du planning localement dans le navigateur.

**Application :** https://may8326.github.io/Cadence/

## Version stable — 1.16

La V1.16 constitue une version de stabilisation et de documentation après les développements des intégrations Todoist et Google Calendar et les adaptations Android.

### Fonctionnalités

- **Planning** : vues Semaine et Jour, navigation par date, grille de 6 h à 23 h et indicateur de l'heure actuelle.
- **Blocs** : création, déplacement, redimensionnement, modification, suppression, couleur et étiquette.
- **Blocs enregistrés** : activités réutilisables et réorganisation par glisser-déposer.
- **Journées types** : modèles de journée complète applicables à un jour.
- **Demi-journées types** : modèles sur une plage horaire, applicables à un jour.
- **Impression / PDF** : impression de la vue affichée.
- **Données** : export et import JSON, avec validation et sauvegarde de secours locale.
- **Todoist** : consultation des tâches en lecture seule via OAuth 2.0 + PKCE.
- **Google Calendar** : consultation de plusieurs agendas, en vue Jour ou Semaine, avec couleurs, chevauchements et indicateur de l'heure actuelle.
- **Tutoriel interactif** : visite guidée pas à pas avec mise en évidence des éléments de l'interface, navigation Précédent / Suivant et adaptation à Android ou ordinateur.
- **PWA / Android** : installation sur l'écran d'accueil et fonctionnement hors connexion après mise en cache.

## Utilisation

### Modifier le planning

Le planning est en lecture seule par défaut. Activez **Modifier** pour effectuer les opérations d'édition.

- Cliquez-glissez sur la grille pour créer un bloc.
- Touchez ou cliquez sur un bloc pour l'ouvrir en édition.
- Faites glisser un bloc pour le déplacer.
- Utilisez sa poignée basse pour le redimensionner.
- Les blocs peuvent être enregistrés pour être replacés ultérieurement.

### Journées et demi-journées types

Les modèles sont accessibles dans le menu latéral de l'espace **Cadence**.

- Une **journée type** contient une organisation complète de la journée.
- Une **demi-journée type** correspond à une plage horaire définie.
- Les modèles peuvent être appliqués depuis les commandes prévues dans les en-têtes des journées.

### Sauvegarde des données

Les données du planning sont conservées **localement dans le navigateur**. Cadence ne possède pas de compte utilisateur ni de base de données distante pour le planning.

Pour sauvegarder ou transférer un planning :

1. Activez le mode **Modifier** si nécessaire.
2. Utilisez **Exporter** pour obtenir un fichier JSON.
3. Conservez ce fichier dans un emplacement de sauvegarde de votre choix.
4. Sur un autre appareil, utilisez **Importer** pour restaurer le fichier.

L'importation remplace les données actuelles après confirmation. Les anciens exports Cadence restent pris en charge par le système d'importation.

### Tutoriel

Le bouton **?** ouvre la visite guidée interactive. Chaque étape met en évidence l'espace ou le bouton concerné et explique son utilisation. Les boutons **Précédent**, **Suivant** et **Quitter** permettent de parcourir ou d'interrompre la visite.

La visite est proposée automatiquement lors de la première utilisation et peut ensuite être relancée depuis l'aide.

## Todoist

La connexion Todoist utilise OAuth 2.0 avec PKCE et demande uniquement la portée de lecture `data:read`.

Cadence peut consulter les tâches actives et les présenter selon plusieurs filtres. Les tâches ne sont ni créées, ni modifiées, ni supprimées par Cadence.

La connexion et la déconnexion se gèrent dans **Paramétrages → Todoist**.

## Google Calendar

La connexion Google Calendar utilise Google Identity Services directement dans le navigateur.

Cadence demande les accès en lecture nécessaires à l'affichage des événements et des calendriers. Plusieurs calendriers peuvent être sélectionnés et leurs couleurs sont reprises dans l'affichage.

Les événements ne sont ni créés, ni modifiés, ni supprimés par Cadence.

La connexion et la sélection des calendriers se gèrent dans **Paramétrages → Google Calendar**.

## Installation

### Android

1. Ouvrez l'application dans Chrome : https://may8326.github.io/Cadence/
2. Utilisez **Installer l'application** depuis le menu du navigateur lorsque l'option est proposée.
3. Cadence peut ensuite être lancé depuis l'écran d'accueil comme une application autonome.

### Ordinateur

Cadence peut être utilisée directement dans un navigateur récent ou installée comme application lorsque le navigateur propose l'installation de la PWA.

## Accessibilité

Cadence utilise des boutons et contrôles natifs, des libellés accessibles pour les principales commandes et un tutoriel qui fournit une explication textuelle des éléments de l'interface.

Les améliorations d'accessibilité sont traitées au fil des évolutions de l'application, notamment pour les commandes uniquement représentées par une icône et pour la navigation au clavier.

## Aspects techniques

- application statique : `index.html`, `manifest.json`, `sw.js`, `icon.svg` ;
- intégrations séparées dans `integrations/` ;
- aucune dépendance npm ni étape de build ;
- données du planning stockées dans `localStorage` ;
- sauvegarde de secours locale des données Cadence ;
- service worker pour le fonctionnement hors connexion ;
- hébergement via GitHub Pages.

## Structure

```text
Cadence/
├── index.html
├── manifest.json
├── sw.js
├── icon.svg
├── LICENSE
├── README.md
└── integrations/
    ├── todoist.js
    ├── todoist-client.json
    └── google-calendar.js
```

## Historique récent

- **V1.12** : ergonomie Android, menu Cadence animé, grille Semaine en trois colonnes et zoom mobile.
- **V1.13** : visite guidée interactive.
- **V1.14** : amélioration de la mise en évidence des cibles du tutoriel et simplification de l'en-tête des espaces.
- **V1.15** : renforcement de la sauvegarde locale, de l'import/export et de la robustesse de l'intégration Todoist.
- **V1.16** : stabilisation et documentation de la version de référence.
