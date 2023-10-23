import { assert, describe, test, clearStore, afterEach } from 'matchstick-as'
import { createNewRoleRevokedEvent } from '../helpers/events'
import { handleRoleRevoked } from '../../src/erc7432'
import { Bytes, BigInt } from '@graphprotocol/graph-ts'
import { createMockAccount, createMockNft, createMockRoleAssignment, validateRole } from '../helpers/entities'
import { Addresses, ONE, TWO } from '../helpers/contants'
import { generateNftId, generateRoleAssignmentId } from '../../src/utils/helper'
import { Account, Nft } from '../../generated/schema'

const tokenId = '123'
const RoleAssignmentId = Bytes.fromUTF8('0xGrantRole')
const tokenAddress = Addresses[0]
const grantee = Addresses[1]
const revoker = Addresses[2]
const expirationDate = BigInt.fromI32(99999)
const data = Bytes.fromUTF8('data')

describe('ERC-7432 RoleRevoked Handler', () => {
  afterEach(() => {
    clearStore()
  })

  test('should not revoke roleAssignment when NFT does not exist', () => {
    assert.entityCount('RoleAssignment', 0)

    const nftId = generateNftId(tokenAddress, tokenId)
    const nft = new Nft(nftId)
    nft.tokenAddress = tokenAddress
    nft.tokenId = BigInt.fromString(tokenId)
    nft.owner = revoker

    const event = createNewRoleRevokedEvent(RoleAssignmentId, nft, revoker, grantee)
    handleRoleRevoked(event)

    assert.entityCount('RoleAssignment', 0)
  })

  test('should not revoke roleAssignment when revoker does not exist', () => {
    const nft = createMockNft(tokenAddress, tokenId, Addresses[0])
    assert.entityCount('RoleAssignment', 0)

    const event = createNewRoleRevokedEvent(RoleAssignmentId, nft, revoker, grantee)
    handleRoleRevoked(event)

    assert.entityCount('RoleAssignment', 0)
  })

  test('should not revoke roleAssignment when grantee does not exist', () => {
    const nft = createMockNft(tokenAddress, tokenId, revoker)
    assert.entityCount('RoleAssignment', 0)

    const event = createNewRoleRevokedEvent(RoleAssignmentId, nft, revoker, grantee)
    handleRoleRevoked(event)

    assert.entityCount('RoleAssignment', 0)
  })

  test('should not revoke roleAssignment when roleAssignment does not exist', () => {
    const nft = createMockNft(tokenAddress, tokenId, revoker)
    createMockAccount(grantee)
    assert.entityCount('RoleAssignment', 0)

    const event = createNewRoleRevokedEvent(RoleAssignmentId, nft, revoker, grantee)
    handleRoleRevoked(event)

    assert.entityCount('RoleAssignment', 0)
  })

  test('should not revoke roleAssignment when roleAssignment already expired', () => {
    const nft = createMockNft(tokenAddress, tokenId, revoker)
    const granteeAccount = createMockAccount(grantee)
    createMockRoleAssignment(RoleAssignmentId, revoker, grantee, nft, BigInt.fromI32(0))
    assert.entityCount('RoleAssignment', 1)

    const event = createNewRoleRevokedEvent(RoleAssignmentId, nft, revoker, grantee)
    handleRoleRevoked(event)

    assert.entityCount('RoleAssignment', 1)
    const _id = generateRoleAssignmentId(new Account(revoker), granteeAccount, nft, RoleAssignmentId)
    assert.fieldEquals('RoleAssignment', _id, 'expirationDate', '0')
  })

  test('should revoke multiple roles for the same NFT', () => {
    const nft = createMockNft(tokenAddress, tokenId, revoker)
    const account1 = createMockAccount(Addresses[0])
    const account2 = createMockAccount(Addresses[1])
    const account3 = createMockAccount(Addresses[2])
    createMockRoleAssignment(RoleAssignmentId, revoker, Addresses[0], nft, expirationDate)
    createMockRoleAssignment(RoleAssignmentId, revoker, Addresses[1], nft, expirationDate.plus(ONE))
    createMockRoleAssignment(RoleAssignmentId, revoker, Addresses[2], nft, expirationDate.plus(TWO))
    assert.entityCount('RoleAssignment', 3)

    const event1 = createNewRoleRevokedEvent(RoleAssignmentId, nft, revoker, Addresses[0])
    handleRoleRevoked(event1)

    const event2 = createNewRoleRevokedEvent(RoleAssignmentId, nft, revoker, Addresses[1])
    handleRoleRevoked(event2)

    const event3 = createNewRoleRevokedEvent(RoleAssignmentId, nft, revoker, Addresses[2])
    handleRoleRevoked(event3)

    assert.entityCount('RoleAssignment', 3)
    const revokerAccount = new Account(revoker)
    validateRole(revokerAccount, account1, nft, RoleAssignmentId, ONE, data)
    validateRole(revokerAccount, account2, nft, RoleAssignmentId, ONE, data)
    validateRole(revokerAccount, account3, nft, RoleAssignmentId, ONE, data)
  })

  test('should revoke multiple roles for different NFTs', () => {
    const granteeAccount = createMockAccount(grantee)
    const nft1 = createMockNft(tokenAddress, '123', revoker)
    const nft2 = createMockNft(tokenAddress, '456', revoker)
    const nft3 = createMockNft(tokenAddress, '789', revoker)
    createMockRoleAssignment(RoleAssignmentId, revoker, grantee, nft1, expirationDate)
    createMockRoleAssignment(RoleAssignmentId, revoker, grantee, nft2, expirationDate.plus(ONE))
    createMockRoleAssignment(RoleAssignmentId, revoker, grantee, nft3, expirationDate.plus(TWO))
    assert.entityCount('RoleAssignment', 3)

    const event1 = createNewRoleRevokedEvent(RoleAssignmentId, nft1, revoker, grantee)
    handleRoleRevoked(event1)

    const event2 = createNewRoleRevokedEvent(RoleAssignmentId, nft2, revoker, grantee)
    handleRoleRevoked(event2)

    const event3 = createNewRoleRevokedEvent(RoleAssignmentId, nft3, revoker, grantee)
    handleRoleRevoked(event3)

    assert.entityCount('RoleAssignment', 3)
    const revokerAccount = new Account(revoker)
    validateRole(revokerAccount, granteeAccount, nft1, RoleAssignmentId, ONE, data)
    validateRole(revokerAccount, granteeAccount, nft2, RoleAssignmentId, ONE, data)
    validateRole(revokerAccount, granteeAccount, nft3, RoleAssignmentId, ONE, data)
  })
})
