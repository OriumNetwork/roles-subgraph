import { assert, describe, test, clearStore, afterAll } from 'matchstick-as'
import { BigInt } from '@graphprotocol/graph-ts'
import { handleTransfer } from '../../src/erc-721'
import { generateERC721NftId } from '../../utils'
import { createTransferEvent } from '../mocks/events'
import { Addresses, ZERO_ADDRESS } from '../helpers/contants'

const tokenId = BigInt.fromI32(1)

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
