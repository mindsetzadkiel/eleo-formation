# Technicien informatique IA-augmenté : diagnostic, maintenance PC/Mac et cybersécurité de base

> **Durée** : 35h · **Format** : HYBRIDE · **Prix** : 1750€ HT · **Statut** : PUBLIEE

## 📝 Description

Formation hybride complète pour devenir technicien informatique autonome, avec des outils IA en support. Diagnostic de pannes, maintenance PC et Mac, cybersécurité de base pour TPE/PME, et utilisation pratique de l'IA pour le travail technique quotidien. 80 % en ligne, 20 % en atelier à Aix-en-Provence.

## 🎯 Objectifs pédagogiques

- Maîtriser la méthode de diagnostic informatique structuré
- Réaliser la maintenance préventive et curative sur PC et Mac
- Appliquer les bonnes pratiques de cybersécurité en TPE/PME
- Utiliser l'IA comme outil d'aide au diagnostic et à la rédaction
- Réaliser un diagnostic réel en atelier sur des cas concrets
- Rédiger un rapport de diagnostic clair et professionnel

## 👥 Public cible

Salariés de TPE/PME, dirigeants de petites entreprises, indépendants, techniciens informatiques débutants déjà en poste, secrétaires ou assistants polyvalents devant gérer les problèmes informatiques simples, professionnels en reconversion avec budget personnel.

### Public NON cible

Apprentis, alternants, stagiaires, personnes cherchant une immersion gratuite, candidats spontanés non financés, personnes cherchant un emploi chez Eleo.

## 📋 Prérequis

