# Orium NFT Roles Subgraph

[![License: CC0 v1](https://img.shields.io/badge/License-CC0v1-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/legalcode)
![Github Badge](https://github.com/OriumNetwork/roles-subgraph/actions/workflows/master.yaml/badge.svg)
[![Discord](https://img.shields.io/discord/1009147970832322632?label=discord&logo=discord&logoColor=white)](https://discord.gg/NaNTgPK5rx)
[![Twitter Follow](https://img.shields.io/twitter/follow/oriumnetwork?label=Follow&style=social)](https://twitter.com/OriumNetwork)

The Roles Subgraph is a subgraph for tracking the state of [ERC-7432](https://eips.ethereum.org/EIPS/eip-7432) roles.

## Get Started

Get started by installing dependencies, building the project and running the tests.

```shell
npm ci
npm run build:mumbai
npm test
```

## Build Project

Building subgraphs consist in generating the code and building the project against a manifest file. This repository
provides a subgraph manifest for each network supported. You can build the project for **Mumbai** with the following
command:

```shell
npm run build:mumbai
```
