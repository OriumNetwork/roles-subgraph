import { NftType } from '..'
import { Account, Nft } from '../../generated/schema'
import { findOrCreateAccount } from './account'
import { Address, BigInt, store } from '@graphprotocol/graph-ts'

export function generateERC721NftId(tokenAddress: string, tokenId: BigInt): string {
  return tokenAddress + '-' + tokenId.toString()
}

export function generateERC1155NftId(tokenAddress: string, tokenId: BigInt, ownerAddress: string): string {
  return tokenAddress + '-' + tokenId.toString() + '-' + ownerAddress
}
export function upsertERC721Nft(tokenAddress: string, tokenId: BigInt, to: string): Nft {
  const nftId = generateERC721NftId(tokenAddress, tokenId)

  let nft = Nft.load(nftId)
  if (!nft) {
    nft = new Nft(nftId)
    nft.tokenId = tokenId
    nft.tokenAddress = tokenAddress
    nft.type = NftType.ERC721.toString()
  }

  nft.owner = findOrCreateAccount(to).id
  nft.save()

  return nft
}

export function upsertERC1155Nft(tokenAddress: string, tokenId: BigInt, amount: BigInt, from: string, to: string): Nft {
  const nftId = generateERC1155NftId(tokenAddress, tokenId, to)

  let nft = Nft.load(nftId)
  if (!nft) {
    nft = new Nft(nftId)
    nft.tokenId = tokenId
    nft.tokenAddress = tokenAddress
    nft.owner = findOrCreateAccount(to).id
    nft.type = NftType.ERC1155.toString()
  }

  updateERC1155Balance(findOrCreateAccount(from), findOrCreateAccount(to), nft, amount)

  return nft
}

export function findOrCreateERC1155Nft(tokenAddress: string, tokenId: BigInt, to: Account): Nft {
  const nftId = generateERC1155NftId(tokenAddress, tokenId, to.id)

  let nft = Nft.load(nftId)
  if (!nft) {
    nft = new Nft(nftId)
    nft.tokenId = tokenId
    nft.tokenAddress = tokenAddress
    nft.type = NftType.ERC1155.toString()
    nft.owner = to.id
    nft.save()
  }

  return nft
}

// remove balance from from account if it exists
// add balance to to account if it exists
export function updateERC1155Balance(from: Account, to: Account, toNft: Nft, amount: BigInt): void {
  if (from.id == to.id) return // should never happen

  if (from.id != Address.zero().toHex()) {
    const fromNft = findOrCreateERC1155Nft(toNft.tokenAddress, toNft.tokenId, from)
    if (!fromNft.amount) return store.remove('Nft', fromNft.id) // should never happen

    // remove if the decudecting amount is 0
    if (fromNft.amount!.minus(amount).equals(BigInt.fromI32(0))) {
      store.remove('Nft', fromNft.id)
    } else {
      fromNft.amount = fromNft.amount!.minus(amount)
      fromNft.save()
    }
  }

  if (to.id != Address.zero().toHex()) {
    // add to account
    if (!toNft.amount) toNft.amount = amount
    else toNft.amount = toNft.amount!.plus(amount)
    toNft.save()
  }
}