Connaissances de base en informatique (utilisation quotidienne d'un PC ou Mac). Aucune compétence technique avancée requise.

## ⚙️ Modalités

- **Accès** : Sur inscription après validation du dossier. Demande de devis sur le site ou par contact direct.
- **Délais** : Inscription possible jusqu'à 15 jours avant le début de la session, sous réserve de places disponibles.
- **Accessibilité handicap** : Formation accessible aux personnes en situation de handicap. Nous contacter pour adapter les modalités pédagogiques.
- **Méthodes pédagogiques** : Modules en ligne (vidéo, texte, exercices), quiz interactifs, études de cas, atelier pratique en présentiel à Aix-en-Provence, cas clients anonymisés, utilisation d'outils IA.
- **Évaluation** : Quiz de validation par module, étude de cas finale, rapport de diagnostic, évaluation pratique en atelier, soutenance ou correction formateur.

---

# 📚 Programme détaillé

## Module 1 — Fondamentaux du diagnostic informatique

> ⏱️ 240 min · 4 leçons · 1 quiz

*Comprendre les symptômes, distinguer les types de pannes, méthode d'interrogatoire client, check-list diagnostic.*

Ce module couvre les bases du diagnostic informatique : identification des symptômes, distinction entre pannes matérielles, logicielles, système et réseau. Vous apprendrez la méthode d'interrogatoire client et utiliserez une check-list de diagnostic structurée.

### Leçon 1.1 — Comprendre les symptômes informatiques 📖 Théorie

## Introduction  
Dans une TPE, chaque minute d’indisponibilité coûte du temps et de l’argent. Savoir identifier rapidement **le symptôme** permet de choisir la bonne piste de diagnostic et d’éviter les allers‑retours inutiles avec le client. Cette leçon te donne les repères pour reconnaître et classer les signes les plus fréquents sur PC et Mac, afin de passer immédiatement à la phase d’analyse.

## Notions clés  

- **Symptôme** : manifestation observable du problème (ex. écran qui clignote, lenteur du démarrage). Ce n’est pas la cause, mais le point de départ du raisonnement.  
- **Catégories de pannes**  
  1. **Logicielle** – conflits d’applications, mises à jour manquantes, pilotes défectueux.  
  2. **Matérielle** – disque qui fait du bruit, surchauffe, barrettes RAM défectueuses.  
  3. **Réseau** – perte de connexion, latence élevée, DNS qui ne résout pas.  
- **Gravité** :  
  - *Mineur* : gêne mais le poste reste utilisable (ex. icône de batterie qui clignote).  
  - *Critique* : arrêt complet ou perte de données (ex. écran bleu, plantage du système).  
- **Cycle de vie du symptôme** :  
  1. Apparition → 2. Répétition → 3. Evolution (s’atténue, s’aggrave, disparaît).  
  Noter ce cycle aide à choisir les tests (stress test, monitoring, logs).  

## En pratique  

### 1. Lenteur générale  
**Exemple 1** – Une agence de communication signale que les postes Windows mettent 2 min à charger Office. En vérifiant le Gestionnaire des tâches, tu constates une utilisation CPU à 95 % due à `svchost.exe`. Après avoir désactivé les services de mise à jour Windows Update qui s’exécutent en arrière‑plan, la réactivité revient à la normale.  
**Piège** : ne pas confondre lenteur liée à un logiciel avec un problème de disque dur usé. Un test de vitesse (`winsat disk`) permet de trancher rapidement.

### 2. Écran bleu (BSOD) ou plantage du kernel sur Mac  
**Exemple 2** – Un petit cabinet d’avocats subit des « kernel panic » sur leurs MacBook. La console montre le message `watchdog timeout`. En ouvrant le Rapport de plantage (`Console > Diagnostic & Usage Reports`), on identifie un driver tierce partie (logiciel de sauvegarde). La désinstallation du driver résout le problème.  
**Piège** : ne pas ignorer les codes d’erreur affichés; ils pointent souvent vers un pilote ou un module matériel défectueux.

### 3. Bruits anormaux  
Un **bip** régulier du PC indique souvent une alarme de température ou de RAM. Sur un poste de comptabilité, le ventilateur tourne à plein régime et le boîtier émet un cliquetis métallique : c’est le disque dur qui commence à « click‑of‑death ». La sauvegarde immédiate des données et le remplacement du disque sont obligatoires.

### 4. Messages d’erreur récurrents  
Sur Windows, le code `0x80070057` apparaît lors de l’installation d’un logiciel. Sur macOS, le dialogue « Le disque ne peut pas être vérifié » signale un problème de système de fichiers. Dans les deux cas, la première action consiste à consulter les logs (`eventvwr.msc` ou `Console.app`) avant de passer à des solutions de contournement.

## À retenir  
- **Classer chaque symptôme** (logiciel, matériel, réseau) dès le premier constat.  
- **Noter le cycle** (apparition → répétition → évolution) pour orienter les tests.  
- **Lire les messages d’erreur et les logs** : ils donnent souvent le nom du composant fautif.  
- **Éviter les suppositions** : valider chaque hypothèse par un test simple (ex. swap de RAM, test de disque).  
- **Prioriser la gravité** : les pannes critiques nécessitent une résolution immédiate, les mineures peuvent être planifiées.

### Leçon 1.2 — Distinguer panne matérielle, logicielle, système et réseau 📖 Théorie

## Introduction  
Dans une petite structure, chaque minute d’arrêt coûte du temps de travail et de l’argent. Savoir **déterminer rapidement si la panne vient du matériel, du logiciel, du système d’exploitation ou du réseau** permet de proposer la bonne solution, d’éviter les allers‑retours inutiles et de gagner la confiance du client. Cette leçon te donne la méthode pour identifier la catégorie de la panne dès les premiers échanges.

## Notions clés  

| Catégorie | Signes typiques | Outils de repérage |
|-----------|----------------|-------------------|
| **Matérielle** | Bruits anormaux, surchauffe, périphériques qui ne s’allument pas, erreurs POST, écran noir. | Test de composants (`memtest86`, `HWMonitor`), swap de pièces, câbles de rechange. |
| **Logicielle** | Plantages d’une application précise, messages d’erreur « Application a cessé de répondre », lenteur après une mise à jour. | Journaux d’événements (`eventvwr.msc` sous Windows, Console sous macOS), réinstalle‑/mise à jour du programme. |
| **Système** (OS) | Redémarrages intempestifs, écran bleu (BSOD), impossibilité de se connecter, perte de pilotes. | `sfc /scannow`, `chkdsk`, mode sans échec, récupération macOS (`Recovery Mode`). |
| **Réseau** | Pas d’accès Internet, perte de connexion Wi‑Fi, lenteur globale, impossibilité de pinguer une ressource. | `ping`, `ipconfig /all`, `netstat -r`, test de câble, analyse de logs du routeur. |

### Le fil conducteur du diagnostic  
1. **Collecte d’informations** – questionner le client (symptôme, moment d’apparition, changements récents).  
2. **Isolation** – reproduire le problème avec le minimum d’éléments actifs.  
3. **Classification** – associer les signes observés à l’une des quatre catégories.  
4. **Vérification** – confirmer avec un test ciblé (ex. swap RAM pour suspecter une barrette défectueuse).  

## En pratique  

### Exemple 1 – Poste Windows qui ne démarre plus  
*Contexte* : Le comptable d’une PME signale « l’ordinateur reste bloqué sur le logo Windows ».  
- **Collecte** : Dernière mise à jour Windows installée hier, aucune modification matérielle.  
- **Isolation** : Démarrage en mode sans échec → le système charge.  
- **Classification** : Le problème vient du **système** (pilote vidéo corrompu).  
- **Vérification** : `sfc /scannow` puis désinstallation de la mise à jour incriminée.  
**Piège** : Ne pas confondre un écran noir (matériel) avec un blocage sur le logo (système).  

### Exemple 2 – Imprimante réseau qui ne répond plus  
*Contexte* : L’assistante signale que l’imprimante partagée depuis le serveur ne répond depuis deux heures.  
- **Collecte** : Aucun changement, mais le routeur a été redémarré hier.  
- **Isolation** : Test `ping 192.168.1.45` → réponses perdues.  
- **Classification** : **Réseau** – perte de liaison IP.  
- **Vérification** : Vérifier le câble Ethernet, la table ARP du serveur (`arp -a`), puis reconfigurer le DHCP du routeur.  
**Piège** : Ne pas chercher une panne d’imprimante alors que le problème est purement de connectivité.  

## À retenir  
- **Symptôme → catégorie** : bruit / surchauffe = matériel, plantage d’une appli = logiciel, blocage OS = système, perte de connexion = réseau.  
- **Méthode en 4 étapes** : collecte, isolation, classification, vérification.  
- **Utilise les outils natifs** (`eventvwr`, `sfc`, `ping`) avant de remplacer du matériel.  
- **Ne saute pas d’étape** : une mauvaise classification entraîne des pertes de temps et des coûts inutiles.  

Applique ce cadre à chaque appel et tu verras rapidement la différence entre deviner et diagnostiquer avec certitude.

### Leçon 1.3 — Méthode d'interrogatoire client 📖 Théorie

## Introduction  
Dans une petite entreprise, le technicien est souvent le premier interlocuteur quand un poste ne démarre plus ou qu’une appli plante. Un **interrogatoire client bien mené** permet de gagner du temps, d’éviter les allers‑retours et d’obtenir les informations nécessaires pour un diagnostic structuré. Sans ces données, tu risques de passer des heures à tester des hypothèses déjà exclues.  

## Notions clés  

- **Symptôme observable** : ce que le client voit ou ressent (ex. : écran noir, lenteur, messages d’erreur).  
- **Contexte d’utilisation** : type d’activité, logiciel principal, moment de la panne (avant, pendant ou après une action).  
- **Historique** : dernières interventions, mises à jour, changements de configuration, branchements récents.  
- **Environnement** : matériel (PC, Mac, périphériques), réseau (câblé, Wi‑Fi), version du système d’exploitation, politique de sécurité en place.  
- **Priorité** : impact sur l’activité (bloquant, critique, mineur).  

Ces notions forment la trame d’un **questionnaire structuré** que tu peux garder sur ton support de travail (tableau, formulaire Google, ou IA‑assistant).  

## En pratique  

### 1. Accueil et clarification du problème  
1. « Quel est exactement le problème que vous rencontrez ? »  
2. « Quand avez‑vous constaté la première fois ce dysfonctionnement ? »  
3. « Est‑ce que cela arrive à chaque fois ou de façon aléatoire ? »  

### 2. Contexte technique  
- **Matériel** : « Quel modèle de PC/Mac utilisez‑vous ? Y a‑t‑il des périphériques connectés (imprimante, clé USB) ? »  
- **Logiciel** : « Quel est le logiciel ou la tâche que vous étiez en train de faire ? Version du programme ? »  
- **Réseau** : « Travaillez‑vous en local ou sur le cloud ? Êtes‑vous connecté en Wi‑Fi ou câble ? »  

### 3. Historique et changements récents  
- « Avez‑vous installé une mise à jour Windows/macOS ou un nouveau programme récemment ? »  
- « Quel était le dernier geste avant que le problème survienne ? (changement de câble, redémarrage, impression, etc.) »  

### 4. Impact et priorité  
- « Quel est le niveau d’urgence pour vous ? Peut‑on continuer à travailler sur un autre poste ? »  

### Pièges courants  
- **Client vague** : ne répond que « Ça ne marche plus ». Re‑demande toujours le *quand* et le *comment*.  
- **Mélange de symptômes** : un client décrit plusieurs problèmes différents. Sépare chaque symptôme et note‑les séparément.  
- **Oublier les périphériques** : souvent la panne vient d’une clé USB ou d’une imprimante mal reconnue.  

### Exemple 1 – PME de comptabilité  
Le responsable signale « Le logiciel de compta plante dès l’ouverture du fichier du mois ». Tu demandes : version du logiciel, date de la dernière mise à jour, type de fichier, utilisation d’un disque réseau, et si d’autres utilisateurs rencontrent le même souci. Grâce à ces réponses, tu identifieras rapidement un problème de droits d’accès sur le partage réseau.  

### Exemple 2 – Atelier de menuiserie  
Un technicien indique « Mon MacBook ne détecte plus le scanner ». Tu confirmes le modèle du scanner, le câble utilisé, la version de macOS, et si le scanner fonctionnait après la dernière mise à jour du système. En constatant que le driver du scanner n’est plus compatible, tu proposes de télécharger le pilote du fabricant.  

## À retenir  
- Pose **qui, quoi, quand, comment, où** pour chaque symptôme.  
- Recueille toujours l’**historique des changements** (mise à jour, nouveau matériel).  
- Clarifie l’**impact métier** pour prioriser l’intervention.  
- Note chaque réponse dans un support partagé : cela alimente l’IA d’assistance et le rapport final.

### Leçon 1.4 — Check-list diagnostic 🔧 Exercice pratique

## Objectif de l'exercice  
À l’issue de cet exercice, tu seras capable de :

- Utiliser une check‑list de diagnostic structurée pour couvrir **tous les points clés** (matériel, logiciel, réseau, sécurité).  
- Adapter la check‑list à un **PC Windows** ou à un **Mac** selon le contexte client.  
- Identifier rapidement le type de panne (matériel, logique, configuration, virus) grâce à des questions ciblées.  
- Produire un premier rapport de diagnostic clair en suivant le même format que celui utilisé en atelier.

---

## Matériel / prérequis  

| Équipement | Version / spécifications |
|------------|---------------------------|
| Ordinateur client | PC Windows 10/11 **ou** Mac OS 13 (Ventura) |
| Câble Ethernet | RJ45, fonctionnel |
| Clé USB bootable | Windows PE ou macOS Recovery (optionnel) |
| Outil de monitoring | `HWMonitor` (Windows) / `iStat Menus` (Mac) |
| Antivirus local | Windows Defender ou Malwarebytes |
| Accès internet | Pour mettre à jour les pilotes et rechercher les codes d’erreur |
| Fiche de **check‑list** (voir annexe) | Imprimée ou en PDF sur tablette |

> **Pré‑requis** : avoir suivi le module « Méthode d’interrogatoire client » et connaître les bases des systèmes d’exploitation ciblés.

---

## Étapes détaillées  

1. **Accueil et recueil du symptôme**  
   - Pose les questions : *« Quand le problème est‑il apparu ? », « Quel était le dernier changement ? », *« Quel message d’erreur exact ? »*  
   - Note chaque réponse sur la première partie de la check‑list (« Symptômes »).  

2. **Vérification du matériel visible**  
   - Sous Windows, ouvre le **Gestionnaire de périphériques** (`devmgmt.msc`) et recherche les icônes jaunes.  
   - Sous macOS, lance **Informations Système** → *Matériel* → *PCI* et repère les périphériques non reconnus.  
   - Coche les cases correspondantes dans la section *Matériel* de la check‑list.  

3. **Test de l’alimentation et du refroidissement**  
   - Utilise `HWMonitor` ou `iStat Menus` pour relever les températures CPU/GPU et les tensions d’alimentation pendant 5 min d’activité (ex. lancer un benchmark léger).  
   - Si température > 85 °C ou tension instable, indique **« Surchauffe / alimentation défaillante »**.  

4. **Contrôle du disque et du système de fichiers**  
   - Windows : exécute `chkdsk C: /f /r` en invite admin.  
   - macOS : lance `diskutil verifyVolume /` puis `diskutil repairVolume /` si besoin.  
   - Note le résultat (erreurs réparées, disque sain, etc.).  

5. **Analyse des logs**  
   - Windows : ouvre l’**Observateur d’évènements** (`eventvwr.msc`) → *Journaux Windows* → *Système* et recherche les erreurs récentes.  
   - macOS : consulte le **Console** → *system.log*.  
   - Recopie les codes d’erreur pertinents dans la section *Logs* de la check‑list.  

6. **Vérification de la connectivité réseau**  
   - Ping `8.8.8.8` puis `google.com`.  
   - Sous macOS, utilise `networksetup -getinfo Ethernet` pour vérifier l’adresse IP.  
   - Si le ping échoue, coche **« Problème réseau »** et note la cause (câble, DHCP, DNS).  

7. **Scan anti‑malware**  
   - Lance un scan complet avec **Windows Defender** ou **Malwarebytes**.  
   - Si des menaces sont détectées, indique le type et le nom du fichier dans la case *Sécurité*.  

8. **Mise à jour des pilotes et du système**  
   - Windows : `gpupdate /force` puis `winget upgrade`.  
   - macOS : `softwareupdate -l && softwareupdate -i -a`.  
   - Coche **« Mises à jour appliquées »** si aucune mise à jour critique n’est disponible.  

9. **Test fonctionnel final**  
   - Reproduis le symptôme décrit par le client (ou le test de performance).  
   - Si le problème persiste, ajoute la mention **« Diagnostic incomplet »** et prépare la partie « Proposition d’intervention ».  

10. **Rédaction du rapport succinct**  
    - Remplis le modèle de rapport (annexe) en reprenant chaque rubrique de la check‑list, en indiquant **« OK »** ou **« KO »** et un commentaire bref.  
    - Envoie le rapport au client par mail et archive le PDF dans le dossier projet.  

---

## Critères de réussite  

- **Complétude** : chaque case de la check‑list (symptômes, matériel, logs, réseau, sécurité) est cochée et commentée.  
- **Exactitude des relevés** : captures d’écran ou copies d’erreurs (codes, températures) sont jointes au rapport.  
- **Diagnostic clair** : le rapport indique le type de panne (matériel, logiciel, configuration, malware) et propose une action concrète (ex. « Remplacer le disque SSD », « Réinstaller les pilotes réseau », « Nettoyage anti‑malware »).  
- **Temps** : l’ensemble de la procédure ne dépasse pas **45 minutes** sur un poste moyen (PC ou Mac).  

> **Exemple terrain 1** – Une PME rencontre des redémarrages intempestifs sur 5 postes Windows. En suivant la check‑list, tu constates une surchauffe CPU (88 °C) due à un ventilateur bloqué. Tu coches la case *Surchauffe* et proposes le nettoyage du ventilateur.  

> **Exemple terrain 2** – Un cabinet d’avocats utilise des Mac. Un collaborateur signale des lenteurs lors de l’ouverture des dossiers PDF. La check‑list révèle un disque fragmenté et un antivirus désactivé. Tu proposes une réparation du disque et la réactivation de l’antivirus.  

Lorsque ces critères sont remplis, l’exercice est considéré comme maîtrisé. Bonne chasse aux pannes !

### 📝 Quiz — Fondamentaux du diagnostic

**Q1. Quelle est la première étape d'un diagnostic informatique ?**
- a) Remplacer le disque dur
- b) Interroger le client sur les symptômes
- c) Réinstaller le système
- d) Vérifier la connexion internet
> ✅ Réponse : Interroger le client sur les symptômes  _(1 pt)_

