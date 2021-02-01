const environments = require('./environments');
const login = require('./login_types');
const validator = require('./body_validator');

const userActions = ['register', 'login'];
const userStates = ['active', 'blocked', 'suspended'];

module.exports = {
  environments,
  database_fixed_values: {
    user_state: userStates,
    user_state_default: userStates[0],
    user_actions: userActions,
    user_register: userActions[0],
    login_types: login,
  },
  validator,
  max_username: 15,
};
