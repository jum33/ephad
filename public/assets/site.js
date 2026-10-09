/* Comportements du site : menu, organigramme et calcul du temps rendu, bons réflexes, cas d'usage,
   École IA, espace direction, contact. Chaque bloc ne s'exécute que sur la page qui contient ses éléments.
   Les données viennent de data.js (window.DATA). */
(function () {
const D = window.DATA;
const $ = id => document.getElementById(id);
const svg = (k, c) => `<svg viewBox="0 0 24 24" fill="none" stroke="${c || "currentColor"}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${D.ICONS[k]}</svg>`;
const nf = n => Math.round(n).toLocaleString("fr-FR");
const fmtT = m => m >= 60 ? (m % 60 ? `${Math.floor(m/60)} h ${m%60}` : `${m/60} h`) : `${m} min`;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SEL_KEY = "ehpad-sel";

/* ---------- en-tête : menu mobile, page courante ---------- */
const nav = $("q-nav"), menu = $("q-menu");
if (nav && menu) menu.onclick = () => menu.setAttribute("aria-expanded", nav.classList.toggle("open"));
const here = location.pathname.replace(/\.html$/, "").replace(/\/index$/, "/") || "/";
document.querySelectorAll("#q-nav a, #nav-contact").forEach(a => { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });

/* ---------- organigramme ---------- */
if ($("orgchart")) {
  const S = D.SERVICES;
  let R = D.DEFAULT_RESIDENCES, seen = new Set(), cur = -1, timers = [], shownTotal = 0, lastFocus = null;
  const boxHTML = (s, i) => `<button class="box" type="button" id="box-${s.id}" data-i="${i}">
      <span class="ic">${svg(s.ic, s.c)}</span>
      <span><b>${s.k}</b><span class="meta"><small class="staff"></small></span></span>
      <span class="gain"></span></button>`;
  const byG = g => S.map((s, i) => [s, i]).filter(([s]) => s.g === g);
  const dg = byG("Direction générale");
  $("orgchart").innerHTML =
    `<div class="lvl1">${boxHTML(...dg[0])}</div><div class="stem"></div>
     <div class="lvl2">${boxHTML(...dg[1])}</div><div class="stem"></div>
     <div class="group siege"><p class="kicker">Le siège</p>${byG("Siège").map(([s, i]) => boxHTML(s, i)).join("")}</div>
     <div class="stem"></div>
     <div class="group residence"><p class="kicker">Une résidence type</p><p class="rnote" id="rnote"></p>${byG("Résidence").map(([s, i]) => boxHTML(s, i)).join("")}</div>`;
  document.querySelectorAll(".box").forEach(el => el.onclick = () => open(+el.dataset.i));

  const people = n => n + (n > 1 ? " personnes" : " personne");
  function refresh() {
    S.forEach(s => {
      const el = $("box-" + s.id), n = D.staff(s, R);
      el.querySelector(".staff").textContent = s.sc === "site" ? `${s.n} par résidence` : people(n);
      el.classList.toggle("done", seen.has(s.id));
      el.querySelector(".gain").textContent = seen.has(s.id) ? "+" + nf(D.hours(s, R)) + " h" : "";
    });
    $("rnote").textContent = `× ${R} résidence${R > 1 ? "s" : ""} dans le groupe`;
    countTo(S.filter(s => seen.has(s.id)).reduce((a, s) => a + D.hours(s, R), 0));
    $("explored").textContent = `${seen.size} / ${S.length} services explorés`;
    $("progbar").style.width = (seen.size / S.length * 100) + "%";
    const all = D.totalHours(R);
    $("donebox").innerHTML = seen.size === S.length
      ? `<div class="done-msg">Tout le groupe exploré : <b>${nf(all)} heures</b> rendues chaque année, soit <b>${D.etp(all)} équivalents temps plein</b> réinvestis auprès des résidents. <a href="/contact" style="color:inherit;font-weight:600">Mesurons-le chez vous →</a></div>`
      : "";
    $("total-all").textContent = nf(all) + " h";
    $("etp-all").textContent = D.etp(all) + " ETP";
  }
  function countTo(target) {
    const from = shownTotal, t0 = performance.now(), d = reduce ? 1 : 700;
    (function step(t) { const k = Math.min(1, (t - t0) / d), v = from + (target - from) * (1 - Math.pow(1 - k, 3));
      $("total").textContent = nf(v) + " h"; if (k < 1) requestAnimationFrame(step); else shownTotal = target; })(t0);
  }
  function setR(v) {
    R = Math.max(1, Math.min(60, +v || 1));
    $("res").value = R; $("res-out").textContent = `${R} résidence${R > 1 ? "s" : ""}`;
    document.querySelectorAll("#presets button").forEach(b => b.setAttribute("aria-pressed", +b.dataset.r === R));
    refresh(); if (cur >= 0 && $("drawer").classList.contains("on")) fill(cur, false);
  }
  $("res").oninput = e => setR(e.target.value);
  document.querySelectorAll("#presets button").forEach(b => b.onclick = () => setR(b.dataset.r));

  /* tiroir de détail */
  const later = (fn, ms) => timers.push(setTimeout(fn, reduce ? 0 : ms));
  function setMode(after) {
    const s = S[cur];
    $("t-before").setAttribute("aria-pressed", !after); $("t-after").setAttribute("aria-pressed", after);
    $("d-state").textContent = after ? "Avec l'IA" : "Avant";
    $("d-time").textContent = fmtT(after ? s.t[1] : s.t[0]) + " par tâche";
    [...$("d-steps").children].forEach((li, j) => {
      const ai = s.ai.includes(j);
      li.classList.toggle("ai", after && ai); li.classList.toggle("keep", after && !ai);
    });
  }
  function chat() {
    const s = S[cur], c = $("chat"); c.innerHTML = "";
    const me = document.createElement("div"); me.className = "bubble me"; c.appendChild(me);
    let n = 0;
    (function type() { me.textContent = s.q.slice(0, ++n); if (n < s.q.length) later(type, 12); else later(() => {
      const t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>"; c.appendChild(t);
      later(() => { t.remove(); const a = document.createElement("div"); a.className = "bubble ai"; a.innerHTML = s.a + `<span class="src">↳ ${s.src}</span>`; c.appendChild(a); }, 800);
    }, 200); })();
  }
  function fill(i, animate = true) {
    const s = S[i]; cur = i;
    timers.forEach(clearTimeout); timers = [];
    $("d-group").textContent = s.g;
    $("d-ic").innerHTML = svg(s.ic, s.c);
    $("d-title").textContent = s.k;
    $("d-person").innerHTML = s.p + '<span class="fict">PERSONNAGE FICTIF</span>';
    $("d-hours").textContent = nf(D.hours(s, R)) + " h";
    $("d-staff").textContent = `${people(D.staff(s, R))} · ${R} résidence${R > 1 ? "s" : ""}`;
    $("d-task").textContent = s.task;
    $("d-steps").innerHTML = s.s.map((x, j) => `<li><span class="k">${j+1}</span><span class="txt">${x}</span><span class="who-tag">${s.ai.includes(j) ? "IA" : "HUMAIN"}</span></li>`).join("");
    $("d-guard").textContent = s.gd;
    setMode(false);
    if (animate) { later(() => setMode(true), 1100); chat(); } else { setMode(true); chat(); }
  }
  function open(i) {
    lastFocus = document.activeElement;
    fill(i);
    $("drawer").classList.add("on"); $("scrim").classList.add("on"); $("drawer").setAttribute("aria-hidden", "false");
    $("drawer").scrollTop = 0;
    if (!seen.has(S[i].id)) { seen.add(S[i].id); refresh(); }
    history.replaceState(null, "", "#service-" + S[i].id);
    setTimeout(() => $("d-close").focus(), 50);
  }
  function close() {
    timers.forEach(clearTimeout);
    $("drawer").classList.remove("on"); $("scrim").classList.remove("on"); $("drawer").setAttribute("aria-hidden", "true");
    history.replaceState(null, "", location.pathname);
    if (lastFocus) lastFocus.focus();
  }
  $("d-close").onclick = close; $("scrim").onclick = close;
  document.addEventListener("keydown", e => { if (e.key === "Escape" && $("drawer").classList.contains("on")) close(); });
  $("t-before").onclick = () => setMode(false); $("t-after").onclick = () => setMode(true);
  $("d-next").onclick = () => { const nx = S.findIndex((s, j) => j > cur && !seen.has(s.id)); open(nx >= 0 ? nx : (cur + 1) % S.length); };
  $("d-prev").onclick = () => open((cur - 1 + S.length) % S.length);
  setR(R);
  const h = location.hash.match(/^#service-([\w-]+)$/);
  if (h) { const i = S.findIndex(s => s.id === h[1]); if (i >= 0) open(i); }
}

/* ---------- bons réflexes ---------- */
if ($("quiz")) {
  const OPTS = ["IA grand public", "Portail du groupe", "Jamais"];
  const Q = [
    ["Le référentiel d'évaluation de la HAS", [0,1], "Document public : les deux conviennent. Le portail garde la source et la trace."],
    ["Le compte rendu du dernier comité de direction du groupe", [1], "Document interne : uniquement dans le portail, jamais dans une IA grand public."],
    ["La transmission « Mme L., chambre 12, a chuté cette nuit »", [1], "Donnée de santé nominative : uniquement dans le portail hébergé HDS, avec un accès limité à l'équipe de soins."],
    ["Le mot de passe du logiciel de soins", [2], "Un mot de passe ne se donne à aucune IA."],
    ["La photo d'un résident pour illustrer la gazette", [2], "Pas de photo de résident dans une IA. La gazette se fait avec des photos autorisées, choisies par l'équipe."],
    ["Les menus de la semaine et la liste des allergènes", [0,1], "Rien de nominatif : les deux conviennent. Le portail connaît en plus vos régimes et vos fiches techniques."]
  ];
  let qi = 0, score = [];
  function render() {
    $("qprog").innerHTML = Q.map((_, i) => `<i class="${score[i] === true ? "ok" : score[i] === false ? "ko" : ""}"></i>`).join("");
    $("qfb").textContent = ""; $("qnext").hidden = true;
    if (qi >= Q.length) {
      $("qitem").textContent = `${score.filter(Boolean).length} / ${Q.length} bonnes réponses`;
      $("qopts").innerHTML = `<a class="btn" href="/ecole-ia">Former mes équipes</a><button type="button" id="qagain">Recommencer</button>`;
      $("qfb").textContent = "Ces réflexes sont au programme de l'acculturation IA, suivie par tous les collaborateurs du groupe.";
      $("qagain").onclick = () => { qi = 0; score = []; render(); };
      return;
    }
    $("qitem").textContent = Q[qi][0];
    $("qopts").innerHTML = OPTS.map((o, j) => `<button type="button" data-j="${j}">${o}</button>`).join("");
    $("qopts").querySelectorAll("button").forEach(b => b.onclick = () => {
      const good = Q[qi][1].includes(+b.dataset.j);
      score[qi] = good;
      $("qopts").querySelectorAll("button").forEach(x => { x.disabled = true; if (Q[qi][1].includes(+x.dataset.j)) x.classList.add("right"); });
      if (!good) b.classList.add("wrong");
      $("qfb").textContent = (good ? "Bonne réponse. " : "Pas tout à fait. ") + Q[qi][2];
      $("qprog").children[qi].className = good ? "ok" : "ko";
      $("qnext").hidden = false; $("qnext").textContent = qi === Q.length - 1 ? "Voir mon score" : "Suivant";
    });
  }
  $("qnext").onclick = () => { qi++; render(); };
  render();
}

/* ---------- cas d'usage : filtre par famille ---------- */
document.querySelectorAll("#cfilter button").forEach(bt => bt.onclick = () => {
  document.querySelectorAll("#cfilter button").forEach(x => x.setAttribute("aria-pressed", x === bt));
  document.querySelectorAll(".case").forEach(c => c.hidden = bt.dataset.f !== "all" && c.dataset.f !== bt.dataset.f);
});

/* ---------- École IA : catalogue et sélection ---------- */
const F = [
  {id:"acc", pub:"tous", who:"Tous les collaborateurs", t:"Acculturation IA", d:"1 h", f:["Dans le portail","En salle"], o:["Ce que fait une IA générative, et ses limites","Ce qu'on n'y met jamais : données de santé, photos, mots de passe","Utiliser le portail au quotidien"]},
  {id:"ref", pub:"referents", who:"Un référent par résidence et par service du siège", t:"Construire ses assistants", d:"1 jour", f:["Dans le portail"], o:["Transformer une tâche répétitive en assistant","Le tester sur les cas réels de la résidence","Le partager avec les autres résidences"]},
  {id:"pil", pub:"direction", who:"Direction générale et directions régionales", t:"Piloter l'IA dans un groupe", d:"½ journée", f:["En salle"], o:["Choisir les usages prioritaires du groupe","Fixer les règles : charte, périmètres, modèles","Lire les indicateurs d'usage et de coût par résidence"]},
  {id:"rgpd", pub:"direction", who:"DPO, juridique, qualité", t:"Données de santé, RGPD et règlement IA", d:"2 h", f:["En salle"], o:["Hébergement HDS : ce qu'il impose","Tenir le registre des traitements IA","Former et attester (article 4 du règlement IA)"]},
  {id:"soin", pub:"metiers", who:"IDEC, infirmiers, aides-soignants", t:"L'IA au service du soin", d:"2 h", f:["Dans le portail"], o:["Dicter ses transmissions, relire, valider","Préparer une relève ou un staff","Ce que l'IA ne fait jamais : diagnostic, prescription"]},
  {id:"dir", pub:"metiers", who:"Directeurs de résidence", t:"Familles et écrits sensibles", d:"2 h", f:["Dans le portail"], o:["Répondre à une réclamation avec le bon ton","Annoncer une nouvelle délicate","Garder la main sur chaque envoi"]},
  {id:"has", pub:"metiers", who:"Qualité et directions", t:"Préparer l'évaluation HAS avec l'IA", d:"½ journée", f:["Dans le portail"], o:["Auto-évaluation guidée par le référentiel","Retrouver les preuves dans vos documents","Construire le plan d'actions"]},
  {id:"rh", pub:"metiers", who:"RH et managers", t:"IA, recrutement et intégration", d:"2 h", f:["Dans le portail"], o:["Rédiger des annonces qui attirent","Accueillir les intérimaires avec un assistant","Ce que l'IA ne décide pas"]},
  {id:"vie", pub:"metiers", who:"Animation et hôtellerie", t:"Animer et informer avec l'IA", d:"2 h", f:["Dans le portail"], o:["Programmes d'animation et gazettes","Menus adaptés et affichages lisibles","Documents en FALC"]}
];
const A = [
  {id:"cad", t:"Cadrage des usages", who:"Accompagnement", d:"Ateliers", o:["Siège et résidences : vos tâches réelles, service par service","Arbitrage valeur, faisabilité, risque","Un plan de déploiement par vagues"]},
  {id:"pil2", t:"Pilote sur deux résidences", who:"Accompagnement", d:"8 semaines", o:["Assistants construits avec vos référents","Temps rendu mesuré sur vos équipes","Décision de généralisation sur des faits"]},
  {id:"dep", t:"Déploiement par vagues", who:"Accompagnement", d:"Sur mesure", o:["Ouverture résidence par résidence","Formation des équipes sur site","Assistants partagés entre résidences"]},
  {id:"sui", t:"Suivi mensuel", who:"Accompagnement", d:"Mensuel", o:["Usages et coûts par résidence","Nouveaux besoins, nouveaux assistants","Point avec la direction générale"]}
];
const ALL = [...F, ...A];
let sel = new Set();
try { sel = new Set(JSON.parse(localStorage.getItem(SEL_KEY) || "[]").filter(id => ALL.some(x => x.id === id))); } catch (_) {}
const card = (x, pills) => `<article class="fcard" id="fc-${x.id}" data-pub="${x.pub || ""}">
  <span class="who">${x.who}</span><h3>${x.t}</h3>
  <div class="pills"><span class="dur">${x.d}</span>${pills}</div>
  <ul>${x.o.map(o => `<li>${o}</li>`).join("")}</ul>
  <button class="add" type="button" data-id="${x.id}" aria-pressed="false">+ Ajouter à ma demande</button></article>`;
if ($("catalog")) {
  $("catalog").innerHTML = F.map(x => card(x, x.f.map(f => `<span>${f}</span>`).join("") + "<span>Attestation</span>")).join("");
  $("accomp").innerHTML = A.map(x => card(x, "")).join("");
}
document.querySelectorAll(".add").forEach(b => b.onclick = () => { const id = b.dataset.id; sel.has(id) ? sel.delete(id) : sel.add(id); syncSel(); });
function syncSel() {
  document.querySelectorAll(".add").forEach(b => { const on = sel.has(b.dataset.id); b.setAttribute("aria-pressed", on); b.textContent = on ? "✓ Dans ma demande" : "+ Ajouter à ma demande"; $("fc-" + b.dataset.id).classList.toggle("sel", on); });
  const n = sel.size;
  try { localStorage.setItem(SEL_KEY, JSON.stringify([...sel])); } catch (_) {}
  if ($("nav-n")) { $("nav-n").hidden = !n; $("nav-n").textContent = n; }
  if ($("selbar")) {
    $("selbar").classList.toggle("on", n > 0);
    $("selbar-t").textContent = `${n} ${n > 1 ? "prestations sélectionnées" : "prestation sélectionnée"}`;
  }
  if ($("f-prest")) $("f-prest").value = [...sel].map(id => ALL.find(x => x.id === id).t).join(" ; ");
  if (!$("chips")) return;
  $("chips").innerHTML = n ? [...sel].map(id => `<span class="chip">${ALL.find(x => x.id === id).t}<button type="button" data-id="${id}" aria-label="Retirer">×</button></span>`).join("")
    : `<span class="empty">Aucune pour l'instant. <a href="/ecole-ia">Parcourir l'École IA</a></span>`;
  $("chips").querySelectorAll("button").forEach(b => b.onclick = () => { sel.delete(b.dataset.id); syncSel(); });
}
document.querySelectorAll("#ffilter button").forEach(bt => bt.onclick = () => {
  document.querySelectorAll("#ffilter button").forEach(x => x.setAttribute("aria-pressed", x === bt));
  F.forEach(x => $("fc-" + x.id).hidden = bt.dataset.f !== "all" && x.pub !== bt.dataset.f);
});
syncSel();

/* ---------- espace direction ---------- */
if ($("pgrid")) {
  document.querySelectorAll("#pgrid .p").forEach(b => b.onclick = () => b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") !== "true"));
  const J = [
    "<b>45 min en visio.</b> Le {{GROUPE}} en fonctionnement, sur les services qui vous intéressent.",
    "<b>Deux résidences pilotes, vos documents.</b> On mesure le temps rendu chez vous, pendant 8 semaines.",
    "<b>Déploiement par vagues,</b> résidence par résidence, avec la formation des équipes sur site.",
    "<b>Point mensuel</b> sur les usages et les coûts par résidence, nouveaux assistants au fil de l'eau."
  ];
  const jb = [...document.querySelectorAll("#journey .jstep")];
  const jsel = i => { jb.forEach((b, k) => b.setAttribute("aria-pressed", k === i)); $("jdetail").innerHTML = J[i]; };
  jb.forEach((b, i) => b.onclick = () => jsel(i)); jsel(0);
}

/* ---------- contact ---------- */
const form = $("form");
if (form) {
  form.onsubmit = e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const bt = form.querySelector('button[type="submit"]'), label = bt.textContent;
    bt.disabled = true; bt.textContent = "Envoi en cours…";
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString() })
      .then(r => { if (!r.ok) throw new Error(r.status); $("ok").hidden = false; $("ko").hidden = true; form.reset(); sel.clear(); syncSel(); })
      .catch(() => { $("ko").hidden = false; })
      .finally(() => { bt.disabled = false; bt.textContent = label; });
  };
  $("copy").onclick = () => {
    const done = () => { $("copy").textContent = "Copié"; setTimeout(() => $("copy").textContent = "Copier", 1500); };
    try { navigator.clipboard.writeText($("mail").textContent).then(done, () => getSelection().selectAllChildren($("mail"))); }
    catch (_) { getSelection().selectAllChildren($("mail")); }
  };
}
})();
