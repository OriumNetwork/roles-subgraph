import { NftType } from '../../enums'
import { Account, Nft } from '../../../generated/schema'
import { findOrCreateAccount } from '../account'
import { Address, BigInt, store } from '@graphprotocol/graph-ts'

export function generateERC1155NftId(tokenAddress: string, tokenId: BigInt, ownerAddress: string): string {
  return tokenAddress + '-' + tokenId.toString() + '-' + ownerAddress
}

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

export function updateERC1155Balance(from: Account, to: Account, toNft: Nft, amount: BigInt): Nft {
  if (from.id != Address.zero().toHex()) {
    const fromNft = findOrCreateERC1155Nft(toNft.tokenAddress, toNft.tokenId, from)

    // remove if the decudecting amount is 0
    if (!fromNft.amount || fromNft.amount!.minus(amount).equals(BigInt.fromI32(0))) {
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

  return toNft
}