**Q2. Un écran bleu (BSOD) indique généralement quel type de problème ?**
- a) Problème réseau
- b) Problème logiciel ou matériel grave
- c) Manque de stockage
- d) Virus
> ✅ Réponse : Problème logiciel ou matériel grave  _(1 pt)_

---

## Module 2 — Maintenance PC

> ⏱️ 300 min · 5 leçons · 1 quiz

*Lenteurs, stockage, RAM, température, alimentation, disque SSD/HDD, nettoyage logiciel, sauvegarde.*

Ce module couvre la maintenance préventive et curative des PC : diagnostic des lenteurs, gestion du stockage, RAM, températures, alimentation, remplacement de disques, nettoyage logiciel et stratégies de sauvegarde.

### Leçon 2.1 — Diagnostic et résolution des lenteurs 📖 Théorie

Identifier les causes de lenteur : processus, démarrage, RAM insuffisante, disque plein ou défaillant.

### Leçon 2.2 — Stockage : HDD vs SSD, migration 📖 Théorie

Comprendre les différences entre HDD et SSD. Procédure de clonage et migration.

### Leçon 2.3 — RAM : diagnostic et remplacement 📖 Théorie

Vérifier la RAM, identifier un problème, procédure de remplacement.

### Leçon 2.4 — Température et alimentation 📖 Théorie

