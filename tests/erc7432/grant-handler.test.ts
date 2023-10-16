import { assert, describe, test, clearStore, afterEach } from 'matchstick-as'
import { createNewRoleGrantedEvent } from '../helpers/events'
import { handleRoleGranted } from '../../src/erc7432'
import { Addresses, ZERO_ADDRESS } from '../helpers/contants'
import { Bytes } from '@graphprotocol/graph-ts'
import { createMockAccount, createMockNft } from '../helpers/entities'

const RoleId = Bytes.fromUTF8('0xGrantRole').toHex()
const tokenAddress = Addresses[0]
const tokenId = '123'
const grantee = Addresses[1]
const grantor = Addresses[2]
const revocable = true
const data = '0x1234567890'
const expirationDate = '99999'

describe('ERC-7432 RoleGranted Handler', () => {
  afterEach(() => {
    clearStore()
  })

  test('should not grant role when NFT does not exist', () => {
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 0)

    const event = createNewRoleGrantedEvent(
      RoleId,
      tokenId,
      tokenAddress,
      grantee,
      grantor,
      expirationDate,
      revocable,
      data,
      ZERO_ADDRESS,
    )
    handleRoleGranted(event)

    assert.entityCount('Role', 0)
    assert.entityCount('Account', 0)
  })

  test('should not grant role when grantor does not exist', () => {
    createMockNft(tokenAddress, tokenId, Addresses[0])
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 1)

    const event = createNewRoleGrantedEvent(
      RoleId,
      tokenId,
      tokenAddress,
      grantee,
      grantor,
      expirationDate,
      revocable,
      data,
      ZERO_ADDRESS,
    )
    handleRoleGranted(event)

    assert.entityCount('Role', 0)
    assert.entityCount('Account', 1)
  })

  test('should not grant role if grantor is not NFT owner', () => {
    createMockNft(tokenAddress, tokenId, Addresses[0])
    createMockAccount(grantor)
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 2)

    const event = createNewRoleGrantedEvent(
      RoleId,
      tokenId,
      tokenAddress,
      grantee,
      grantor,
      expirationDate,
      revocable,
      data,
      ZERO_ADDRESS,
    )
    handleRoleGranted(event)

    assert.entityCount('Role', 0)
    assert.entityCount('Account', 2)
  })

  test('should grant multiple roles for the same NFT', () => {
    createMockNft(tokenAddress, tokenId, grantor)
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 1)

    const event1 = createNewRoleGrantedEvent(
      RoleId,
      tokenId,
      tokenAddress,
      Addresses[0],
      grantor,
      expirationDate,
      revocable,
      data,
      ZERO_ADDRESS,
    )
    handleRoleGranted(event1)
    const event2 = createNewRoleGrantedEvent(
      RoleId,
      tokenId,
      tokenAddress,
      Addresses[1],
      grantor,
      expirationDate,
      revocable,
      data,
      ZERO_ADDRESS,
    )
    handleRoleGranted(event2)
    const event3 = createNewRoleGrantedEvent(
      RoleId,
      tokenId,
      tokenAddress,
      Addresses[2],
      grantor,
      expirationDate,
      revocable,
      data,
      ZERO_ADDRESS,
    )
    handleRoleGranted(event3)

    assert.entityCount('Role', 3)
    assert.entityCount('Account', 3)
  })

  test('should grant multiple roles for different NFTs', () => {
    const tokenId1 = '123'
    const tokenId2 = '456'
    const tokenId3 = '789'

    createMockNft(tokenAddress, tokenId1, grantor)
    createMockNft(tokenAddress, tokenId2, grantor)
    createMockNft(tokenAddress, tokenId3, grantor)
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 1)

    const event1 = createNewRoleGrantedEvent(
      RoleId,
      tokenId1,
      tokenAddress,
      Addresses[0],
      grantor,
      expirationDate,
      revocable,
      data,
      ZERO_ADDRESS,
    )
    handleRoleGranted(event1)
    const event2 = createNewRoleGrantedEvent(
      RoleId,
      tokenId2,
      tokenAddress,
      Addresses[1],
      grantor,
      expirationDate,
      revocable,
      data,
      ZERO_ADDRESS,
    )
    handleRoleGranted(event2)
    const event3 = createNewRoleGrantedEvent(
      RoleId,
      tokenId3,
      tokenAddress,
      Addresses[2],
      grantor,
      expirationDate,
      revocable,
      data,
      ZERO_ADDRESS,
    )
    handleRoleGranted(event3)

    assert.entityCount('Role', 3)
    assert.entityCount('Account', 3)
  })
})
