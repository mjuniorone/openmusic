const AuthenticationsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'authentications',
  version: '1.0.0',
  register: async (server, {
    authenticationsService,
    usersService,
    validator,
    tokenManager,
  }) => {
    const albumsHandler = new AuthenticationsHandler(
      authenticationsService,
      usersService,
      validator,
      tokenManager,
    );
    server.route(routes(albumsHandler));
  },
};
