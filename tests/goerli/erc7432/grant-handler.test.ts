import { assert, describe, test, clearStore, afterAll, beforeEach } from 'matchstick-as'
import { generateId } from '../../../src/utils/helper'
import { createNewRoleGrantedEvent } from '../../mocks/events'
import { ZERO_ADDRESS } from '../../../src/utils/constants'
import { handleRoleGranted } from '../../../src/erc7432'
import { Bytes } from '@graphprotocol/graph-ts'
import { createMockNft } from '../../mocks/entities'

const tokenId = '123'
const address1 = '0x1111111111111111111111111111111111111111'
const address2 = '0x2222222222222222222222222222222222222222'
const address3 = '0x3333333333333333333333333333333333333333'

const tokenAddress = address1
const grantee = address2
const data = '0x1234567890'
const expirationDate = '99999'

describe('ERC Role Granted', () => {
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

        const event = createNewRoleGrantedEvent(
          roleId,
          tokenId,
          tokenAddress,
          grantee,
          expirationDate,
          data,
          ZERO_ADDRESS,
        )

        handleRoleGranted(event)
      })
      test('Should skip if NFT does not owned by grantor', () => {
        createMockNft(tokenId, tokenAddress, address2)

        const keyId = generateId(tokenId, tokenAddress)
        const roleId = Bytes.fromUTF8(keyId).toHex()

        const event = createNewRoleGrantedEvent(roleId, tokenId, tokenAddress, grantee, expirationDate, data, address3)

        handleRoleGranted(event)
      })
      test('Should give grant role to grantee', () => {
        createMockNft(tokenId, tokenAddress, address2)

        assert.entityCount('Nft', 1)
        assert.entityCount('Account', 1)
        assert.entityCount('Role', 0)

        const keyId = generateId(tokenId, tokenAddress)
        const roleId = Bytes.fromUTF8(keyId).toHex()
        const event = createNewRoleGrantedEvent(roleId, tokenId, tokenAddress, grantee, expirationDate, data, address2)

        handleRoleGranted(event)

        assert.entityCount('Role', 1)
        assert.fieldEquals('Role', roleId, 'nft', keyId)
        assert.fieldEquals('Role', roleId, 'grantor', event.address.toHexString())
        assert.fieldEquals('Role', roleId, 'grantee', grantee)
        assert.fieldEquals('Role', roleId, 'expirationDate', expirationDate)
        assert.fieldEquals('Role', roleId, 'data', data)
      })
    })
  })

  describe('When entities already exists', () => {
    describe('When role already exists', () => {
      beforeEach(() => {
        clearStore()
      })
      test('Should give grant role to grantee', () => {
        createMockNft(tokenId, tokenAddress, address1)

        assert.entityCount('Nft', 1)
        assert.entityCount('Account', 1)
        assert.entityCount('Role', 0)

        const keyId = generateId(tokenId, tokenAddress)
        const roleId = Bytes.fromUTF8(keyId).toHex()
        const event = createNewRoleGrantedEvent(roleId, tokenId, tokenAddress, grantee, expirationDate, data, address1)

        handleRoleGranted(event)

        assert.entityCount('Role', 1)
        assert.fieldEquals('Role', roleId, 'nft', keyId)
        assert.fieldEquals('Role', roleId, 'grantor', event.address.toHexString())
        assert.fieldEquals('Role', roleId, 'grantee', grantee)
        assert.fieldEquals('Role', roleId, 'expirationDate', expirationDate)
        assert.fieldEquals('Role', roleId, 'data', data)

        const newGrantee = address3
        const newData = '0x0987654321'
        const newExpirationDate = '88888'

        const event2 = createNewRoleGrantedEvent(
          roleId,
          tokenId,
          tokenAddress,
          newGrantee,
          newExpirationDate,
          newData,
          address1,
        )

        handleRoleGranted(event2)

        assert.entityCount('Role', 1)
        assert.fieldEquals('Role', roleId, 'nft', keyId)
        assert.fieldEquals('Role', roleId, 'grantor', event.address.toHexString())
        assert.fieldEquals('Role', roleId, 'grantee', newGrantee)
        assert.fieldEquals('Role', roleId, 'expirationDate', newExpirationDate)
        assert.fieldEquals('Role', roleId, 'data', newData)
      })
    })
  })
})
