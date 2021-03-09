const environments = require('./environments');
const login = require('./login_types');

const userActions = ['register', 'login'];
const userStates = ['active', 'blocked', 'suspended', 'mail_unconfirmed', 'ip_unconfirmed']; // Reference for index on user.model
const passwordStates = ['active', 'waiting'];
const tokenStates = ['active', 'pending'];

module.exports = {
  environments,
  database_fixed_values: {
    user_state: userStates,
    user_state_default: userStates[0],
    user_actions: userActions,
    user_register: userActions[0],
    user_login: userActions[1],
    login_types: login,
    password_state: passwordStates,
    password_state_default: passwordStates[0],
    password_state_waiting: passwordStates[1],
    token_state: tokenStates,
    token_state_default: tokenStates[0],
  },
};
