import { assert, describe, test, clearStore, afterEach } from 'matchstick-as'
import { createNewRoleGrantedEvent } from '../helpers/events'
import { handleRoleGranted } from '../../src/erc7432'
import { Addresses, ZERO_ADDRESS } from '../helpers/contants'
import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { createMockAccount, createMockNft, validateRole } from '../helpers/entities'
import { Account } from '../../generated/schema'

const RoleAssignmentId = Bytes.fromUTF8('0xGrantRole')
const tokenAddress = Addresses[0]
const tokenId = '123'
const grantee = Addresses[1]
const grantor = Addresses[2]
const revocable = true
const data = Bytes.fromUTF8('0x1234567890')
const expirationDate = BigInt.fromI32(99999)
const rolesRegistry = ZERO_ADDRESS

describe('ERC-7432 RoleGranted Handler', () => {
  afterEach(() => {
    clearStore()
  })

  test('should not grant roleAssignment when NFT does not exist', () => {
    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Account', 0)

    const event = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenId,
      tokenAddress,
      grantee,
      grantor,
      expirationDate,
      revocable,
      data,
    )
    handleRoleGranted(event)

    assert.entityCount('Role', 0)
    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Account', 0)
  })

  test('should not grant roleAssignment when grantor does not exist', () => {
    createMockNft(tokenAddress, tokenId, Addresses[0])
    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 1)

    const event = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenId,
      tokenAddress,
      grantee,
      grantor,
      expirationDate,
      revocable,
      data,
    )
    handleRoleGranted(event)

    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 1)
  })

  test('should not grant roleAssignment if grantor is not NFT owner', () => {
    createMockNft(tokenAddress, tokenId, Addresses[0])
    createMockAccount(grantor)
    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 2)

    const event = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenId,
      tokenAddress,
      grantee,
      grantor,
      expirationDate,
      revocable,
      data,
    )
    handleRoleGranted(event)

    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 2)
  })

  test('should grant multiple roles for the same NFT', () => {
    const nft = createMockNft(tokenAddress, tokenId, grantor)
    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 1)

    const event1 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenId,
      tokenAddress,
      Addresses[0],
      grantor,
      expirationDate,
      revocable,
      data,
    )
    handleRoleGranted(event1)
    const event2 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenId,
      tokenAddress,
      Addresses[1],
      grantor,
      expirationDate,
      revocable,
      data,
    )
    handleRoleGranted(event2)
    const event3 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenId,
      tokenAddress,
      Addresses[2],
      grantor,
      expirationDate,
      revocable,
      data,
    )
    handleRoleGranted(event3)

    assert.entityCount('RoleAssignment', 3)
    assert.entityCount('Role', 1)
    assert.entityCount('Account', 3)

    const grantorAccount = new Account(grantor)
    validateRole(
      grantorAccount,
      new Account(Addresses[0]),
      nft,
      RoleAssignmentId,
      expirationDate,
      data,
      event1.address.toHex(),
    )
    validateRole(
      grantorAccount,
      new Account(Addresses[1]),
      nft,
      RoleAssignmentId,
      expirationDate,
      data,
      event2.address.toHex(),
    )
    validateRole(
      grantorAccount,
      new Account(Addresses[2]),
      nft,
      RoleAssignmentId,
      expirationDate,
      data,
      event3.address.toHex(),
    )
  })

  test('should grant multiple roles for different NFTs', () => {
    const tokenId1 = '123'
    const tokenId2 = '456'
    const tokenId3 = '789'

    const nft1 = createMockNft(tokenAddress, tokenId1, grantor)
    const nft2 = createMockNft(tokenAddress, tokenId2, grantor)
    const nft3 = createMockNft(tokenAddress, tokenId3, grantor)
    assert.entityCount('RoleAssignment', 0)
    assert.entityCount('Role', 0)
    assert.entityCount('Account', 1)

    const event1 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenId1,
      tokenAddress,
      Addresses[0],
      grantor,
      expirationDate,
      revocable,
      data,
    )
    handleRoleGranted(event1)
    const event2 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenId2,
      tokenAddress,
      Addresses[1],
      grantor,
      expirationDate,
      revocable,
      data,
    )
    handleRoleGranted(event2)
    const event3 = createNewRoleGrantedEvent(
      RoleAssignmentId,
      tokenId3,
      tokenAddress,
      Addresses[2],
      grantor,
      expirationDate,
      revocable,
      data,
    )
    handleRoleGranted(event3)

    assert.entityCount('RoleAssignment', 3)
    assert.entityCount('Role', 3)
    assert.entityCount('Account', 3)

    const grantorAccount = new Account(grantor)
    validateRole(grantorAccount, new Account(Addresses[0]), nft1, RoleAssignmentId, expirationDate, data, rolesRegistry)
    validateRole(grantorAccount, new Account(Addresses[1]), nft2, RoleAssignmentId, expirationDate, data, rolesRegistry)
    validateRole(grantorAccount, new Account(Addresses[2]), nft3, RoleAssignmentId, expirationDate, data, rolesRegistry)
  })
})