Surveiller les températures, nettoyer les ventilateurs, vérifier l'alimentation.

### Leçon 2.5 — Nettoyage logiciel et sauvegarde 🔧 Exercice pratique

Outils de nettoyage, désinstallation propre, stratégie de sauvegarde 3-2-1.

### 📝 Quiz — Maintenance PC

**Q1. Quel est l'avantage principal d'un SSD par rapport à un HDD ?**
- a) Plus grande capacité
- b) Vitesse de lecture/écriture
- c) Moins cher
- d) Plus silencieux uniquement
> ✅ Réponse : Vitesse de lecture/écriture  _(1 pt)_

**Q2. La règle de sauvegarde 3-2-1 signifie :**
- a) 3 fichiers, 2 dossiers, 1 disque
- b) 3 copies, 2 supports différents, 1 copie hors site
- c) 3 jours, 2 semaines, 1 mois
- d) 3 utilisateurs, 2 mots de passe, 1 admin
> ✅ Réponse : 3 copies, 2 supports différents, 1 copie hors site  _(1 pt)_

---

## Module 3 — Maintenance Mac

> ⏱️ 180 min · 4 leçons · 1 quiz

*Bases macOS, stockage, sauvegarde Time Machine, lenteurs, précautions spécifiques.*

Ce module couvre les spécificités de la maintenance Mac : interface macOS, gestion du stockage, Time Machine, résolution des lenteurs et précautions spécifiques à l'écosystème Apple.

