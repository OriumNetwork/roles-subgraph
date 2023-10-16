import { BigInt } from '@graphprotocol/graph-ts'
import { Account, Nft } from '../../generated/schema'
import { generateNftId } from '../../src/utils/helper'

export function createMockNft(tokenId: string, tokenAddress: string, ownerAddress: string): Nft {
  const nft = new Nft(generateNftId(tokenId, tokenAddress))
  nft.address = tokenAddress
  nft.tokenId = BigInt.fromString(tokenId)

  const nftOwner = new Account(ownerAddress)
  nftOwner.save()

  nft.owner = nftOwner.id
  nft.save()

  return nft
}

export function createMockAccount(address: string): Account {
  const account = new Account(address)
  account.save()

  return account
}
