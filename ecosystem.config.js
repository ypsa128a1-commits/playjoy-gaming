module.exports = {
  apps: [{
    name: "playjoy",
    cwd: "/var/www/playjoy.id",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 3001
    }
  }]
}
