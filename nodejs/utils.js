const Accounts = require('web3-eth-accounts');
const fetch = require('node-fetch');
const Web3 = require('web3');

const { API_TOKEN, API_URL, PRIVATE_KEY, RPC } = process.env;

const web3 = new Web3(RPC);

const constants = {
  BUY: 'buy',
  SELL: 'sell',
  DECIMAL: 'decimal',
  WEI: 'wei'
};

const getAccount = () => {
  const accounts = new Accounts(RPC);

  return accounts.privateKeyToAccount(PRIVATE_KEY);
}

const localFetch = async ({ method = 'GET', params = {}, path }) => {
  try {
    const isGet = method === 'GET';
    const query = isGet ? `?${(new URLSearchParams(params)).toString()}` : '';
    const options = isGet ?
      {} :
      { 
        body: JSON.stringify(params)
      };

    const response = await fetch(`${API_URL}${path}${query}`, 
      {
        ...options,
        headers: {
          Authorization: `Bearer ${API_TOKEN}`
        },
        method
      }
    );

    const { data } = await response.json();

    return data;
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

const signAndSend = async ({ account, data }) => {
  account.signTransaction(data)
    .then(({ rawTransaction }) => {
      web3.eth.sendSignedTransaction(rawTransaction, (error, transactionHash) => {
        if (error) {
          console.error(error);

          process.exit(1);
        }

        console.log(transactionHash);

        process.exit(0);
      });
    });
}

module.exports = {
  constants,
  fetch: localFetch,
  getAccount,
  signAndSend
};
