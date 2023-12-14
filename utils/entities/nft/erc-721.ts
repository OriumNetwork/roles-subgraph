import { NftType } from '../../enums'
import { Nft } from '../../../generated/schema'
import { findOrCreateAccount } from '../account'
import { BigInt } from '@graphprotocol/graph-ts'

/**
 * @notice Generate an ERC721 NFT id.
 * @param tokenAddress The token address of the ERC721 NFT.
 * @param tokenId The token id of the ERC721 NFT.
 * @returns The ERC721 NFT id.
 */
export function generateERC721NftId(tokenAddress: string, tokenId: BigInt): string {
  return tokenAddress + '-' + tokenId.toString()
}

/**
 * @notice Find or create an ERC721 NFT.
 * @dev The id of the ERC721 NFT is generated using the token address and the token id.
 * @param tokenAddress The token address of the ERC721 NFT.
 * @param tokenId The token id of the ERC721 NFT.
 * @param to The owner of the ERC721 NFT.
 * @returns The ERC721 NFT entity created (or found).
 */
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
