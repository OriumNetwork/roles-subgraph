import { BigInt } from '@graphprotocol/graph-ts'
import { Nft } from '../../../generated/schema'
import { NftType } from '../../enums'
import { findOrCreateAccount } from '../account'

export function generateERC721NftId(tokenAddress: string, tokenId: BigInt): string {
  return tokenAddress + '-' + tokenId.toString()
}

export function upsertERC721Nft(tokenAddress: string, tokenId: BigInt, to: string): Nft {
  const nftId = generateERC721NftId(tokenAddress, tokenId)

  let nft = Nft.load(nftId)
  if (!nft) {
    nft = new Nft(nftId)
    nft.tokenId = tokenId
    nft.tokenAddress = tokenAddress
    nft.type = NftType.ERC721
  }

  nft.owner = findOrCreateAccount(to).id
  nft.save()

  return nft
}
