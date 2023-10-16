import { BigInt } from '@graphprotocol/graph-ts'
import { Account, Nft } from '../../generated/schema'
import { generateNftId } from '../../src/utils/helper'

export function createMockNft(tokenAddress: string, tokenId: string, ownerAddress: string): Nft {
  const nft = new Nft(generateNftId(tokenId, tokenAddress))
  nft.address = tokenAddress
  nft.tokenId = BigInt.fromString(tokenId)

  const nftOwner = createMockAccount(ownerAddress)

  nft.owner = nftOwner.id
  nft.save()
  return nft
}

export function createMockAccount(ethAddress: string): Account {
  const account = new Account(ethAddress)
  account.save()
  return account
}
