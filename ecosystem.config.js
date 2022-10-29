module.exports = {
  apps: [
    {
      name: "authApi",
      script: "./Auth/server.js",
      watch: ['./Auth'],
      env: {
        NODE_ENV:'.env'
      },
      // exec_mode: 'cluster'
    },
    {
      name: "familyApi",
      script: "./Families/server.js",
      watch: ['./Families'],
      env: {
        NODE_ENV:'.env'
      },
      // exec_mode: 'cluster'
    },
    {
      name: "documentsApi",
      script: "./Documents/server.js",
      watch: ['./Documents'],
      env: {
        NODE_ENV:'.env'
      },
      // exec_mode: 'cluster'
    },
    // {
    //   script: './service-worker/',
    //   watch: ['./service-worker']
    // }
  ],

  // deploy: {
  //   production: {
  //     user: 'SSH_USERNAME',
  //     host: 'SSH_HOSTMACHINE',
  //     ref: 'origin/master',
  //     repo: 'GIT_REPOSITORY',
  //     path: 'DESTINATION_PATH',
  //     'pre-deploy-local': '',
  //     'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
  //     'pre-setup': ''
  //   }
  // }
};
