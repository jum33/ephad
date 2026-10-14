// Génère le site statique dans dist/ à partir de src/ et public/.
// - remplace les jetons {{CLE}} par les valeurs de site.config.json (nom de marque, domaine, e-mail…)
// - insère l'en-tête et le pied de page communs (<!--#header-->, <!--#footer-->)
// - pré-calcule le contenu lisible sans JavaScript (organigramme, chiffres clés, cas d'usage)
// Aucune dépendance : `node build.mjs`.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.dirname(new URL(import.meta.url).pathname);
const cfg = JSON.parse(fs.readFileSync(path.join(root, "site.config.json"), "utf8"));
const out = path.join(root, "dist");

const tokens = s => s.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in cfg ? cfg[k] : m));

// données partagées avec le navigateur (public/assets/data.js définit window.DATA)
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "public/assets/data.js"), "utf8"), sandbox);
const D = sandbox.window.DATA;

const partial = n => fs.readFileSync(path.join(root, "src/partials", n + ".html"), "utf8");
const nf = n => Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ");
const fmtT = m => m >= 60 ? (m % 60 ? `${Math.floor(m / 60)} h ${m % 60}` : `${m / 60} h`) : `${m} min`;
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const svg = (k, c) => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${D.ICONS[k]}</svg>`;
const R0 = D.DEFAULT_RESIDENCES;

// blocs générés, insérés à la place de <!--@nom-->
const gen = {
  "kpi-hours": () => nf(D.totalHours(R0)),
  "kpi-etp": () => D.etp(D.totalHours(R0)),
  "services-count": () => String(D.SERVICES.length),
  "services-details": () => D.SERVICES.map(s => `<details class="gdet" id="g-${s.id}"><summary><span class="ic">${svg(s.ic, s.c)}</span><span><b>${s.k}</b><small>${s.g} · ${s.task}</small></span><span class="gain">+${nf(D.hours(s, R0))} h/an</span></summary>
<div class="gbody">
<p><b>Tâche :</b> ${s.task.charAt(0).toLowerCase() + s.task.slice(1)}. <b>Avant :</b> ${fmtT(s.t[0])} par tâche. <b>Avec l'IA :</b> ${fmtT(s.t[1])}.</p>
<ol>${s.s.map((x, j) => `<li>${x} <span class="who-tag">${s.ai.includes(j) ? "IA" : "HUMAIN"}</span></li>`).join("")}</ol>
<p><b>Exemple de demande :</b> « ${s.q} »</p>
<div class="ans"><b>Réponse du portail :</b> ${s.a} <small>Source : ${s.src}</small></div>
<p><b>Garde-fou :</b> ${s.gd}</p>
</div></details>`).join("\n"),
  "cases": () => D.CASES.map(c => `<article class="fcard case" id="cas-${c.id}" data-f="${c.f}">
  <span class="who">${D.FAMILIES[c.f]}</span><h3>${c.t}</h3>
  <p class="desc">${c.d}</p>
  <p class="outcome">${c.o}</p>
  <p class="guard"><b>Garde-fou :</b> ${c.gd}</p>
  <div class="pills"><span class="dur">${c.gain}</span><span>${c.who}</span></div>
</article>`).join("\n"),
  "news": () => D.NEWS.map((n, i) => `<a class="nitem" id="news-${i}" href="/organigramme#service-${n.id}"><time>${n.d}</time><b>${n.t}</b><small>${n.s}</small><span class="more">Voir le service →</span></a>`).join("")
};

function page(src) {
  let html = fs.readFileSync(src, "utf8");
  // en-tête de page : <!--meta title="…" description="…" path="/…"-->
  const m = html.match(/<!--meta title="([^"]*)" description="([^"]*)" path="([^"]*)"-->\n?/);
  if (!m) throw new Error("bloc meta manquant : " + src);
  const [, title, desc, p] = m;
  html = html.replace(m[0], "");
  const head = partial("head").replace(/\{\{TITLE\}\}/g, title).replace(/\{\{DESC\}\}/g, desc).replace(/\{\{PATH\}\}/g, p);
  html = html.replace("<!--#head-->", head).replace("<!--#header-->", partial("header")).replace("<!--#footer-->", partial("footer"));
  html = html.replace(/<!--@([\w-]+)-->/g, (all, k) => (gen[k] ? gen[k]() : all));
  return tokens(html);
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, f.name), b = path.join(to, f.name);
    if (f.isDirectory()) copyDir(a, b);
    else if (/\.(js|css|txt|xml|svg|php|webmanifest|htaccess)$/.test(f.name)) fs.writeFileSync(b, tokens(fs.readFileSync(a, "utf8")));
    else fs.copyFileSync(a, b);
  }
}

fs.rmSync(out, { recursive: true, force: true });
copyDir(path.join(root, "public"), out);
const pages = fs.readdirSync(path.join(root, "src/pages")).filter(f => f.endsWith(".html"));
const urls = [];
for (const f of pages) {
  fs.writeFileSync(path.join(out, f), page(path.join(root, "src/pages", f)));
  if (f !== "404.html") urls.push(f === "index.html" ? "/" : "/" + f.replace(/\.html$/, ""));
}
fs.writeFileSync(path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${cfg.DOMAINE}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
const left = [...new Set(fs.readdirSync(out).filter(f => f.endsWith(".html")).flatMap(f => fs.readFileSync(path.join(out, f), "utf8").match(/\{\{[A-Z_]+\}\}|<!--[@#][\w-]+-->/g) || []))];
if (left.length) { console.error("Jetons non remplacés :", left.join(", ")); process.exit(1); }
console.log(`dist/ : ${pages.length} pages générées pour la marque « ${cfg.MARQUE} ».`);
