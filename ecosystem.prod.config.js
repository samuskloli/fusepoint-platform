module.exports = {
  apps: [
    {
      name: 'fusepoint-frontend',
      script: 'infomaniak-server.js',
      cwd: '/srv/customer/sites/fusepoint.ch/fusepoint-platform',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
        API_PORT: 3000,
        ALLOWED_ORIGINS: 'https://fusepoint.ch,https://www.fusepoint.ch',
        SITE_ROOT: '/srv/customer/sites/fusepoint.ch/fusepoint-platform'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'fusepoint-api',
      script: 'server/server.js',
      cwd: '/srv/customer/sites/fusepoint.ch/fusepoint-platform',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ALLOWED_ORIGINS: 'https://fusepoint.ch,https://www.fusepoint.ch'
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};