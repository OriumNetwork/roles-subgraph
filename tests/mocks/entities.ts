import { BigInt } from '@graphprotocol/graph-ts'
import { Account, Nft } from '../../generated/schema'
import { ZERO_ADDRESS } from '../../src/utils/constants'
import { generateId } from '../../src/utils/helper'

function createMockNft(tokenId: string): Nft {
  const nft = new Nft(generateId(tokenId, ZERO_ADDRESS))
  nft.address = ZERO_ADDRESS
  nft.tokenId = BigInt.fromString(tokenId)

  const nftOwner = new Account(ZERO_ADDRESS)
  nftOwner.save()

  nft.owner = nftOwner.id
  nft.save()

  return nft
}

export { createMockNft }
