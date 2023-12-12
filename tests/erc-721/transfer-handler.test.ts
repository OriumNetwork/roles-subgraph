import { assert, describe, test, clearStore, afterAll, beforeEach, afterEach } from 'matchstick-as'
import { BigInt } from '@graphprotocol/graph-ts'
import { handleTransfer } from '../../src/erc-721'
import { NftType, generateERC721NftId, generateHelperNftOwnershipId, upsertHelperNftOwnership } from '../../utils'
import { createTransferEvent } from '../mocks/events'
import { Addresses, ZERO_ADDRESS } from '../helpers/contants'
import { MockAddresses } from '../mocks/values'
import { Nft } from '../../generated/schema'

const originalOwnerAddress = MockAddresses[0]
const newOwnerAddress = MockAddresses[1]
const tokenAddress = MockAddresses[2]
const tokenId = BigInt.fromI32(1)
const nftId = generateERC721NftId(tokenAddress, tokenId)

let nft: Nft

describe('ERC-721 Transfer Handler', () => {
  afterAll(() => {
    clearStore()
  })

  test('should create NFT and Account when NFT and Account does not exist', () => {
    assert.entityCount('Nft', 0)
    assert.entityCount('Account', 0)

    const event = createTransferEvent(Addresses[0], Addresses[1], tokenId.toString(), ZERO_ADDRESS)
    handleTransfer(event)

    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 1)

    const _id = generateERC721NftId(event.address.toHexString(), event.params.tokenId)
    assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
    assert.fieldEquals('Nft', _id, 'tokenId', tokenId.toString())
    assert.fieldEquals('Nft', _id, 'owner', Addresses[1])
  })

  test('should transfer NFT and create Account when NFT exist Account does not', () => {
    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 1)

    const event = createTransferEvent(Addresses[1], Addresses[2], tokenId.toString(), ZERO_ADDRESS)
    handleTransfer(event)

    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 2)

    const _id = generateERC721NftId(event.address.toHexString(), event.params.tokenId)
    assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
    assert.fieldEquals('Nft', _id, 'tokenId', tokenId.toString())
    assert.fieldEquals('Nft', _id, 'owner', Addresses[2])
  })

  test('should only transfer NFT when NFT and Account exist', () => {
    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 2)

    const event = createTransferEvent(Addresses[0], Addresses[2], tokenId.toString(), ZERO_ADDRESS)
    handleTransfer(event)

    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 2)

    const _id = generateERC721NftId(event.address.toHexString(), event.params.tokenId)
    assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
    assert.fieldEquals('Nft', _id, 'tokenId', tokenId.toString())
    assert.fieldEquals('Nft', _id, 'owner', Addresses[2])
  })
})

describe('HelperNftOwnership', () => {
  beforeEach(() => {
    nft = new Nft(nftId)
    nft.tokenAddress = tokenAddress
    nft.tokenId = tokenId
    nft.owner = originalOwnerAddress
    nft.type = NftType.ERC721
    nft.save()
  })

  test('Should change "isSameOwner" to false when NFT is transferred', () => {
    const helperNftOwnership = upsertHelperNftOwnership(nft, nft.owner)
    assert.entityCount('HelperNftOwnership', 1)
    assert.fieldEquals('HelperNftOwnership', helperNftOwnership.id, 'isSameOwner', 'true')

    const event = createTransferEvent(originalOwnerAddress, newOwnerAddress, tokenId.toString(), tokenAddress)
    handleTransfer(event)

    assert.entityCount('HelperNftOwnership', 2)
    assert.fieldEquals('HelperNftOwnership', helperNftOwnership.id, 'isSameOwner', 'false')
    assert.fieldEquals(
      'HelperNftOwnership',
      generateHelperNftOwnershipId(tokenAddress, tokenId, newOwnerAddress),
      'isSameOwner',
      'true',
    )
  })

  afterEach(() => {
    clearStore()
  })
})
