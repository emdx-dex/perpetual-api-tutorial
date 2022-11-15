require('dotenv').config();

const { constants, fetch, getAccount, signAndSend } = require('./utils');

const account = getAccount();

(async () => {
  const metadata = await fetch({
    path: '/metadata'
  });

  const amm = metadata['avax/usdc'].address;

  const data = await fetch({
    params: {
      amm,
      collateral: 100,
      leverage: 2,
      side: constants.BUY,
      slippage: 0.5,
      trader: account.address,
      unit: constants.DECIMAL
    },
    path: '/position/open'
  });

  signAndSend({ account, data });
})();
