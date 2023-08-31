import { assert, describe, test, clearStore, afterAll } from 'matchstick-as'
import { handleTravelerTransfer } from '../../../src/chronos/traveler/transfer-handler'
import { generateId } from '../../../src/utils/helper'
import { createNewTransferEvent } from '../../mocks/events'
import { ZERO_ADDRESS } from '../../../src/utils/constants'

const tokenId = '123'
const address1 = '0x1111111111111111111111111111111111111111'
const address2 = '0x2222222222222222222222222222222222222222'
const address3 = '0x3333333333333333333333333333333333333333'

describe('ERC Role Revoked', () => {
  afterAll(() => {
    clearStore()
  })

  describe.('When entities no exists', () => {
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

  describe('When entities already exists', () => {
    test('Should transfer from address2 to address3', () => {
      const event = createNewTransferEvent(address2, address3, tokenId, ZERO_ADDRESS)
      const _id = generateId(event.params.tokenId.toString(), event.address.toHexString())

      assert.entityCount('Nft', 1)
      assert.entityCount('Account', 2)

      handleTravelerTransfer(event)

      assert.fieldEquals('Nft', _id, 'address', ZERO_ADDRESS)
      assert.fieldEquals('Nft', _id, 'tokenId', tokenId)
      assert.fieldEquals('Nft', _id, 'owner', address3)

      assert.entityCount('Account', 3)
    })
  })
})
