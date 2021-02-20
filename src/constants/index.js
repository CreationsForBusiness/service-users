const environments = require('./environments');
const login = require('./login_types');
const validator = require('./body_validator');

const userActions = ['register', 'login'];
const userStates = ['active', 'blocked', 'suspended'];
const passwordStates = ['active', 'waiting'];

module.exports = {
  environments,
  database_fixed_values: {
    user_state: userStates,
    user_state_default: userStates[0],
    user_actions: userActions,
    user_register: userActions[0],
    login_types: login,
    password_state: passwordStates,
    password_state_default: passwordStates[0],
  },
  validator,
  max_username: 32,
};
