module.exports = {
  apps: [
    {
      name: 'backresidenz',
      script: './dist/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
