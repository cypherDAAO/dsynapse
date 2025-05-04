# dsynapse
## Developing
```bash
bun run dev
# or start the server and open the app in a new browser tab
bun run dev -- --open
```
## Building
To create a production version of your app:
```bash
bun run build
```
You can preview the production build with `bun run preview`.
> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
> If you're experiencing issues when testing or compiling the frontend project, try removing the node_modules folder and reinstalling the dependencies.
## Foundry Usage
### Build
```shell
$ forge build
```
### Test
```shell
$ forge test
```
### Format
```shell
$ forge fmt
```
### Gas Snapshots
```shell
$ forge snapshot
```
### Anvil
```shell
$ anvil --host 0.0.0.0
```
### Deploy
**Script deployment and test**
using the script follows different verifications first before deploying the
contract, more about it here.
```shell
$source .env
$forge script script/LLMIndexer.s.sol:LLMIndexerScript --fork-url $PROVIDER_URL --private-key $PK0 --broadcast
```
> where:
> PROVIDER_URL can be either the anvil fork or a blockchain RPC
> $PK0 is the private-key
The correct smart contract operations by running the `DeployedLLMIndexer.s.sol`
script
Should set after deploying the smart contract in the .env named after
LLMINDEXERADDRS, once you update the address you can run the following
script to verify it was deployed correctly.
```shell
$source .env
$forge script script/DeployedLLMIndexer.s.sol:LLMIndexerScript --fork-url $PROVIDER_URL --private-key $PK0 --broadcast
```
### Cast
```shell
$ cast <subcommand>
```
### Help
```shell
$ forge --help
$ anvil --help
$ cast --help
```
## Web3Store Component
This project includes a component to connect with Ethereum wallets (mainly MetaMask) using ethers.js v6.
### Installation
```bash
# With bun
bun add ethers
bun add -D @types/ethereum-protocol
# With npm
npm install ethers
npm install --save-dev @types/ethereum-protocol
```
### Usage
The `WalletButton.svelte` component provides an interface to connect/disconnect the wallet.
```svelte
<script>
import WalletButton from '$lib/components/WalletButton.svelte';
</script>
<WalletButton />
```
You can also use the store directly:
```svelte
<script>
import { web3Store, connectWallet, disconnectWallet } from '$lib/components/web3store';
</script>
{#if $web3Store.isConnected}
<p>Connected with: {$web3Store.account}</p>
<button on:click={disconnectWallet}>Disconnect</button>
{:else}
<button on:click={connectWallet}>Connect</button>
{/if}
```
### API
The store exports the following properties:
- `provider`: Instance of ethers.BrowserProvider
- `signer`: Instance of ethers.JsonRpcSigner
- `account`: Connected wallet address
- `chainId`: Current network ID
- `isConnected`: Connection status
- `error`: Error message (if any)
- `isLoading`: Loading indicator during connection
And the following functions:
- `connectWallet()`: Connects to MetaMask
- `disconnectWallet()`: Disconnects the wallet
### Test Component
The project includes a unified test component to simulate interactions with Ethereum wallets without needing to have MetaMask installed:
```svelte
<script>
import WalletTestSuite from '$lib/components/WalletTestSuite.svelte';
</script>
<WalletTestSuite />
```
This component allows:
- Simulating wallet connection and disconnection
- Configuring states (loading, error, etc.)
- Simulating transaction sending
- Viewing the store state in real time
You can access the complete test page at the route `/wallet/test`.