### Leçon 3.1 — Bases macOS pour technicien 📖 Théorie

Navigation dans macOS, utilitaires système, Terminal basique.

### Leçon 3.2 — Gestion du stockage Mac 📖 Théorie

Optimiser le stockage, purger les fichiers inutiles, gérer iCloud.

### Leçon 3.3 — Time Machine et sauvegarde 📖 Théorie

Configurer et vérifier Time Machine, restauration de fichiers.

### Leçon 3.4 — Lenteurs et précautions Mac 📖 Théorie

Diagnostic des lenteurs macOS, réinitialisation SMC/NVRAM, précautions de manipulation.

### 📝 Quiz — Maintenance Mac

**Q1. Quel outil natif de macOS permet la sauvegarde automatique ?**
- a) iCloud
- b) Time Machine
- c) Disk Utility
- d) Finder
> ✅ Réponse : Time Machine  _(1 pt)_

---

## Module 4 — Cybersécurité de base pour TPE

> ⏱️ 240 min · 5 leçons · 1 quiz

*Phishing, mots de passe, MFA, sauvegardes, mises à jour, ransomwares, bonnes pratiques client.*

Ce module couvre les fondamentaux de la cybersécurité pour les TPE/PME : reconnaître le phishing, gérer les mots de passe, activer la MFA, se protéger des ransomwares, et transmettre les bonnes pratiques aux clients.

