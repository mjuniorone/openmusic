const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.postUserHandler,
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
