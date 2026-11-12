# Cadence — emploi du temps par blocs

Cadence est une application web personnelle et autonome pour organiser son temps en **blocs** sur une grille horaire. Elle fonctionne comme une **PWA** installable et conserve les données du planning et des notes localement dans le navigateur.

> [!TIP]
>
> *Lien vers l'application* : https://may8326.github.io/Cadence/

---

<details>

<summary>

<b>Table des matières</b>

</summary>

* [Version stable](#version-stable--20)

  * [Fonctionnalités](#fonctionnalités)
* [Utilisation](#utilisation)

  * [Modifier le planning](#modifier-le-planning)
  * [Journées et demi-journées types](#journées-et-demi-journées-types)
  * [Notes](#notes)
  * [Sauvegarde des données](#sauvegarde-des-données)

  * [Synchronisation Google Drive](#synchronisation-google-drive)
  * [Tutoriel](#tutoriel)
* [Todoist](#todoist)
* [Google Calendar](#google-calendar)
* [Installation](#installation)

  * [Android](#android)
  * [Ordinateur](#ordinateur)
* [Accessibilité](#accessibilité)
* [Aspects techniques](#aspects-techniques)
* [Structure](#structure)
* [Historique récent](#historique-récent)

</details>

---

## Version stable — 2.0

La V2.0 constitue une nouvelle version fonctionnelle de Cadence avec l'ajout d'un espace **Notes**, en complément du planning, de Todoist et de Google Calendar.

### Fonctionnalités

* **Planning** : vues Semaine et Jour, navigation par date, grille de 6 h à 23 h et indicateur de l'heure actuelle.

* **Blocs** : création, déplacement, redimensionnement, modification, suppression, couleur et étiquette.

* **Blocs enregistrés** : activités réutilisables et réorganisation par glisser-déposer.

* **Journées types** : modèles de journée complète applicables à un jour.

* **Demi-journées types** : modèles sur une plage horaire, applicables à un jour.

* **Notes** : création et modification de notes personnelles en **Markdown**, avec sauvegarde automatique dans les données locales de Cadence, suppression avec possibilité d'annuler pendant quelques secondes, et **aperçu** de la note mise en forme.

* **Archivage des notes** : les notes peuvent être archivées lorsqu'elles ne sont plus actives. Les notes archivées sont conservées et retrouvées par **date d'archivage**.

* **Impression / PDF** : impression de la vue affichée.

* **Données** : export et import JSON, incluant le planning, les modèles, les blocs enregistrés et les notes, avec validation et sauvegarde de secours locale.

* **Synchronisation Google Drive** : bouton « Synchroniser » pour retrouver ses données sur plusieurs appareils, la version la plus récente étant conservée.

* **Todoist** : consultation des tâches en lecture seule via OAuth 2.0 + PKCE.

* **Google Calendar** : consultation de plusieurs agendas, en vue Jour ou Semaine, avec couleurs, chevauchements et indicateur de l'heure actuelle.

* **Tutoriel interactif** : visite guidée pas à pas avec mise en évidence des éléments de l'interface, navigation Précédent / Suivant et adaptation à Android ou ordinateur.

* **PWA / Android** : installation sur l'écran d'accueil et fonctionnement hors connexion après mise en cache. En ligne, l'application récupère toujours la dernière version publiée ; la copie en cache ne sert que hors connexion.

## Utilisation

### Modifier le planning

Le planning est en lecture seule par défaut. Activez **Modifier** pour effectuer les opérations d'édition.

* Cliquez-glissez sur la grille pour créer un bloc.

* Touchez ou cliquez sur un bloc pour l'ouvrir en édition.

* Faites glisser un bloc pour le déplacer.

* Utilisez sa poignée basse pour le redimensionner.

* Les blocs peuvent être enregistrés pour être replacés ultérieurement.

### Journées et demi-journées types

Les modèles sont accessibles dans le menu latéral de l'espace **Cadence**.

* Une **journée type** contient une organisation complète de la journée.

* Une **demi-journée type** correspond à une plage horaire définie.

* Les modèles peuvent être appliqués depuis les commandes prévues dans les en-têtes des journées.

### Notes

L'espace **Notes** permet de conserver des notes courtes directement dans Cadence.

Chaque note possède :

* un titre ;
* un contenu rédigé en **Markdown** ;
* une date de création ;
* une date de modification ;
* éventuellement une date d'archivage.

Les notes actives sont accessibles dans l'espace **Notes** et peuvent être créées avec **+ Nouvelle**.

Les boutons **Écrire** et **Aperçu** alternent entre la saisie et la note mise en forme. L'aperçu prend en charge les titres, le gras, l'italique, le barré, le code, les listes (à puces, numérotées, imbriquées, à cocher), les citations, les tableaux, les liens (`http`, `https`, `mailto`) et les séparateurs. Le HTML saisi dans une note n'est jamais interprété.

La rédaction est sauvegardée automatiquement. Une note peut être **archivée** lorsqu'elle n'a plus besoin d'apparaître dans la liste active.

Les notes archivées restent accessibles dans l'espace Notes et sont regroupées par **date d'archivage**. Elles peuvent être désarchivées pour redevenir actives.

Une note peut aussi être **supprimée**. Un bouton **Annuler** reste affiché pendant quelques secondes ; ensuite, la suppression est définitive.

### Sauvegarde des données

Les données du planning et les notes sont conservées **localement dans le navigateur**. Cadence ne possède pas de compte utilisateur ni de base de données distante. La [synchronisation Google Drive](#synchronisation-google-drive), facultative, permet de retrouver ces données sur d'autres appareils.

Pour sauvegarder ou transférer les données :

1. Activez le mode **Modifier** si nécessaire.

2. Utilisez **Exporter** pour obtenir un fichier JSON.

3. Conservez ce fichier dans un emplacement de sauvegarde de votre choix.

4. Sur un autre appareil, utilisez **Importer** pour restaurer les données.

L'export contient notamment :

* les blocs du planning ;
* les blocs enregistrés ;
* les journées types ;
* les demi-journées types ;
* les notes actives et archivées.

L'importation remplace les données actuelles après confirmation. Les anciens exports Cadence restent pris en charge par le système d'importation.

### Synchronisation Google Drive

La synchronisation est facultative et se commande depuis **Paramétrages → Synchronisation Google Drive**, avec le bouton **Synchroniser**.

* Cadence enregistre un fichier `cadence-sync.json` dans l'espace privé de l'application sur votre Google Drive. Ce fichier n'apparaît pas dans vos dossiers Drive et n'est lisible que par Cadence (droit `drive.appdata`).

* À chaque synchronisation, la date de dernière modification locale est comparée à celle du fichier Drive : la version **la plus récente** est conservée.

* Avant qu'une version Drive ne remplace les données locales, une copie des données locales est conservée dans le navigateur.

* Les connexions Todoist et Google Calendar ne sont pas synchronisées.

Pour éviter de perdre des modifications, synchronisez avant et après une session de travail. Si deux appareils sont modifiés sans synchronisation intermédiaire, les changements de la version la plus ancienne sont perdus.

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

* application statique : `index.html`, `manifest.json`, `sw.js`, `icon.svg` ;

* intégrations séparées dans `integrations/` ;

* aucune dépendance npm ni étape de build ;

* données du planning et des notes stockées dans `localStorage` ;

* sauvegarde de secours locale des données Cadence ;

* service worker pour le fonctionnement hors connexion (stratégie « réseau d'abord » pour les fichiers de Cadence ; les requêtes vers Google et Todoist ne sont jamais mises en cache) ;

* synchronisation facultative via l'API Google Drive (espace privé `appDataFolder`) ;

* hébergement via GitHub Pages.

## Structure

```text
Cadence/

├── index.html

├── manifest.json

├── sw.js

├── markdown.js

├── icon.svg

├── LICENSE

├── README.md

└── integrations/

    ├── todoist.js

    ├── todoist-client.json

    ├── google-calendar.js

    └── drive-sync.js
```

## Historique récent

* **V1.12** : ergonomie Android, menu Cadence animé, grille Semaine en trois colonnes et zoom mobile.

* **V1.13** : visite guidée interactive.

* **V1.14** : amélioration de la mise en évidence des cibles du tutoriel et simplification de l'en-tête des espaces.

* **V1.15** : renforcement de la sauvegarde locale, de l'import/export et de la robustesse de l'intégration Todoist.

* **V1.16** : stabilisation et documentation de la version de référence.

* **V1.17** : ajout de l'espace **Notes**, avec rédaction en Markdown, sauvegarde automatique, archivage et intégration aux données exportées.

* **V2.0** : nouvelle version stable intégrant l'espace Notes dans la navigation principale de Cadence et finalisant son intégration au système de données et au tutoriel.

* **V2.1** : synchronisation facultative avec Google Drive, suppression des notes avec annulation, aperçu Markdown des notes, enregistrement des notes fiabilisé, tutoriel interactif réécrit et textes mis à jour.
