# 🗓️ Cadence — emploi du temps par blocs

> Application web personnelle et autonome pour organiser son temps en **blocs** posés sur une grille horaire. Un seul fichier HTML/CSS/JS, sans compte ni serveur : tout reste sur l'appareil.

**🔗 Application en ligne :** [may8326.github.io/Cadence](https://may8326.github.io/Cadence/)

---

## ✨ Fonctionnalités

| | |
|---|---|
| 🗓️ **Vues Semaine et Jour** | Grille horaire de 6h à 23h, avec indicateur de l'heure actuelle |
| 📋 **Journées type** | Modèles de journée complète, applicables à n'importe quel jour en un clic |
| 🌗 **Demi-journées types** | Modèles sur une plage horaire, avec troncature automatique des blocs qui chevauchent |
| 🧩 **Blocs personnalisables** | Titre, horaires, couleur, étiquette ; création par glisser sur la grille |
| ⭐ **Blocs enregistrés** | Activités récurrentes à replacer en un clic, réorganisables par glisser-déposer |
| 🖨️ **Impression / PDF** | Export de la vue affichée au format paysage |
| 🔄 **Export / import JSON** | Sauvegarde manuelle et synchronisation entre appareils |
| 📲 **PWA installable** | Fonctionne hors connexion une fois installée |
| 🧭 **Espaces Tâches / Agenda / Plus** | Navigation préparée pour les futures intégrations Todoist et Google Calendar |

---

### V1.0 — première étape des intégrations

Cette version ajoute la navigation entre quatre espaces : **Cadence**, **Tâches**, **Agenda** et **Plus**. Les boutons de ces espaces sont visuellement distincts des boutons de vue du planning (**Semaine**, **Jour**, **Journées**, **½ journées**). Sur Android, la navigation entre espaces est fixée en bas de l’écran afin de ne pas recouvrir le menu ni le planning. Les vues Tâches et Agenda sont des espaces préparatoires : aucune connexion à Todoist ou Google Calendar n'est encore effectuée. Le planning existant, ses données locales et son fonctionnement hors connexion restent inchangés.

---

## 🧭 Mode d'emploi

<details>
<summary><strong>Créer et modifier un bloc</strong></summary>

- Cliquez-glissez sur la grille pour créer un bloc sur la plage voulue (un simple clic crée un bloc de 60 minutes par défaut).
- Renseignez titre, horaires, couleur et étiquette, puis validez. Cochez « Enregistrer comme bloc réutilisable » pour le retrouver dans les blocs enregistrés.
- Glissez un bloc existant pour le déplacer, ou sa poignée basse pour le redimensionner.
- Touchez un bloc sans le déplacer pour l'ouvrir en édition (modification ou suppression).

</details>

<details>
<summary><strong>Journées type</strong></summary>

- Depuis le menu latéral (« Journées type »), créez un modèle de journée en y plaçant des blocs.
- Appliquez-le à un jour via le menu déroulant en haut de chaque colonne, en vue Semaine ou Jour.
- L'onglet « Journées » affiche tous les modèles côte à côte.

</details>

<details>
<summary><strong>Demi-journées types</strong></summary>

- Créez un modèle sur une plage horaire donnée (« Demi-journées types »).
- Ajoutez-le à un jour via le bouton **+** dans l'en-tête de sa colonne, puis ajustez la plage d'application si besoin.
- L'onglet « ½ journées » permet de les consulter et de les modifier.

</details>

<details>
<summary><strong>Blocs enregistrés</strong></summary>

- Enregistrez une activité récurrente (titre, couleur, étiquette, durée par défaut) depuis « Blocs enregistrés ».
- Touchez le bloc dans la liste pour l'« armer », puis touchez la grille pour le placer.
- Glissez-déposez les blocs pour les réorganiser au sein d'une même étiquette.

</details>

<details>
<summary><strong>Sauvegarde et synchronisation entre appareils</strong></summary>

Les données sont stockées **localement** dans le navigateur, sans compte ni serveur.

1. **Exporter** télécharge un fichier JSON des données.
2. Placez ce fichier dans un dossier synchronisé (Google Drive, OneDrive, Dropbox…).
3. Sur l'autre appareil, **Importer** charge ce fichier (les données actuelles sont remplacées, après confirmation).

> [!TIP]
> Un bandeau de rappel s'affiche après toute modification, pour ne pas oublier d'exporter.

</details>

<details>
<summary><strong>Impression</strong></summary>

Le bouton **Imprimer / PDF** imprime, ou enregistre en PDF, la vue actuellement affichée.

</details>

Une aide intégrée est aussi disponible dans l'application via le bouton **?** en haut à gauche.

---

## 📲 Installation

### Sur Android (Chrome)
1. Ouvrez [may8326.github.io/Cadence](https://may8326.github.io/Cadence/) dans Chrome.
2. Menu **⋮** → **Installer l'application** (ou via la bannière proposée automatiquement).
3. Cadence s'ouvre comme une application autonome, sans barre d'adresse, utilisable hors connexion.

### Sur ordinateur (Chrome / Edge)
1. Ouvrez le lien ci-dessus.
2. Cliquez sur l'icône d'installation dans la barre d'adresse (ou menu **⋮** → **Installer Cadence**).

### Sans installation
L'application fonctionne aussi telle quelle : ouvrez simplement le lien dans un navigateur récent, rien n'est requis côté serveur.

---

## 🛠️ Aspects techniques

- Application entièrement statique : `index.html` (HTML/CSS/JS), `manifest.json`, `sw.js` (service worker) et `icon.svg`.
- Aucune dépendance, aucun build, aucun serveur ni base de données : toute la logique s'exécute dans le navigateur.
- Données persistées via `localStorage` ; le service worker met en cache les fichiers de l'application pour l'usage hors connexion.
- Hébergée gratuitement via GitHub Pages.

## Intégration Todoist — V1.0

La V1.0 ajoute le premier connecteur Todoist, sans dépendance externe ni installation locale.

- OAuth 2.0 Authorization Code + PKCE, avec client public hébergé sur GitHub Pages ;
- portée demandée : `data:read` uniquement ;
- les jetons sont conservés localement dans le navigateur ;
- les tâches sont récupérées depuis l'API Todoist v1 et filtrables par aujourd'hui, 7 jours, sans échéance ou toutes ;
- Cadence ne modifie ni ne supprime les tâches dans cette première intégration.


## Intégration Google Calendar — V1.3

La V1.3 ajoute l'affichage en lecture seule de l'agenda Google principal.

- authentification Google Identity Services directement dans le navigateur ;
- portée demandée : `https://www.googleapis.com/auth/calendar.events.readonly` ;
- aucun secret client, serveur, base de données ou dépendance locale ;
- affichage des événements sur une semaine, avec navigation et retour à aujourd'hui ;
- les événements ouvrent leur fiche Google Calendar lorsqu'un lien est fourni ;
- aucun événement n'est créé, modifié ou supprimé par Cadence.

Le Client ID OAuth est configuré dans `integrations/google-calendar.js`. L'origine JavaScript autorisée dans Google Cloud doit être `https://may8326.github.io`.


### Agenda Google – planning
La vue Agenda propose une vue Jour (par défaut) ou Semaine, avec plusieurs agendas Google, gestion visuelle des chevauchements et indicateur de l’heure actuelle.


### V1.7 — optimisation Android et paramétrages
- navigation principale avec icônes SVG de style Lucide ;
- suppression du bouton « ? » du bandeau supérieur : l’aide est centralisée dans Paramétrages ;
- vue Google Calendar « Jour » adaptable à la largeur de l’écran ;
- zoom/dézoom de la vue « Semaine » ;
- espace « Paramétrages » pour les connexions, données, aide et informations ;
- tutoriel mis à jour pour Android, Todoist et Google Calendar.


## V1.12 — ergonomie Android

- menu latéral Cadence sous le bouton de menu, avec ouverture/fermeture animée ;
- vue Semaine Cadence en grille 3 colonnes sur téléphone ;
- zoom de la vue Semaine Cadence conservé avec boutons et pincement ;
- navigation mobile adaptée au petit écran.
