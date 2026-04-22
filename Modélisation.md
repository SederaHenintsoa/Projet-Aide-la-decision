# Thème :  " COVID-19 "

=> Qui se concentre sur un cadre "Aide au Diagnostic et Évaluation du Risque".

## Objectif 

> L'objectif est de créer un modèle qui évalue la probabilité qu'une personne soit infectée et, si oui, la probabilité qu'elle développe une forme grave.


### Etapes et démarche

Étape 1 : Définition des Variables et de la Structure (Le Graphe)
Nous allons structurer le graphe autour de quatre types de variables (nœuds). Toutes ces variables seront booléennes (Oui/Non ou Vrai/Faux) pour simplifier les premiers calculs.

Voici les variables que nous considérons :

Variables d'Exposition (Causes potentielles) :

Contact_Proche (CP) : La personne a-t-elle été en contact prolongé avec un cas confirmé ?

Zone_Cluster (ZC) : La personne vit-elle ou revient-elle d'une zone à forte circulation du virus ?

Variable de Diagnostic (Le cœur du modèle) :
3.  Infection_COVID (IC) : La personne est-elle réellement infectée par le SRAS-CoV-2 ? (C'est souvent la variable que l'on cherche à inférer).

Variables de Symptômes (Conséquences directes de l'infection) :
4.  Fievre (F) : Température corporelle élevée (>38°C).
5.  Anosmie_Ageusie (AA) : Perte de l'odorat ou du goût (symptôme très spécifique).
6.  Toux (T) : Toux sèche persistante.

Variables de Comorbidité et de Gravité (Facteurs aggravants) :
7.  Comorbidite (CO) : La personne a-t-elle des antécédents (diabète, hypertension, obésité) ?
8.  Forme_Grave (FG) : La personne risque-t-elle de nécessiter une hospitalisation ?

La Structure du Graphe (Relations de dépendance) :

L'Infection est causée par le Contact_Proche et la Zone_Cluster.

Les Symptômes (Fièvre, Anosmie, Toux) sont causés par l'Infection.

La Forme_Grave est causée par l'Infection ET la présence de Comorbidité.

Étape 2 : Visualisation du Graphe BayésienVoici la représentation graphique de notre structure modélisée.Analyse de l'Image : Ce graphe  montre clairement comment l'information circule. Les causes (Orange) influencent le Diagnostic (Rouge), qui à son tour influence les Conséquences (Bleu). Le risque de Gravité (Vert) dépend à la fois du Diagnostic et d'une condition préexistante. C’est la structure que nous allons utiliser pour les calculs.Étape 3 : Le Cœur Mathématique : Les Calculs SuccessifsC'est ici que ton application prendra vie. Le principe est de partir d'une probabilité de base (a priori) et de la mettre à jour à chaque fois qu'une nouvelle information (évidence) est observée.Pour illustrer cela, nous allons définir des Tables de Probabilités Conditionnelles (CPT) simplifiées et fictives, mais réalistes.3.1. Probabilités A Priori (Initiales)Ce sont les probabilités avant toute observation.$P(Contact\_Proche = Vrai) = 0.05$ (5% de la population a eu un contact récent).$P(Zone\_Cluster = Vrai) = 0.10$ (10% de la population vit dans une zone rouge).$P(Comorbidite = Vrai) = 0.20$ (20% de la population a une comorbidité).3.2. Scénario de Calculs SuccessifsSupposons que nous voulons calculer la Probabilité d'Infection (IC) d'un utilisateur au fur et à mesure qu'il remplit le formulaire de ton application.Calcul N°1 : La situation de base (Inférence causale)L'utilisateur n'a encore rien coché. Nous calculons la probabilité de base qu'il soit infecté, sachant simplement les taux de prévalence définis ci-dessus. C'est une combinaison complexe des CPT, mais ton moteur d'inférence (ex: pgmpy) calculera :$$P(IC = Vrai) \approx \mathbf{0.03} \quad (3\%) \quad \text{-- État initial}$$Calcul N°2 : Ajout d'une évidence d'exposition (Mise à jour bayésienne)L'utilisateur coche : "J'ai été en contact prolongé avec une personne positive". Nous ajoutons l'évidence : $Contact\_Proche (CP) = Vrai$.Le réseau recalcule la nouvelle probabilité $P(IC | CP=Vrai)$. Comme la relation est causale directe (voir image_0.png), la probabilité d'infection augmente de manière significative.$$P(IC = Vrai \mid CP=Vrai) \approx \mathbf{0.25} \quad (25\%) \quad \text{-- Mise à jour N°1}$$L'application affiche maintenant un risque modéré.Calcul N°3 : Ajout d'une évidence de symptôme (Inférence diagnostique)L'utilisateur coche maintenant : "J'ai perdu l'odorat" ($Anosmie (AA) = Vrai$).C'est ici que le théorème de Bayes est le plus puissant. Nous remontons de la conséquence vers la cause : $P(IC | CP=Vrai, AA=Vrai)$. Comme l'anosmie est un symptôme extrêmement spécifique au COVID, la probabilité explose.$$P(IC = Vrai \mid CP=Vrai, AA=Vrai) \approx \mathbf{0.85} \quad (85\%) \quad \text{-- Mise à jour N°2}$$L'application affiche un risque très élevé et conseille un test immédiat.Calcul N°4 : Évaluation du risque de Forme GraveLe système sait maintenant que l'infection est très probable (85%). L'utilisateur coche "J'ai du diabète" ($Comorbidite (CO) = Vrai$). L'application utilise maintenant la branche verte du graphe (image_0.png) pour évaluer $P(Forme\_Grave (FG) | IC=Vrai, CO=Vrai)$.$$P(FG = Vrai \mid IC=Vrai, CO=Vrai) \approx \mathbf{0.40} \quad (40\%) \quad \text{-- Mise à jour N°3}$$Conclusion pour ton projetTu as maintenant :Un cadre précis : l'aide au diagnostic et au tri.Une liste de 8 variables booléennes prêtes à l'emploi.Une structure de graphe validée (image_0.png).Une méthodologie de calculs successifs à implémenter.