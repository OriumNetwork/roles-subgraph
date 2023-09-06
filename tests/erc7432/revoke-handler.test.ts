import { assert, describe, test, clearStore, afterAll, beforeEach } from 'matchstick-as'
import { generateRoleId } from '../../src/utils/helper'
import { createNewRoleGrantedEvent, createNewRoleRevokedEvent } from '../mocks/events'
import { handleRoleGranted, handleRoleRevoked } from '../../src/erc7432'
import { Bytes } from '@graphprotocol/graph-ts'
import { createMockAccount, createMockNft } from '../mocks/entities'

const tokenId = '123'
const address1 = '0x1111111111111111111111111111111111111111'
const address2 = '0x2222222222222222222222222222222222222222'
const address3 = '0x3333333333333333333333333333333333333333'

const tokenAddress = address1
const grantee = address2
const data = '0x1234567890'
const expirationDate = '99999'

describe('ERC Role Revoked', () => {
  afterAll(() => {
    clearStore()
  })
  describe('When entities does not exists', () => {
    describe('When role does not exists', () => {
      beforeEach(() => {
        clearStore()
      })
      test('Should skip if NFT does not exist', () => {
        const roleId = Bytes.fromUTF8('0xRevokeRole').toHex()

        const event = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, grantee, address1)

        assert.entityCount('Nft', 0)
        assert.entityCount('Role', 0)
        assert.entityCount('Account', 0)

        handleRoleRevoked(event)

        assert.entityCount('Nft', 0)
        assert.entityCount('Role', 0)
        assert.entityCount('Account', 0)
      })
      test('Should skip if grantor does not exist', () => {
        createMockNft(tokenId, tokenAddress, address2)

        const roleId = Bytes.fromUTF8('0xRevokeRole').toHex()

        const event = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, grantee, address3)

        assert.entityCount('Nft', 1)
        assert.entityCount('Role', 0)
        assert.entityCount('Account', 1)

        handleRoleRevoked(event)

        assert.entityCount('Nft', 1)
        assert.entityCount('Role', 0)
        assert.entityCount('Account', 1)
      })
      test('Should skip if NFT does not owned by grantor', () => {
        createMockAccount(address3)
        createMockNft(tokenId, tokenAddress, address2)

        const roleId = Bytes.fromUTF8('0xRevokeRole').toHex()

        const event = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, grantee, address3)

        assert.entityCount('Nft', 1)
        assert.entityCount('Role', 0)
        assert.entityCount('Account', 2)

        handleRoleRevoked(event)

        assert.entityCount('Nft', 1)
        assert.entityCount('Role', 0)
        assert.entityCount('Account', 2)
      })
      test('Should skip if Role does not owned by grantor', () => {
        createMockNft(tokenId, tokenAddress, address2)

        const roleId = Bytes.fromUTF8('0xRevokeRole').toHex()

        const event = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, grantee, address2)

        handleRoleRevoked(event)
      })
      test('Should revoke role from grantee', () => {
        const nft = createMockNft(tokenId, tokenAddress, address2)

        assert.entityCount('Nft', 1)
        assert.entityCount('Account', 1)
        assert.entityCount('Role', 0)

        const roleId = Bytes.fromUTF8('0xRevokeRole').toHex()
        const grantEvent = createNewRoleGrantedEvent(
          roleId,
          tokenId,
          tokenAddress,
          grantee,
          expirationDate,
          data,
          address2,
        )

        //grant role
        handleRoleGranted(grantEvent)

        const revokeEvent = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, grantee, address2)

        //revoke role
        handleRoleRevoked(revokeEvent)

        const _id = generateRoleId(address2, nft.id, grantee, roleId)

        assert.entityCount('Role', 1)
        assert.fieldEquals('Role', _id, 'roleId', roleId)
        assert.fieldEquals('Role', _id, 'nft', nft.id)
        assert.fieldEquals('Role', _id, 'grantor', grantEvent.address.toHexString())
        assert.fieldEquals('Role', _id, 'grantee', grantee)
        assert.fieldEquals('Role', _id, 'expirationDate', '0')
        assert.fieldEquals('Role', _id, 'data', data)
      })
    })
  })
  describe('When entities already exists', () => {
    describe('When role already exists', () => {
      beforeEach(() => {
        clearStore()
      })
      test('Should revoke role from grantee', () => {
        const nft = createMockNft(tokenId, tokenAddress, address2)

        assert.entityCount('Nft', 1)
        assert.entityCount('Account', 1)
        assert.entityCount('Role', 0)

        const roleId = Bytes.fromUTF8('0xRevokeRole').toHex()
        const grantEvent = createNewRoleGrantedEvent(
          roleId,
          tokenId,
          tokenAddress,
          grantee,
          expirationDate,
          data,
          address2,
        )

        //grant role
        handleRoleGranted(grantEvent)

        const revokeEvent = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, grantee, address2)

        //revoke role
        handleRoleRevoked(revokeEvent)

        const _id = generateRoleId(address2, nft.id, grantee, roleId)

        assert.entityCount('Role', 1)
        assert.fieldEquals('Role', _id, 'roleId', roleId)
        assert.fieldEquals('Role', _id, 'nft', nft.id)
        assert.fieldEquals('Role', _id, 'grantor', grantEvent.address.toHexString())
        assert.fieldEquals('Role', _id, 'grantee', grantee)
        assert.fieldEquals('Role', _id, 'expirationDate', '0')
        assert.fieldEquals('Role', _id, 'data', data)

        const newGrantee = address3
        const newData = '0x0987654321'
        const newExpirationDate = '88888'

        const newGrantEvent = createNewRoleGrantedEvent(
          roleId,
          tokenId,
          tokenAddress,
          newGrantee,
          newExpirationDate,
          newData,
          address2,
        )

        //grant role to another grantee
        handleRoleGranted(newGrantEvent)

        const newRevokeEvent = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, newGrantee, address2)

        //revoke role
        handleRoleRevoked(newRevokeEvent)

        const _id2 = generateRoleId(address2, nft.id, newGrantee, roleId)

        assert.entityCount('Role', 2)
        assert.fieldEquals('Role', _id2, 'roleId', roleId)
        assert.fieldEquals('Role', _id2, 'nft', nft.id)
        assert.fieldEquals('Role', _id2, 'grantor', grantEvent.address.toHexString())
        assert.fieldEquals('Role', _id2, 'grantee', newGrantee)
        assert.fieldEquals('Role', _id2, 'expirationDate', '0')
        assert.fieldEquals('Role', _id2, 'data', newData)
      })
    })
  })
})
