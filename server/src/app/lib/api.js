const credentials = require('./credentials.controller');
const organizations = require('./organizations.controller');
const users = require('./users.controller');
const home = require('./home.controller');
const events = require('./events.controller');
const bookings = require('./bookings.controller');

module.exports.createIndex = (app) => {
  bookings(app, '/api/_/bookings');
  organizations(app, '/api/_/organizations');
  users(app, '/api/_/users');
  credentials(app, '/api/credentials');
  home(app, '/api/home');
  events(app, '/api/_/events');
};
