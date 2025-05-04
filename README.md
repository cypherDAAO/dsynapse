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
using the script follows diferent verifications first before deploying the
contract, more about it here.

```shell
$source .env
$forge script script/LLMIndexer.s.sol:LLMIndexerScript --fork-url $PROVIDER_URL --private-key $PK0 --broadcast

```
> where:
> PROVIDER_URL can be either the anvil fork or a blockchain RPC
> $PK0 is the private-key

The correct smartcontract operations by running the `DeployedLLMIndexer.s.sol`
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

## Componente Web3Store

Este proyecto incluye un componente para conectar con wallets Ethereum (principalmente MetaMask) utilizando ethers.js v6.

### Instalación

```bash
# Con bun
bun add ethers
bun add -D @types/ethereum-protocol

# Con npm
npm install ethers
npm install --save-dev @types/ethereum-protocol
```

### Uso

El componente `WalletButton.svelte` proporciona una interfaz para conectar/desconectar la wallet.

```svelte
<script>
  import WalletButton from '$lib/components/WalletButton.svelte';
</script>

<WalletButton />
```

También puedes usar directamente el store:

```svelte
<script>
  import { web3Store, connectWallet, disconnectWallet } from '$lib/components/web3store';
</script>

{#if $web3Store.isConnected}
  <p>Conectado con: {$web3Store.account}</p>
  <button on:click={disconnectWallet}>Desconectar</button>
{:else}
  <button on:click={connectWallet}>Conectar</button>
{/if}
```

### API

El store exporta las siguientes propiedades:

- `provider`: Instancia de ethers.BrowserProvider
- `signer`: Instancia de ethers.JsonRpcSigner
- `account`: Dirección de la wallet conectada
- `chainId`: ID de la red actual
- `isConnected`: Estado de conexión
- `error`: Mensaje de error (si existe)
- `isLoading`: Indicador de carga durante la conexión

Y las siguientes funciones:

- `connectWallet()`: Conecta con MetaMask
- `disconnectWallet()`: Desconecta la wallet

### Componente de Prueba

El proyecto incluye un componente de prueba unificado para simular interacciones con wallets Ethereum sin necesidad de tener MetaMask instalado:

```svelte
<script>
  import WalletTestSuite from '$lib/components/WalletTestSuite.svelte';
</script>

<WalletTestSuite />
```

Este componente permite:
- Simular conexión y desconexión de wallet
- Configurar estados (carga, error, etc.)
- Simular envío de transacciones
- Ver el estado del store en tiempo real

Puedes acceder a la página de pruebas completa en la ruta `/wallet/test`.
