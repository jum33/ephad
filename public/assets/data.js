/* Données du groupe de démonstration, partagées par le navigateur (site.js) et la génération (build.mjs).
   Tous les chiffres sont illustratifs.

   Un service :
   - g = niveau (Direction générale, Siège, Résidence) ; k = intitulé ; p = personnage fictif
   - sc = mode de calcul des effectifs :
       "fixe"  → n personnes, quelle que soit la taille du groupe
       "siege" → n personnes pour un groupe de 12 résidences, au prorata ensuite (au moins 1)
       "site"  → n personnes par résidence
   - f = occurrences de la tâche par personne et par an ; t = minutes [avant, avec l'IA]
   - s = étapes avant ; ai = index des étapes prises en charge par l'IA
   - q / a / src = exemple de demande, réponse du portail et source citée ; gd = garde-fou */
window.DATA = (function () {
  const ICONS = {
    star:'<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    shield:'<path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2.8.2 5 2 5 5"/>',
    euro:'<path d="M17 6.5A6.5 6.5 0 007 12a6.5 6.5 0 0010 5.5"/><path d="M4 10.5h9M4 13.5h9"/>',
    key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/>',
    mega:'<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M18 9a4 4 0 010 6"/>',
    scale:'<path d="M12 4v16M7 20h10M5 8h14"/><path d="M5 8l-2.5 6a3 3 0 005 0zM19 8l-2.5 6a3 3 0 005 0z"/>',
    home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
    steth:'<path d="M6 3v6a4 4 0 008 0V3"/><path d="M10 13v2a5 5 0 0010 0v-2"/><circle cx="20" cy="11" r="2"/>',
    heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    fork:'<path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10"/><path d="M17 3c-2 2-2 6 0 8v10"/>',
    phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
    grad:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>',
    lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
    flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    play:'<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>',
    route:'<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 000-6H9a3 3 0 010-6h6.5"/>',
    doc:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    server:'<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
    hand:'<path d="M7 11V6a1.5 1.5 0 013 0v4M10 10V4.5a1.5 1.5 0 013 0V10M13 10V5.5a1.5 1.5 0 013 0V12M16 9.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-.5A6.5 6.5 0 015 16.2L3.6 13a1.5 1.5 0 012.6-1.4L7 13"/>'
  };

  const G = "var(--green)", T = "var(--teal)", A = "var(--amber)";

  const SERVICES = [
   {id:"dg", g:"Direction générale", k:"Direction générale", ic:"star", c:G, p:"Hélène Marchand", sc:"fixe", n:1, f:24, t:[240,45],
    task:"Préparer la note au conseil d'administration",
    s:["Demander les chiffres aux directions","Relancer les retardataires","Consolider les indicateurs du groupe","Rédiger la note","Relire et arbitrer"], ai:[0,1,2,3],
    q:"Prépare ma note au conseil sur le trimestre : occupation, qualité, RH.", a:"Note de 2 pages prête :<ul><li>Taux d'occupation 96,4 % (+0,8 pt)</li><li>2 résidences sous surveillance qualité</li><li>Absentéisme en baisse de 1,2 pt</li></ul>", src:"Reportings mensuels des 12 résidences · T3",
    gd:"La note est relue, arbitrée et signée par la directrice générale."},
   {id:"dop", g:"Direction générale", k:"Directions régionales", ic:"compass", c:T, p:"Marc Delaunay", sc:"siege", n:3, f:48, t:[180,40],
    task:"Préparer la revue hebdomadaire des résidences",
    s:["Lire les remontées de chaque résidence","Repérer les signaux faibles","Comparer aux semaines précédentes","Rédiger la synthèse","Fixer les priorités de visite"], ai:[0,1,2,3],
    q:"Synthétise les remontées de mes 4 résidences pour lundi.", a:"3 points d'attention :<ul><li>Les Tilleuls : 3 postes d'AS vacants</li><li>Le Clos Fleuri : hausse des chutes</li><li>Bel Air : réclamation famille en cours</li></ul>", src:"Remontées hebdomadaires · semaine 41",
    gd:"Le directeur régional décide des visites et des actions."},
   {id:"qual", g:"Siège", k:"Qualité & gestion des risques", ic:"shield", c:G, p:"Sonia Benali", sc:"siege", n:3, f:24, t:[360,90],
    task:"Consolider les événements indésirables du groupe",
    s:["Collecter les fiches des résidences","Classer par type et gravité","Repérer les récurrences","Rédiger la synthèse et les actions","Présenter en comité qualité"], ai:[0,1,2,3],
    q:"Fais la synthèse des événements indésirables du mois, par résidence.", a:"142 fiches analysées :<ul><li>Chutes : 41 %, en hausse sur 2 sites</li><li>Erreurs médicamenteuses : 6, dont 1 grave</li><li>3 actions correctives proposées</li></ul>", src:"Fiches EI de septembre · référentiel HAS",
    gd:"L'analyse des causes d'un événement grave reste menée par l'équipe qualité, avec la résidence."},
   {id:"rh", g:"Siège", k:"RH & recrutement", ic:"users", c:A, p:"Julien Morel", sc:"siege", n:5, f:150, t:[90,30],
    task:"Publier une offre et présélectionner les candidatures",
    s:["Reprendre la fiche de poste","Rédiger l'annonce","Diffuser sur les jobboards","Lire les CV reçus","Proposer une présélection"], ai:[1,3,4],
    q:"Rédige l'annonce d'aide-soignant de nuit pour Les Tilleuls.", a:"Annonce prête, au ton du groupe :<ul><li>Poste, horaires, prime de nuit</li><li>Avantages et parcours de formation</li><li>Version courte pour les réseaux</li></ul>", src:"Fiche de poste AS nuit · grille salariale 2026",
    gd:"Aucune décision de recrutement par l'IA : la sélection reste humaine."},
   {id:"fin", g:"Siège", k:"Finance & contrôle de gestion", ic:"euro", c:T, p:"Claire Fontaine", sc:"siege", n:4, f:12, t:[480,120],
    task:"Commenter le reporting mensuel des résidences",
    s:["Extraire les données","Calculer les écarts au budget","Chercher les explications","Rédiger les commentaires","Valider avec les directeurs"], ai:[1,2,3],
    q:"Commente les écarts de septembre pour les 12 résidences.", a:"Commentaires rédigés :<ul><li>Intérim : +38 k€, 3 sites concernés</li><li>Alimentation : conforme</li><li>Énergie : -6 % grâce aux travaux</li></ul>", src:"Reporting de septembre · budget 2026",
    gd:"Les chiffres restent ceux du logiciel comptable, l'IA ne fait que les commenter."},
   {id:"adm", g:"Siège", k:"Développement & admissions", ic:"key", c:A, p:"Inès Garnier", sc:"siege", n:3, f:200, t:[30,10],
    task:"Répondre à une famille qui cherche une place",
    s:["Lire la demande","Vérifier les places disponibles","Trouver la résidence adaptée","Rédiger la réponse","Programmer un rappel"], ai:[0,2,3],
    q:"Une famille cherche une place en unité protégée près de Bordeaux.", a:"Réponse prête :<ul><li>2 résidences proposées, avec unité protégée</li><li>Tarifs et aides possibles (APA, aide sociale)</li><li>Proposition de visite</li></ul>", src:"Fiches résidences · grille tarifaire 2026",
    gd:"Les disponibilités viennent du logiciel d'admission, la réponse est relue avant envoi."},
   {id:"com", g:"Siège", k:"Communication & marketing", ic:"mega", c:G, p:"Léa Rousseau", sc:"siege", n:2, f:150, t:[60,15],
    task:"Publier les actualités d'une résidence",
    s:["Recueillir les photos et le récit","Vérifier les droits à l'image","Rédiger l'article","Décliner pour les réseaux","Faire valider"], ai:[2,3],
    q:"Rédige l'actualité de la fête des familles du Clos Fleuri.", a:"Article et 2 posts prêts, à la charte du groupe, sans nom de résident.", src:"Récit de l'animatrice · charte éditoriale",
    gd:"Aucune photo ni nom de résident sans autorisation écrite."},
   {id:"jur", g:"Siège", k:"Juridique & DPO", ic:"scale", c:T, p:"Nadia Petit", sc:"siege", n:2, f:10, t:[600,150],
    task:"Mettre à jour le contrat de séjour après un changement de règle",
    s:["Lire le nouveau texte","Repérer les clauses concernées","Rédiger les modifications","Vérifier la cohérence des documents","Diffuser aux résidences"], ai:[0,1,2,3],
    q:"Quelles clauses du contrat de séjour changent avec le nouveau décret ?", a:"4 clauses à modifier, propositions de rédaction jointes, et 2 annexes à mettre à jour.", src:"Décret publié au JO · contrat de séjour type",
    gd:"La juriste valide chaque modification avant diffusion."},
   {id:"dir", g:"Résidence", k:"Direction de résidence", ic:"home", c:A, p:"Thomas Leroy", sc:"site", n:1, f:100, t:[40,12],
    task:"Répondre au courrier d'une famille",
    s:["Lire le courrier","Retrouver les éléments du dossier","Rédiger la réponse","Relire le ton","Envoyer et archiver"], ai:[1,2],
    q:"Aide-moi à répondre à la fille de Mme D. sur le linge égaré.", a:"Projet de réponse empathique et factuel, avec la mesure prise par la lingerie et une proposition de rendez-vous.", src:"Courrier reçu · procédure lingerie",
    gd:"Le directeur signe chaque réponse. Rien n'est envoyé automatiquement."},
   {id:"idec", g:"Résidence", k:"Infirmier·e coordinateur·rice (IDEC)", ic:"clip", c:G, p:"Sandrine Faure", sc:"site", n:1, f:50, t:[90,20],
    task:"Préparer le staff pluridisciplinaire de la semaine",
    s:["Relire les transmissions de la semaine","Repérer les résidents à discuter","Préparer les points par résident","Rédiger le compte rendu","Mettre à jour les plans de soins"], ai:[0,1,2,3],
    q:"Prépare le staff de jeudi à partir des transmissions.", a:"6 résidents à évoquer :<ul><li>2 pertes de poids</li><li>1 changement de comportement</li><li>3 réévaluations de la douleur</li></ul>", src:"Transmissions ciblées · semaine 41",
    gd:"Données de santé uniquement sur hébergement certifié HDS. L'IDEC décide des plans de soins."},
   {id:"medco", g:"Résidence", k:"Médecin coordonnateur", ic:"steth", c:T, p:"Dr Karim Haddad", sc:"site", n:1, f:2, t:[1200,300],
    task:"Rédiger le rapport annuel d'activité médicale (RAMA)",
    s:["Extraire les données du dossier de soins","Calculer les indicateurs","Rédiger l'analyse","Proposer les axes de l'année","Relire et signer"], ai:[0,1,2],
    q:"Prépare la trame du RAMA 2026 à partir des indicateurs.", a:"Trame de 12 pages :<ul><li>GMP et PMP de l'année</li><li>Hospitalisations et chutes</li><li>3 axes proposés</li></ul>", src:"Extraction du dossier de soins · modèle RAMA",
    gd:"Le médecin coordonnateur rédige l'analyse médicale et signe le rapport."},
   {id:"soins", g:"Résidence", k:"Équipes soignantes", ic:"heart", c:A, p:"Aïcha, aide-soignante", sc:"site", n:30, f:120, t:[15,10],
    task:"Rédiger les transmissions de fin de poste",
    s:["Se remémorer la journée","Saisir chaque transmission","Reformuler en transmissions ciblées","Relire et valider"], ai:[2],
    q:"Mets en forme ma dictée : Mme L. a peu mangé ce midi, plus fatiguée.", a:"Transmission ciblée prête :<ul><li>Cible : alimentation</li><li>Données : 1/4 du repas</li><li>Action : surveillance du soir</li></ul>", src:"Dictée vocale · format DAR de la résidence",
    gd:"La soignante relit et valide chaque transmission. Rien n'entre au dossier sans elle."},
   {id:"anim", g:"Résidence", k:"Vie sociale & animation", ic:"sun", c:G, p:"Manon Girard", sc:"site", n:2, f:24, t:[120,40],
    task:"Préparer le programme d'animation et la gazette",
    s:["Recueillir les envies des résidents","Construire le programme","Rédiger la gazette","Mettre en page","Diffuser aux familles"], ai:[1,2,3],
    q:"Propose un programme d'animation pour novembre, avec la gazette.", a:"Programme de 4 semaines (atelier mémoire, chorale, sortie marché) et gazette en gros caractères.", src:"Souhaits du CVS · programme d'octobre",
    gd:"Les envies des résidents passent avant les idées de l'IA."},
   {id:"hot", g:"Résidence", k:"Hôtellerie & restauration", ic:"fork", c:T, p:"Patrick Blanc", sc:"site", n:1, f:52, t:[180,60],
    task:"Adapter les menus de la semaine aux régimes et textures",
    s:["Reprendre le plan alimentaire","Croiser avec les régimes","Adapter les textures","Vérifier les allergènes","Afficher les menus"], ai:[1,2,3],
    q:"Adapte les menus de la semaine 45 aux régimes de l'unité B.", a:"Menus déclinés : 4 textures, 3 régimes, allergènes signalés, version affichage en gros caractères.", src:"Plan alimentaire · liste des régimes",
    gd:"La diététicienne valide les menus adaptés."},
   {id:"acc", g:"Résidence", k:"Accueil & secrétariat", ic:"phone", c:A, p:"Émilie Roux", sc:"site", n:1, f:40, t:[90,30],
    task:"Constituer un dossier d'admission",
    s:["Récupérer le dossier Via Trajectoire","Vérifier les pièces","Relancer la famille","Préparer le contrat de séjour","Planifier la visite de pré-admission"], ai:[1,2,3],
    q:"Quelles pièces manquent au dossier de M. B. ?", a:"3 pièces manquantes (avis d'imposition, attestation d'assurance, mandat de protection). Relance prête à envoyer.", src:"Dossier d'admission · liste des pièces",
    gd:"La décision d'admission reste à la commission d'admission."}
  ];

  const DEFAULT_RESIDENCES = 12;
  const staff = (s, R) => s.sc === "fixe" ? s.n : s.sc === "site" ? s.n * R : Math.max(1, Math.round(s.n * R / 12));
  const hours = (s, R) => staff(s, R) * s.f * (s.t[0] - s.t[1]) / 60;
  const totalHours = R => SERVICES.reduce((a, s) => a + hours(s, R), 0);
  const etp = h => (h / 1607).toLocaleString("fr-FR", { maximumFractionDigits: 1 });

  const FAMILIES = { pilotage:"Direction et pilotage", soins:"Soins et accompagnement", vie:"Vie sociale et hôtellerie", rh:"RH et formation", qualite:"Qualité et conformité", relation:"Familles et admissions" };
  const CASES = [
   {id:"transmissions", f:"soins", t:"Transmissions ciblées dictées", d:"La soignante dicte à la voix, le portail met en forme au format de la résidence (DAR).", o:"Plus de temps au chevet, moins devant l'écran.", gain:"5 min / poste", who:"Soignants"},
   {id:"releve", f:"soins", t:"Synthèse de relève", d:"Les faits marquants de la nuit résumés pour l'équipe du matin, résident par résident.", o:"Une relève plus courte et plus complète.", gain:"15 min / relève", who:"IDE, IDEC"},
   {id:"pap", f:"soins", t:"Projet d'accompagnement personnalisé", d:"Premier jet du PAP à partir du recueil des habitudes de vie et des observations de l'équipe.", o:"Des PAP à jour pour chaque résident.", gain:"1 h / PAP", who:"IDEC, psychologue"},
   {id:"rama", f:"soins", t:"Rapport d'activité médicale", d:"Trame du RAMA pré-remplie à partir des indicateurs du dossier de soins.", o:"Le médecin se concentre sur l'analyse.", gain:"15 h / an", who:"Médecin coordonnateur"},
   {id:"has", f:"qualite", t:"Préparation de l'évaluation HAS", d:"Auto-évaluation guidée par le référentiel, recherche des preuves dans vos documents, plan d'actions.", o:"Une évaluation préparée sans y perdre l'été.", gain:"40 h / résidence", who:"Qualité, direction"},
   {id:"ei", f:"qualite", t:"Événements indésirables", d:"Classement des fiches, détection des récurrences, trame de déclaration à l'ARS pour les événements graves.", o:"Une vision groupe, chaque mois.", gain:"4 h / mois", who:"Qualité"},
   {id:"veille", f:"qualite", t:"Veille réglementaire", d:"Textes de la semaine (ARS, DGCS, JO) résumés et classés par impact pour le groupe.", o:"Rien d'important ne passe à côté.", gain:"3 h / semaine", who:"Juridique, qualité"},
   {id:"procedures", f:"qualite", t:"Assistant procédures du groupe", d:"Un assistant qui répond sur les protocoles du groupe, avec la source, pour chaque résidence.", o:"Les mêmes réponses partout, tout de suite.", gain:"10 min / question", who:"Toutes les équipes"},
   {id:"familles", f:"relation", t:"Courriers aux familles", d:"Réponses aux réclamations et informations délicates, avec un ton juste et les faits du dossier.", o:"Des familles mieux informées, des directeurs soulagés.", gain:"30 min / courrier", who:"Directeurs"},
   {id:"admissions", f:"relation", t:"Demandes de places", d:"Réponse personnalisée aux familles : résidence adaptée, tarifs, aides, proposition de visite.", o:"Une réponse dans l'heure, pas dans la semaine.", gain:"20 min / demande", who:"Admissions"},
   {id:"dossier", f:"relation", t:"Dossiers d'admission complets", d:"Vérification des pièces, relances, préparation du contrat de séjour.", o:"Moins d'allers-retours avec les familles.", gain:"1 h / dossier", who:"Accueil"},
   {id:"cvs", f:"pilotage", t:"Comptes rendus du CVS et des instances", d:"De l'enregistrement de séance au compte rendu, au format du groupe.", o:"Comptes rendus diffusés le jour même.", gain:"3 h / séance", who:"Direction, secrétariat"},
   {id:"reporting", f:"pilotage", t:"Reporting et revues de résidences", d:"Commentaires des écarts, synthèses régionales, notes au conseil d'administration.", o:"Le siège passe du recueil à l'analyse.", gain:"6 h / mois", who:"Siège, directeurs régionaux"},
   {id:"cpom", f:"pilotage", t:"CPOM, EPRD et ERRD", d:"Rédaction des parties narratives et cohérence entre documents budgétaires.", o:"Des dossiers prêts à temps pour l'ARS.", gain:"20 h / dossier", who:"Finance, direction"},
   {id:"recrutement", f:"rh", t:"Offres d'emploi et présélection", d:"Annonces au ton du groupe et grille de lecture des candidatures.", o:"Des postes publiés le jour où ils se libèrent.", gain:"1 h / poste", who:"RH"},
   {id:"integration", f:"rh", t:"Intégration des intérimaires", d:"Un assistant mobile qui répond sur les protocoles et l'organisation de la résidence.", o:"Un intérimaire opérationnel dès la première heure.", gain:"30 min / arrivée", who:"Équipes de soins"},
   {id:"formation", f:"rh", t:"Supports de formation et QCM", d:"Bientraitance, prévention des chutes, troubles du comportement : supports et QCM à partir de vos référentiels.", o:"Le plan de formation tenu dans toutes les résidences.", gain:"3 h / module", who:"Formation"},
   {id:"menus", f:"vie", t:"Menus adaptés", d:"Déclinaison des menus par régime et texture, allergènes, affichage en gros caractères.", o:"Moins d'erreurs, plus de plaisir à table.", gain:"2 h / semaine", who:"Restauration"},
   {id:"animation", f:"vie", t:"Programme d'animation et gazette", d:"Programme mensuel et gazette des résidents, en FALC et gros caractères.", o:"Plus de temps pour animer, moins pour écrire.", gain:"1 h 20 / mois", who:"Animation"},
   {id:"livret", f:"vie", t:"Livret d'accueil en FALC", d:"Livret d'accueil et règlement de fonctionnement en version facile à lire et à comprendre.", o:"Des documents lisibles par les résidents eux-mêmes.", gain:"1 jour / document", who:"Direction"}
  ];

  const NEWS = [
    {d:"2 octobre 2026", id:"soins", t:"Les transmissions dictées à la voix dans 4 résidences", s:"La soignante parle, le portail met en forme, elle valide."},
    {d:"18 septembre 2026", id:"qual", t:"Événements indésirables : la synthèse groupe en une matinée", s:"142 fiches analysées, récurrences repérées, actions proposées."},
    {d:"4 septembre 2026", id:"adm", t:"Demandes de places : une réponse aux familles dans l'heure", s:"Résidence adaptée, tarifs et proposition de visite."},
    {d:"21 août 2026", id:"hot", t:"Les menus adaptés à chaque texture, chaque semaine", s:"Régimes, textures et allergènes croisés automatiquement."}
  ];

  return { ICONS, SERVICES, DEFAULT_RESIDENCES, staff, hours, totalHours, etp, FAMILIES, CASES, NEWS };
})();
