import { BigInt } from '@graphprotocol/graph-ts'
import { NftCollection } from '../../../generated/schema'
import { ONE, ZERO_ADDRESS } from '../../constants'
import { NftType } from '../../enums'

export { generateERC721NftId, upsertERC721Nft } from './erc-721'
export { generateERC1155NftId, upsertERC1155Nft, findOrCreateERC1155Nft } from './erc-1155'

export function upsertNftCollection(
  nftType: string,
  tokenAddress: string,
  tokenId: BigInt,
  from: string,
  to: string,
): NftCollection {
  let collection = NftCollection.load(tokenAddress)
  if (!collection) {
    collection = new NftCollection(tokenAddress)
    collection.type = nftType
    collection.tokenIdCount = BigInt.zero()
    collection.tokenIds = []
  }

  if (nftType == NftType.ERC721) {
    // ERC-721 might burn tokens and remove them from the tokenIds list
    collection = updateERC721Collection(collection, from, to, tokenId)
  } else if (nftType == NftType.ERC1155) {
    // ERC-1155 may also burn tokens, but it would not make sense to remove them from the list
    collection = updateERC1155Collection(collection, tokenId)
  }

  collection.save()
  return collection
}

function updateERC1155Collection(collection: NftCollection, tokenId: BigInt): NftCollection {
  if (!collection.tokenIds.includes(tokenId)) {
    // if it does not include tokenId
    // add tokenId to list
    const tokenIds = collection.tokenIds
    tokenIds.push(tokenId)
    collection.tokenIds = tokenIds
    // increment tokenIdCount
    collection.tokenIdCount = collection.tokenIdCount.plus(ONE)
  }
  return collection
}

function updateERC721Collection(collection: NftCollection, from: string, to: string, tokenId: BigInt): NftCollection {
  if (from == ZERO_ADDRESS) {
    if (to == ZERO_ADDRESS) {
      // mint and burn event
      // do nothing
      return collection
    } else if (!collection.tokenIds.includes(tokenId)) {
      // mint event
      // if it does not include tokenId
      // add tokenId to list
      const tokenIds = collection.tokenIds
      tokenIds.push(tokenId)
      collection.tokenIds = tokenIds
      // increment tokenIdCount
      collection.tokenIdCount = collection.tokenIdCount.plus(ONE)
    }
  } else if (to == ZERO_ADDRESS) {
    // burn event
    if (collection.tokenIds.includes(tokenId)) {
      // if it does include tokenId
      // remove tokenId from list
      collection.tokenIds = removeAllOccurrencesOf(collection.tokenIds, tokenId)
      // decrement tokenIdCount
      const newAmount = collection.tokenIdCount.minus(ONE)
      collection.tokenIdCount = newAmount.lt(BigInt.zero()) ? BigInt.zero() : newAmount
    }
  } else if (!collection.tokenIds.includes(tokenId)) {
    // transfer from one user to another
    // if it does not include tokenId
    // add tokenId to list
    const tokenIds = collection.tokenIds
    tokenIds.push(tokenId)
    collection.tokenIds = tokenIds
    // increment tokenIdCount
    collection.tokenIdCount = collection.tokenIdCount.plus(ONE)
  }
  return collection
}

function removeAllOccurrencesOf(array: Array<BigInt>, value: BigInt): Array<BigInt> {
  let index = array.indexOf(value)
  while (index > -1) {
    if (array.length > 1) {
      array[index] = array[array.length - 1]
    }
    array.pop()
    index = array.indexOf(value)
  }
  return array
}
