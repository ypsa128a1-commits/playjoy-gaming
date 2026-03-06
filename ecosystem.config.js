module.exports = {
  apps: [{
    name: "playjoy",
    cwd: "/var/www/playjoy.id",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: "3001"
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "500M"
  }]
}
