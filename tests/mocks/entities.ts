import { BigInt } from '@graphprotocol/graph-ts'
import { Nft } from '../../generated/schema'
import { ZERO_ADDRESS } from '../../src/utils/constants'

function createMockNft(tokenId: string): Nft {
  const nft = new Nft('1')
  nft.address = ZERO_ADDRESS
  nft.tokenId = BigInt.fromString(tokenId)
  nft.currentOwner = ZERO_ADDRESS
  nft.previousOwner = ZERO_ADDRESS
  nft.originalOwner = ZERO_ADDRESS
  nft.save()

  return nft
}

export { createMockNft }
