import { assert, describe, test, clearStore, afterAll, log } from 'matchstick-as'
import { handleTravelerTransfer } from '../../../src/chronos/traveler/transfer-handler'
import { generateId } from '../../../src/utils/helper'
import { createNewRoleGrantedEvent, createNewTransferEvent } from '../../mocks/events'
import { ZERO_ADDRESS } from '../../../src/utils/constants'
import { handleRoleGranted } from '../../../src/erc7432'
import { Bytes } from '@graphprotocol/graph-ts'
import { createMockNft } from '../../mocks/entities'

const tokenId = '123'
const address1 = '0x1111111111111111111111111111111111111111'
const address2 = '0x2222222222222222222222222222222222222222'
const address3 = '0x3333333333333333333333333333333333333333'

describe('ERC Role Granted', () => {
  afterAll(() => {
    clearStore()
  })

  /*
  describe('When entities no exists', () => {
    test('Should transfer from address1 to address2', () => {
      const event = createNewTransferEvent(address1, address2, tokenId, ZERO_ADDRESS)
      const _id = generateId(event.params.tokenId.toString(), event.address.toHexString())

      assert.entityCount('Nft', 0)
      assert.entityCount('Account', 0)

      handleTravelerTransfer(event)

      assert.fieldEquals('Nft', _id, 'address', ZERO_ADDRESS)
      assert.fieldEquals('Nft', _id, 'tokenId', tokenId)
      assert.fieldEquals('Nft', _id, 'owner', address2)
    })
  })
  */
  describe('When entities already exists', () => {
    describe('When role already exists', () => {
      test('Should give grant role to address3', () => {
        createMockNft(tokenId)

        assert.entityCount('Nft', 1)
        assert.entityCount('Account', 1)

        const tokenId1 = '123'
        const tokenId2 = '456'
        const tokenAddress = '0x4444444444444444444444444444444444444444'
        const roleId1 = generateId(tokenId, address1)
        const roleId2 = generateId(tokenId, address2)
        const data = '0x1234567890'

        log.info('roleId1: {}', [roleId1])

        const grantee = address2
        const expirationDate = '99999'

        assert.entityCount('Role', 0)

        const event = createNewRoleGrantedEvent(
          Bytes.fromUTF8(roleId1).toHex(),
          tokenId1,
          tokenAddress,
          grantee,
          expirationDate,
          data,
          ZERO_ADDRESS,
        )
        
        handleRoleGranted(event)

        const bytes = Bytes.fromUTF8(roleId1).toHex()

        assert.entityCount('Role', 1)
        assert.fieldEquals('Role', bytes, 'nft', generateId(tokenId1, ZERO_ADDRESS))
        assert.fieldEquals('Role', bytes, 'grantor', event.address.toHexString())
        assert.fieldEquals('Role', bytes, 'grantee', grantee)
        assert.fieldEquals('Role', bytes, 'expirationDate', expirationDate)
        assert.fieldEquals('Role', bytes, 'data', data)
        
      })
    })
  })
})
