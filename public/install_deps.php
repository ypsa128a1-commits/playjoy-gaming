<?php
header("Content-Type: text/plain");
$cmd = "cd /home/aurazenm/game && /home/aurazenm/nodevenv/game/22/bin/npm install dotenv express 2>&1";
$output = shell_exec($cmd);
echo $output;
?>