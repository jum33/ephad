<?php
// Formulaire de contact (hébergement OVH) : envoie la demande par e-mail à {{EMAIL}}.
// Répond 200 si l'envoi a réussi, 400 ou 500 sinon. Aucune donnée n'est enregistrée sur le serveur.
header('Content-Type: text/plain; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
if (!empty($_POST['bot-field'])) { exit('ok'); } // robot : on fait semblant

$f = fn($k, $max = 2000) => trim(mb_substr(str_replace(["\r", "\0"], '', (string)($_POST[$k] ?? '')), 0, $max));
$email = $f('email', 200);
if ($f('nom', 200) === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); exit('Nom et e-mail obligatoires.'); }

$lignes = [
  'Nom' => $f('nom', 200), 'Fonction' => $f('fonction', 200), 'Groupe' => $f('groupe', 200),
  'Résidences' => $f('residences', 20), 'E-mail' => $email, 'Téléphone' => $f('telephone', 50),
  'Formations et prestations' => $f('prestations'), 'Message' => $f('message', 5000),
];
$corps = '';
foreach ($lignes as $k => $v) { $corps .= "$k : " . ($v === '' ? '-' : $v) . "\n"; }

$a = '{{EMAIL}}';
$sujet = '=?UTF-8?B?' . base64_encode('Demande de démo {{MARQUE}} : ' . $lignes['Nom']) . '?=';
$entetes = "From: $a\r\nReply-To: $email\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: 8bit";
if (!mail($a, $sujet, $corps, $entetes)) { http_response_code(500); exit('Envoi impossible.'); }
echo 'ok';
