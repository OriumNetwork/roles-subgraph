import { assert, describe, test, clearStore, afterEach } from 'matchstick-as'
import { NftType, generateERC1155NftId } from '../../utils'
import { createTransferBatchEvent } from '../helpers/events'
import { Addresses, Amounts, TokenIds, ZERO_ADDRESS } from '../helpers/contants'
import { handleTransferBatch } from '../../src/erc1155'

describe('ERC-1155 Transfer Batch Handler', () => {
  afterEach(() => {
    clearStore()
  })

  describe('When NFT does not exist', () => {
    test('should create NFT and Account when NFT and Account does not exist', () => {
      assert.entityCount('Nft', 0)
      assert.entityCount('Account', 0)

      const event = createTransferBatchEvent(Addresses[0], Addresses[0], Addresses[1], TokenIds, Amounts, ZERO_ADDRESS)
      handleTransferBatch(event)

      for (let i = 0; i < event.params.ids.length; i++) {
        const tokenId = event.params.ids[i]
        const _id = generateERC1155NftId(event.address.toHexString(), tokenId, event.params.to.toHexString())
        assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
        assert.fieldEquals('Nft', _id, 'tokenId', TokenIds[i].toString())
        assert.fieldEquals('Nft', _id, 'owner', Addresses[1])
        assert.fieldEquals('Nft', _id, 'amount', Amounts[i].toString())
        assert.fieldEquals('Nft', _id, 'type', NftType.ERC1155)
      }
    })

    test('should transfer NFT and create Account when NFT exist Account does not', () => {
      assert.entityCount('Nft', 0)
      assert.entityCount('Account', 0)

      const event = createTransferBatchEvent(Addresses[0], Addresses[0], Addresses[1], TokenIds, Amounts, ZERO_ADDRESS)
      handleTransferBatch(event)

      assert.entityCount('Nft', TokenIds.length)
      assert.entityCount('Account', 2)

      for (let i = 0; i < event.params.ids.length; i++) {
        const tokenId = event.params.ids[i]
        const _id = generateERC1155NftId(event.address.toHexString(), tokenId, event.params.to.toHexString())
        assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
        assert.fieldEquals('Nft', _id, 'tokenId', TokenIds[i].toString())
        assert.fieldEquals('Nft', _id, 'owner', Addresses[1])
        assert.fieldEquals('Nft', _id, 'amount', Amounts[i].toString())
        assert.fieldEquals('Nft', _id, 'type', NftType.ERC1155)
      }
    })
  })

  describe('When NFT or Account exists', () => {
    test('should only transfer NFT when NFT and Account exist', () => {
      assert.entityCount('Nft', 0)
      assert.entityCount('Account', 0)

      const event = createTransferBatchEvent(Addresses[0], Addresses[0], Addresses[1], TokenIds, Amounts, ZERO_ADDRESS)
      handleTransferBatch(event)

      assert.entityCount('Nft', TokenIds.length)
      assert.entityCount('Account', 2)

      for (let i = 0; i < event.params.ids.length; i++) {
        const tokenId = event.params.ids[i]
        const _id = generateERC1155NftId(event.address.toHexString(), tokenId, event.params.to.toHexString())
        assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
        assert.fieldEquals('Nft', _id, 'tokenId', TokenIds[i].toString())
        assert.fieldEquals('Nft', _id, 'owner', Addresses[1])
        assert.fieldEquals('Nft', _id, 'amount', Amounts[i].toString())
        assert.fieldEquals('Nft', _id, 'type', NftType.ERC1155)
      }
    })

    test('should transfer NFT and update amount after two transfers', () => {
      const event = createTransferBatchEvent(Addresses[0], Addresses[0], Addresses[1], TokenIds, Amounts, ZERO_ADDRESS)
      handleTransferBatch(event)
      for (let i = 0; i < event.params.ids.length; i++) {
        const tokenId = event.params.ids[i]
        const _id = generateERC1155NftId(event.address.toHexString(), tokenId, event.params.to.toHexString())
        assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
        assert.fieldEquals('Nft', _id, 'tokenId', TokenIds[i].toString())
        assert.fieldEquals('Nft', _id, 'owner', Addresses[1])
        assert.fieldEquals('Nft', _id, 'amount', Amounts[i].toString())
        assert.fieldEquals('Nft', _id, 'type', NftType.ERC1155)
      }

      const event2 = createTransferBatchEvent(Addresses[0], Addresses[1], Addresses[2], TokenIds, Amounts, ZERO_ADDRESS)
      handleTransferBatch(event2)
      for (let i = 0; i < event2.params.ids.length; i++) {
        const tokenId = event2.params.ids[i]
        const _id2 = generateERC1155NftId(event2.address.toHexString(), tokenId, event2.params.to.toHexString())
        assert.fieldEquals('Nft', _id2, 'tokenAddress', ZERO_ADDRESS)
        assert.fieldEquals('Nft', _id2, 'tokenId', TokenIds[i].toString())
        assert.fieldEquals('Nft', _id2, 'owner', Addresses[2])
        assert.fieldEquals('Nft', _id2, 'amount', Amounts[i].toString())
        assert.fieldEquals('Nft', _id2, 'type', NftType.ERC1155)
      }
    })
  })
})
