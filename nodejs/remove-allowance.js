require('dotenv').config();

const { fetch, getAccount, signAndSend } = require('./utils');

const account = getAccount();

(async () => {
  const data = await fetch({
    params: {
      trader: account.address 
    },
    path: '/allowance/remove'
  });

  signAndSend({ account, data });
})();