### Leçon 4.1 — Reconnaître le phishing 📖 Théorie

Identifier les emails frauduleux, les liens suspects, les pièces jointes dangereuses.

### Leçon 4.2 — Mots de passe et MFA 📖 Théorie

Créer des mots de passe forts, utiliser un gestionnaire, activer l'authentification multi-facteurs.

### Leçon 4.3 — Mises à jour et sauvegardes 📖 Théorie

Importance des mises à jour système et logicielles. Stratégie de sauvegarde.

### Leçon 4.4 — Ransomwares et bonnes pratiques 📖 Théorie

Comprendre les ransomwares, comment s'en protéger, réagir en cas d'attaque.

### Leçon 4.5 — Former le client aux bonnes pratiques 🧩 Étude de cas

Comment sensibiliser un client non-technique aux enjeux de cybersécurité.

### 📝 Quiz — Cybersécurité

**Q1. Quel est le principal risque du phishing ?**
- a) Perte de données
- b) Vol d'identifiants
- c) Surchauffe du processeur
- d) Lenteur du réseau
> ✅ Réponse : Vol d'identifiants  _(1 pt)_

**Q2. MFA signifie :**
- a) Multi-Factor Authentication
- b) Maximum File Access
- c) Main Firewall Activation
- d) Managed Format Application
> ✅ Réponse : Multi-Factor Authentication  _(1 pt)_

