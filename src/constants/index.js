const environments = require('./environments');

const userActions = ['register', 'login'];

module.exports = {
  environments,
  database_fixed_values: {
    user_state: ['active', 'blocked', 'suspended'],
    user_actions: userActions,
    user_register: userActions[0],
    login_types: ['form', 'google', 'facebook'],
  }
}