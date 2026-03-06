<?php
set_time_limit(300);
header("Content-Type: text/plain");

echo "=== Installing dependencies for Gaming Hub ===\n\n";

$cmd = "cd /home/aurazenm/game && /home/aurazenm/nodevenv/game/22/bin/npm install express cookie-parser dotenv 2>&1";
echo "Running: $cmd\n\n";
$output = shell_exec($cmd);
echo $output;

echo "\n\n=== Checking installed modules ===\n";
$check = shell_exec("ls -la /home/aurazenm/game/node_modules | head -20");
echo $check;

echo "\n=== Done ===\n";
?>