---

## Module 5 — IA pratique pour technicien informatique

> ⏱️ 240 min · 5 leçons · 1 quiz

*Utiliser l'IA pour analyser un symptôme, rédiger un rapport, créer une procédure, limites et vérification humaine.*

Ce module couvre l'utilisation pratique de l'IA pour le travail de technicien : analyser un symptôme avec l'IA, rédiger un rapport client, créer une procédure, générer une check-list, et comprendre les limites de l'IA.

### Leçon 5.1 — Utiliser l'IA pour analyser un symptôme 📖 Théorie

Formuler un prompt efficace pour obtenir des pistes de diagnostic.

### Leçon 5.2 — Rédiger un rapport client avec l'IA 🔧 Exercice pratique

Utiliser l'IA pour structurer et rédiger un rapport de diagnostic clair.

### Leçon 5.3 — Créer une procédure avec l'IA 🔧 Exercice pratique

Générer des procédures techniques étape par étape.

### Leçon 5.4 — Expliquer une panne simplement 🔧 Exercice pratique

Utiliser l'IA pour reformuler un diagnostic technique en langage accessible.

### Leçon 5.5 — Limites de l'IA et vérification humaine 📖 Théorie

Comprendre quand l'IA peut se tromper. Toujours vérifier avant d'agir.

### 📝 Quiz — IA pratique

**Q1. Pourquoi faut-il toujours vérifier les réponses de l'IA ?**
- a) L'IA est toujours juste
- b) L'IA peut halluciner ou se tromper
- c) L'IA ne comprend pas le français
- d) Ce n'est pas nécessaire
> ✅ Réponse : L'IA peut halluciner ou se tromper  _(1 pt)_

---

## Module 6 — Atelier pratique Eleo

> ⏱️ 420 min · 5 leçons · 0 quiz

*Démontage simple, remplacement SSD/RAM, nettoyage, diagnostic réel, cas clients anonymisés, procédure de restitution.*

Atelier présentiel à l'atelier Eleo à Aix-en-Provence. Démontage et remontage de PC, remplacement de composants (SSD, RAM), nettoyage physique, diagnostic sur des cas réels anonymisés, procédure de restitution au client.

### Leçon 6.1 — Démontage et remontage simple 🔧 Exercice pratique

Procédure de démontage sécurisé d'un PC tour et portable.

### Leçon 6.2 — Remplacement SSD et RAM 🔧 Exercice pratique

Remplacement pratique de composants avec les bons gestes.

### Leçon 6.3 — Nettoyage physique 🔧 Exercice pratique

Nettoyage interne avec bombe à air, remplacement pâte thermique.

### Leçon 6.4 — Diagnostic réel sur cas clients 🧩 Étude de cas

Diagnostic complet sur des machines réelles avec cas anonymisés.

### Leçon 6.5 — Procédure de restitution 🔧 Exercice pratique

Préparer la machine pour la restitution au client : tests, documentation.

---

## Module 7 — Évaluation finale

> ⏱️ 180 min · 4 leçons · 1 quiz

*Quiz final, étude de cas, rapport de diagnostic, soutenance ou correction formateur, attestation.*

Module d'évaluation finale : quiz récapitulatif, étude de cas complète, rédaction d'un rapport de diagnostic, soutenance ou correction par le formateur. Délivrance de l'attestation de fin de formation.

### Leçon 7.1 — Quiz récapitulatif 🔧 Exercice pratique

Quiz couvrant l'ensemble des modules de la formation.

### Leçon 7.2 — Étude de cas finale 🧩 Étude de cas

Cas complet à résoudre : diagnostic, plan d'action, chiffrage, communication client.

### Leçon 7.3 — Rapport de diagnostic 🔧 Exercice pratique

Rédaction d'un rapport de diagnostic professionnel complet.

### Leçon 7.4 — Soutenance et attestation 📖 Théorie

Présentation du travail au formateur. Délivrance de l'attestation.

### 📝 Évaluation finale

**Q1. Citez les 4 types de pannes informatiques principaux.**
> ✅ Réponse : Matérielle, logicielle, système, réseau  _(1 pt)_

**Q2. Quel est le premier réflexe face à un ransomware ?**
- a) Payer la rançon
- b) Déconnecter la machine du réseau
- c) Éteindre et rallumer
- d) Ignorer le message
> ✅ Réponse : Déconnecter la machine du réseau  _(1 pt)_

---
