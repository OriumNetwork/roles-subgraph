import { BigInt } from '@graphprotocol/graph-ts'
import { Account, Nft } from '../../generated/schema'
import { generateId } from '../../src/utils/helper'

function createMockNft(tokenId: string, tokenAddress: string, ownerAddress: string): Nft {
  const nft = new Nft(generateId(tokenId, tokenAddress))
  nft.address = tokenAddress
  nft.tokenId = BigInt.fromString(tokenId)

  const nftOwner = new Account(ownerAddress)
  nftOwner.save()

  nft.owner = nftOwner.id
  nft.save()

  return nft
}

export { createMockNft }
