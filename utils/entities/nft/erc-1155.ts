import { NftType } from '../../enums'
import { Account, Nft } from '../../../generated/schema'
import { findOrCreateAccount } from '../account'
import { Address, BigInt, store } from '@graphprotocol/graph-ts'

/**
 * @notice Generate an ERC1155 NFT id.
 * @dev Make sure the owner address is lowercase and it was created/exist as an Account before calling this function.
 * @param tokenAddress The token address of the ERC1155 NFT.
 * @param tokenId The token id of the ERC1155 NFT.
 * @param ownerAddress The owner address of the ERC1155 NFT.
 * @returns The ERC1155 NFT id.
 */
export function generateERC1155NftId(tokenAddress: string, tokenId: BigInt, ownerAddress: string): string {
  return tokenAddress + '-' + tokenId.toString() + '-' + ownerAddress
}

/**
 * @notice Find or create an ERC1155 NFT.
 * @dev The id of the ERC1155 NFT is generated using the token address, the token id and the owner address.
 * @dev For existing NFTs, the amount is updated for each parties (from and to).
 * @param tokenAddress The token address of the ERC1155 NFT.
 * @param tokenId The token id of the ERC1155 NFT.
 * @param amount The amount of the ERC1155 NFT.
 * @param from The previous owner of the ERC1155 NFT.
 * @param to The new owner of the ERC1155 NFT.
 * @returns The ERC1155 NFT entity created (or found).
 */
export function upsertERC1155Nft(tokenAddress: string, tokenId: BigInt, amount: BigInt, from: string, to: string): Nft {
  const nftId = generateERC1155NftId(tokenAddress, tokenId, to)

  let nft = Nft.load(nftId)
  if (!nft) {
    nft = new Nft(nftId)
    nft.tokenId = tokenId
    nft.tokenAddress = tokenAddress
    nft.owner = findOrCreateAccount(to).id
    nft.type = NftType.ERC1155
  }

  return updateERC1155Balance(findOrCreateAccount(from), findOrCreateAccount(to), nft, amount)
}

/**
 * @notice Find or create an ERC1155 NFT.
 * @dev The id of the ERC1155 NFT is generated using the token address, the token id and the owner address.
 * @param tokenAddress The token address of the ERC1155 NFT.
 * @param tokenId The token id of the ERC1155 NFT.
 * @param to The owner of the ERC1155 NFT.
 * @returns The ERC1155 NFT entity created (or found).
 */
export function findOrCreateERC1155Nft(tokenAddress: string, tokenId: BigInt, to: Account): Nft {
  const nftId = generateERC1155NftId(tokenAddress, tokenId, to.id)

  let nft = Nft.load(nftId)
  if (!nft) {
    nft = new Nft(nftId)
    nft.tokenId = tokenId
    nft.tokenAddress = tokenAddress
    nft.type = NftType.ERC1155
    nft.owner = to.id
    nft.save()
  }

  return nft
}
/**
 * @notice Update the balance of an ERC1155 NFT.
 * @dev from, to and toNft should be created/exist before calling this function.
 * @dev If the amount is 0 for either from or to accounts, the NFT is removed.
 * @dev If from is the zero address or fromNft does not exist, only toNft is updated.
 * @param from The previous owner of the ERC1155 NFT.
 * @param to The new owner of the ERC1155 NFT.
 * @param toNft The ERC1155 NFT to update.
 * @param amount The amount of the ERC1155 NFT.
 * @returns The ERC1155 NFT entity updated (or removed).
 */
export function updateERC1155Balance(from: Account, to: Account, toNft: Nft, amount: BigInt): Nft {
  const fromNft = findOrCreateERC1155Nft(toNft.tokenAddress, toNft.tokenId, from)

  if (from.id != Address.zero().toHex() && fromNft) {
    const newAmount = fromNft.amount ? fromNft.amount!.minus(amount) : BigInt.zero()

    // remove if the decudecting amount is 0
    if (newAmount.lt(BigInt.fromI32(0)) || newAmount.equals(BigInt.zero())) {
      store.remove('Nft', fromNft.id)
    } else {
      fromNft.amount = newAmount
      fromNft.save()
    }
  }

  if (to.id != Address.zero().toHex()) {
    // add to account
    if (!toNft.amount) toNft.amount = amount
    else toNft.amount = toNft.amount!.plus(amount)
    toNft.save()
  }

  return toNft
}
