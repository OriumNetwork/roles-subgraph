# Orium NFT Roles Subgraph

[![Discord](https://img.shields.io/discord/1009147970832322632?label=discord&logo=discord&logoColor=white)](https://discord.gg/NaNTgPK5rx)
[![Twitter Follow](https://img.shields.io/twitter/follow/oriumnetwork?label=Follow&style=social)](https://twitter.com/OriumNetwork)

Orium NFT Roles Subgraph is a subgraph for the Orium Roles Register Contracts.

## Get Started

```shell
npm ci
npm run test-goerli
```

## Generate Schema (goerli)

To generate schema for a subgraph in a different network, **goerli** just change the network parameter to the preference.

**goerli**

```shell
cp subgraph-goerli.yaml subgraph.yaml && graph codegen subgraph.yaml
```

## Build (mumbai/polygon)

To build a subgraph in a different network, **goerli**, just change the network parameter to the preference.

**goerli**

```shell
cp graph build subgraph.yaml
```

## Deploy subgraph (mumbai/polygon)

To deploy contract in a different network, **goerli** or **goerli**, just change the network parameter to the preference.

**goerli**

```shell
graph deploy --node https://api.thegraph.com/deploy/ orium-network/nft-roles-goerli
```