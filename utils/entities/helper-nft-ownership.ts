import { HelperNftOwnership, Nft } from '../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

/**
  @notice Generate HelperNftOwnership id.
  @dev The id of the HelperNftOwnership is generated using the token address, the token id, and the owner address.
 * @param tokenAddress The token address of the ERC721 NFT.
 * @param tokenId The token id of the ERC721 NFT.
 * @param owner The owner of the ERC721 NFT.
 */
export function generateHelperNftOwnershipId(tokenAddress: string, tokenId: BigInt, owner: string): string {
  return tokenAddress + tokenId.toString() + owner
}

/**
 * @notice Insert or update an HelperNftOwnership.
 * @dev It updates the "isSameOwner" as a way to check if the owner is the same.
 * @param nft The nft of the given entity.
 * @param owner The owner to be checked.
 */
export function upsertHelperNftOwnership(nft: Nft, owner: string): HelperNftOwnership {
  const helperNftOwnershipId = generateHelperNftOwnershipId(nft.tokenAddress, nft.tokenId, owner)
  let helperNftOwnership = HelperNftOwnership.load(helperNftOwnershipId)
  if (!helperNftOwnership) {
    helperNftOwnership = new HelperNftOwnership(helperNftOwnershipId)
    helperNftOwnership.nft = nft.id
    helperNftOwnership.originalOwner = nft.owner
  }
  helperNftOwnership.isSameOwner = nft.owner == owner
  helperNftOwnership.save()
  return helperNftOwnership
}
