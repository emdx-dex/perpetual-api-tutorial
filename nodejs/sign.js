const Accounts = require('web3-eth-accounts');
const Web3 = require('web3');

const rpc = 'https://api.avax-test.network/ext/bc/C/rpc';
const accounts = new Accounts(rpc);
const web3 = new Web3(rpc);

// Add allowance transaction
// const data = '0x095ea7b30000000000000000000000001969d219542ac72612d6ca6438a216350e8d0f3dffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
// Remove allowance transaction
const data = '0x095ea7b30000000000000000000000001969d219542ac72612d6ca6438a216350e8d0f3d0000000000000000000000000000000000000000000000000000000000000000';

const collateral = '0x5A0d0B5f9aAD08EA771c783D45Ca20ca803da44B';

// Set here your private key
const privateKey = '';

const myAccount = accounts.privateKeyToAccount(privateKey);

web3.eth.estimateGas({
  data,
  from: myAccount.address,
  to: collateral
})
  .then((gas) => {
    const tx = {
      data,
      gas,
      to: collateral
    };

    myAccount.signTransaction(tx)
      .then(({ rawTransaction }) => {
        // console.log(rawTransaction);

        web3.eth.sendSignedTransaction(rawTransaction, (error, transactionHash) => {
          if (error) {
            console.error(error);

            process.exit(1);
          }

          console.log(transactionHash);

          process.exit(0);
        });
      });
  });

