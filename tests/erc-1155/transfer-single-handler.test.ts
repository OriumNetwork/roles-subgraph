import { assert, describe, test, clearStore, afterEach } from 'matchstick-as'
import { NftType, generateERC1155NftId } from '../../utils'
import { createTransferSingleEvent } from '../mocks/events'
import { Addresses, Amounts, TokenIds, ZERO_ADDRESS } from '../helpers/contants'
import { handleTransferSingle } from '../../src/erc-1155'

describe('ERC-1155 Transfer Single Handler', () => {
  afterEach(() => {
    clearStore()
  })
  describe('When NFT does not exist', () => {
    test('should create NFT and Account when NFT and Account does not exist', () => {
      assert.entityCount('Nft', 0)
      assert.entityCount('Account', 0)

      const event = createTransferSingleEvent(
        Addresses[0],
        Addresses[0],
        Addresses[1],
        TokenIds[0],
        Amounts[0],
        ZERO_ADDRESS,
      )
      handleTransferSingle(event)

      const _id = generateERC1155NftId(event.address.toHexString(), event.params.id, event.params.to.toHexString())
      assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
      assert.fieldEquals('Nft', _id, 'tokenId', TokenIds[0].toString())
      assert.fieldEquals('Nft', _id, 'owner', Addresses[1])
      assert.fieldEquals('Nft', _id, 'amount', Amounts[0].toString())
      assert.fieldEquals('Nft', _id, 'type', NftType.ERC1155)
    })

    test('should transfer NFT and create Account when NFT exist Account does not', () => {
      assert.entityCount('Nft', 0)
      assert.entityCount('Account', 0)

      const event = createTransferSingleEvent(
        Addresses[0],
        Addresses[0],
        Addresses[1],
        TokenIds[0],
        Amounts[0],
        ZERO_ADDRESS,
      )
      handleTransferSingle(event)

      assert.entityCount('Nft', 1)
      assert.entityCount('Account', 2)

      const _id = generateERC1155NftId(event.address.toHexString(), event.params.id, event.params.to.toHexString())
      assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
      assert.fieldEquals('Nft', _id, 'tokenId', TokenIds[0].toString())
      assert.fieldEquals('Nft', _id, 'owner', Addresses[1])
      assert.fieldEquals('Nft', _id, 'amount', Amounts[0].toString())
      assert.fieldEquals('Nft', _id, 'type', NftType.ERC1155)
    })
  })
  describe('When NFT or Account exists', () => {
    test('should only transfer NFT when NFT and Account exist', () => {
      assert.entityCount('Nft', 0)
      assert.entityCount('Account', 0)

      const event = createTransferSingleEvent(
        Addresses[0],
        Addresses[0],
        Addresses[1],
        TokenIds[0],
        Amounts[0],
        ZERO_ADDRESS,
      )
      handleTransferSingle(event)

      assert.entityCount('Nft', 1)
      assert.entityCount('Account', 2)

      const _id = generateERC1155NftId(event.address.toHexString(), event.params.id, event.params.to.toHexString())
      assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
      assert.fieldEquals('Nft', _id, 'tokenId', TokenIds[0].toString())
      assert.fieldEquals('Nft', _id, 'owner', Addresses[1])
      assert.fieldEquals('Nft', _id, 'amount', Amounts[0].toString())
      assert.fieldEquals('Nft', _id, 'type', NftType.ERC1155)
    })

    test('should transfer NFT and update amount after two transfers', () => {
      const event = createTransferSingleEvent(
        Addresses[0],
        Addresses[0],
        Addresses[1],
        TokenIds[0],
        Amounts[1],
        ZERO_ADDRESS,
      )
      handleTransferSingle(event)

      const _id = generateERC1155NftId(event.address.toHexString(), event.params.id, event.params.to.toHexString())
      assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
      assert.fieldEquals('Nft', _id, 'tokenId', TokenIds[0].toString())
      assert.fieldEquals('Nft', _id, 'owner', Addresses[1])
      assert.fieldEquals('Nft', _id, 'amount', Amounts[1].toString())
      assert.fieldEquals('Nft', _id, 'type', NftType.ERC1155)

      const event2 = createTransferSingleEvent(
        Addresses[0],
        Addresses[1],
        Addresses[2],
        TokenIds[0],
        Amounts[0],
        ZERO_ADDRESS,
      )
      handleTransferSingle(event2)

      const _id2 = generateERC1155NftId(event2.address.toHexString(), event2.params.id, event2.params.to.toHexString())
      assert.fieldEquals('Nft', _id2, 'tokenAddress', ZERO_ADDRESS)
      assert.fieldEquals('Nft', _id2, 'tokenId', TokenIds[0].toString())
      assert.fieldEquals('Nft', _id2, 'owner', Addresses[2])
      assert.fieldEquals('Nft', _id2, 'amount', Amounts[0].toString())
      assert.fieldEquals('Nft', _id2, 'type', NftType.ERC1155)
    })
  })
})
