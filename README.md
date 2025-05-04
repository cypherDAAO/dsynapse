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
