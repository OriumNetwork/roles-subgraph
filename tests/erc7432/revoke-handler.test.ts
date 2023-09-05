import { assert, describe, test, clearStore, afterAll, beforeEach } from 'matchstick-as'
import { generateId } from '../../src/utils/helper'
import { createNewRoleGrantedEvent, createNewRoleRevokedEvent } from '../mocks/events'
import { ZERO_ADDRESS } from '../../src/utils/constants'
import { handleRoleGranted, handleRoleRevoked } from '../../src/erc7432'
import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { createMockNft } from '../mocks/entities'

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
        const keyId = generateId(tokenId, tokenAddress)
        const roleId = Bytes.fromUTF8(keyId).toHex()

        const event = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, grantee, ZERO_ADDRESS)

        handleRoleRevoked(event)
      })
      test('Should skip if NFT does not owned by grantor', () => {
        createMockNft(tokenId, tokenAddress, address2)

        const keyId = generateId(tokenId, tokenAddress)
        const roleId = Bytes.fromUTF8(keyId).toHex()

        const event = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, grantee, address3)

        handleRoleRevoked(event)
      })
      test('Should skip if Role does not owned by grantor', () => {
        createMockNft(tokenId, tokenAddress, address2)

        const keyId = generateId(tokenId, tokenAddress)
        const roleId = Bytes.fromUTF8(keyId).toHex()

        const event = createNewRoleRevokedEvent(roleId, tokenId, tokenAddress, grantee, address2)

        handleRoleRevoked(event)
      })
      test('Should revoke role from grantee', () => {
        createMockNft(tokenId, tokenAddress, address2)

        assert.entityCount('Nft', 1)
        assert.entityCount('Account', 1)
        assert.entityCount('Role', 0)

        const keyId = generateId(tokenId, tokenAddress)
        const roleId = Bytes.fromUTF8(keyId).toHex()
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

        assert.entityCount('Role', 1)
        assert.fieldEquals('Role', roleId, 'nft', keyId)
        assert.fieldEquals('Role', roleId, 'grantor', grantEvent.address.toHexString())
        assert.fieldEquals('Role', roleId, 'grantee', grantee)
        assert.fieldEquals('Role', roleId, 'expirationDate', '0')
        assert.fieldEquals('Role', roleId, 'data', data)
      })
    })
  })

  describe('When entities already exists', () => {
    describe('When role already exists', () => {
      beforeEach(() => {
        clearStore()
      })
      test('Should revoke role from grantee', () => {
        createMockNft(tokenId, tokenAddress, address2)

        assert.entityCount('Nft', 1)
        assert.entityCount('Account', 1)
        assert.entityCount('Role', 0)

        const keyId = generateId(tokenId, tokenAddress)
        const roleId = Bytes.fromUTF8(keyId).toHex()
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

        assert.entityCount('Role', 1)
        assert.fieldEquals('Role', roleId, 'nft', keyId)
        assert.fieldEquals('Role', roleId, 'grantor', grantEvent.address.toHexString())
        assert.fieldEquals('Role', roleId, 'grantee', grantee)
        assert.fieldEquals('Role', roleId, 'expirationDate', '0')
        assert.fieldEquals('Role', roleId, 'data', data)

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

        assert.entityCount('Role', 1)
        assert.fieldEquals('Role', roleId, 'nft', keyId)
        assert.fieldEquals('Role', roleId, 'grantor', grantEvent.address.toHexString())
        assert.fieldEquals('Role', roleId, 'grantee', newGrantee)
        assert.fieldEquals('Role', roleId, 'expirationDate', '0')
        assert.fieldEquals('Role', roleId, 'data', newData)
      })
    })
  })
})
