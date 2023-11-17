import { assert, describe, test, clearStore, afterAll } from 'matchstick-as'
import { handleTransfer } from '../../src/erc721'
import { generateERC721NftId } from '../../utils'
import { createTransferEvent } from '../helpers/events'
import { Addresses, ZERO_ADDRESS } from '../helpers/contants'
import { NftType } from '../../utils'

const tokenIds = ['123', '456', '789']
const tokenAddress = ZERO_ADDRESS

describe('ERC-721 Transfer Handler', () => {
  afterAll(() => {
    clearStore()
  })

  test('should create NFT and Account when NFT and Account does not exist', () => {
    assert.entityCount('Nft', 0)
    assert.entityCount('Account', 0)
    assert.entityCount('NftCollection', 0)

    const event = createTransferEvent(Addresses[0], Addresses[1], tokenIds[0], ZERO_ADDRESS)
    handleTransfer(event)

    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 1)
    assert.entityCount('NftCollection', 1)

    const _id = generateERC721NftId(event.address.toHexString(), event.params.tokenId)
    assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
    assert.fieldEquals('Nft', _id, 'tokenId', tokenIds[0])
    assert.fieldEquals('Nft', _id, 'owner', Addresses[1])

    const collectionId = event.address.toHexString()
    assert.fieldEquals('NftCollection', collectionId, 'type', NftType.ERC721)
    assert.fieldEquals('NftCollection', collectionId, 'tokenIdCount', '1')
    assert.fieldEquals('NftCollection', collectionId, 'tokenIds', `[${tokenIds[0]}]`)
  })

  test('should transfer NFT and create Account when NFT exist Account does not', () => {
    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 1)
    assert.entityCount('NftCollection', 1)

    const event = createTransferEvent(Addresses[1], Addresses[2], tokenIds[0], ZERO_ADDRESS)
    handleTransfer(event)

    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 2)
    assert.entityCount('NftCollection', 1)

    const _id = generateERC721NftId(event.address.toHexString(), event.params.tokenId)
    assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
    assert.fieldEquals('Nft', _id, 'tokenId', tokenIds[0])
    assert.fieldEquals('Nft', _id, 'owner', Addresses[2])

    const collectionId = event.address.toHexString()
    assert.fieldEquals('NftCollection', collectionId, 'type', NftType.ERC721)
    assert.fieldEquals('NftCollection', collectionId, 'tokenIdCount', '1')
    assert.fieldEquals('NftCollection', collectionId, 'tokenIds', `[${tokenIds[0]}]`)
  })

  test('should only transfer NFT when NFT and Account exist', () => {
    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 2)
    assert.entityCount('NftCollection', 1)

    const event = createTransferEvent(Addresses[0], Addresses[2], tokenIds[0], ZERO_ADDRESS)
    handleTransfer(event)

    assert.entityCount('Nft', 1)
    assert.entityCount('Account', 2)
    assert.entityCount('NftCollection', 1)

    const _id = generateERC721NftId(event.address.toHexString(), event.params.tokenId)
    assert.fieldEquals('Nft', _id, 'tokenAddress', ZERO_ADDRESS)
    assert.fieldEquals('Nft', _id, 'tokenId', tokenIds[0])
    assert.fieldEquals('Nft', _id, 'owner', Addresses[2])

    const collectionId = event.address.toHexString()
    assert.fieldEquals('NftCollection', collectionId, 'type', NftType.ERC721)
    assert.fieldEquals('NftCollection', collectionId, 'tokenIdCount', '1')
    assert.fieldEquals('NftCollection', collectionId, 'tokenIds', `[${tokenIds[0]}]`)
  })
})

describe('ERC-721 Nft Collection', () => {
  afterAll(() => {
    clearStore()
  })

  test('should create NftCollection with zero data when from and to are zero address', () => {
    assert.entityCount('NftCollection', 0)

    const event = createTransferEvent(ZERO_ADDRESS, ZERO_ADDRESS, tokenIds[0], tokenAddress)
    handleTransfer(event)

    assert.entityCount('NftCollection', 1)
    assert.fieldEquals('NftCollection', tokenAddress, 'type', NftType.ERC721)
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIdCount', '0')
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIds', '[]')
  })

  test('should add tokenId to NftCollection when mint event', () => {
    const event = createTransferEvent(ZERO_ADDRESS, Addresses[0], tokenIds[0], tokenAddress)
    handleTransfer(event)

    assert.entityCount('NftCollection', 1)
    assert.fieldEquals('NftCollection', tokenAddress, 'type', NftType.ERC721)
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIdCount', '1')
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIds', `[${tokenIds[0]}]`)
  })

  test('should add tokenId to NftCollection when transfer between accounts', () => {
    const event = createTransferEvent(Addresses[0], Addresses[1], tokenIds[1], tokenAddress)
    handleTransfer(event)

    assert.entityCount('NftCollection', 1)
    assert.fieldEquals('NftCollection', tokenAddress, 'type', NftType.ERC721)
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIdCount', '2')
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIds', `[${tokenIds[0]}, ${tokenIds[1]}]`)
  })

  test('should remove tokenId from NftCollection when burn event', () => {
    let event = createTransferEvent(Addresses[0], ZERO_ADDRESS, tokenIds[1], tokenAddress)
    handleTransfer(event)

    assert.entityCount('NftCollection', 1)
    assert.fieldEquals('NftCollection', tokenAddress, 'type', NftType.ERC721)
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIdCount', '1')
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIds', `[${tokenIds[0]}]`)

    event = createTransferEvent(Addresses[0], ZERO_ADDRESS, tokenIds[0], tokenAddress)
    handleTransfer(event)

    assert.entityCount('NftCollection', 1)
    assert.fieldEquals('NftCollection', tokenAddress, 'type', NftType.ERC721)
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIdCount', '0')
    assert.fieldEquals('NftCollection', tokenAddress, 'tokenIds', '[]')
  })
})
