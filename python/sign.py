import os
import json
import requests
from web3 import Web3
from dotenv import load_dotenv
from pathlib import Path

dotenv_path = Path('../.env')
load_dotenv(dotenv_path=dotenv_path)

# RPC-TESTNET
if os.environ['ENVIRONMENT'] == 'testnet':
    rpc_url = 'https://api.avax-test.network/ext/bc/C/rpc'
    api_url = 'https://api-perpetual-staging.emdx.io'
    explorer_url = 'https://testnet.snowtrace.io/tx'
else:
    rpc_url = 'https://api.avax.network/ext/bc/C/rpc'
    api_url = 'https://api-perpetual.emdx.io'
    explorer_url = 'https://snowtrace.io/tx'

# Provider and account data
w3_provider = Web3(Web3.HTTPProvider(rpc_url))
w3_account  = w3_provider.eth.account.privateKeyToAccount(os.environ['PRIVATE_KEY'])
from_address = Web3.toChecksumAddress(w3_account.address)

# Get AVAX/USDC pair address
payload = {'trader': from_address}
headers = {"Authorization": "Bearer " + os.environ['API_KEY']}
res = requests.get(api_url+'/metadata', params=payload, headers=headers).json()
metadata = res['data']

################################################################################
# 1. Allow Clearing House to spend account funds
################################################################################
payload = {'trader': from_address}
res = requests.get(api_url+'/allowance/add', params=payload, headers=headers).json()

res['data']['gas'] = int(res['data']['gasLimit'], 0)
res['data']['nonce'] = int(res['data']['nonce'], 0)
res['data']['maxFeePerGas'] = int(res['data']['maxFeePerGas'], 0)
res['data']['maxPriorityFeePerGas'] = int(res['data']['maxPriorityFeePerGas'], 0)
del res['data']['gasLimit']

print('data', json.dumps(res['data'], indent=4) + "\n")

signed_tx = w3_provider.eth.account.sign_transaction(res['data'], private_key=w3_account.key)
signed_tx = str(Web3.toHex(signed_tx.rawTransaction))

print("signed_tx = " + signed_tx + "\n")

payload = {'tx': signed_tx}
res = requests.get(api_url+'/transaction/send', params=payload, headers=headers).json()

print('transaction_hash = ' + explorer_url + '/' + res['data']['hash'])

################################################################################
# 2. Open long position in AVAX/USDC pair
################################################################################
payload = {'amm': metadata['avax/usdc']['address'], 'collateral': 100, 'leverage': 10, 'slippage': 0.5, 'trader': from_address, 'side': 'buy', 'unit': 'decimal'}
res = requests.get(api_url+'/position/open', params=payload, headers=headers).json()

res['data']['gas'] = int(res['data']['gasLimit'], 0)
res['data']['nonce'] = int(res['data']['nonce'], 0)
res['data']['maxFeePerGas'] = int(res['data']['maxFeePerGas'], 0)
res['data']['maxPriorityFeePerGas'] = int(res['data']['maxPriorityFeePerGas'], 0)
del res['data']['gasLimit']

print('data', json.dumps(res['data'], indent=4) + "\n")

signed_tx = w3_provider.eth.account.sign_transaction(res['data'], private_key=w3_account.key)
signed_tx = str(Web3.toHex(signed_tx.rawTransaction))

print("signed_tx = " + signed_tx + "\n")

payload = {'tx': signed_tx}
res = requests.get(api_url+'/transaction/send', params=payload, headers=headers).json()

print('transaction_hash = ' + explorer_url + '/' + res['data']['hash'])
