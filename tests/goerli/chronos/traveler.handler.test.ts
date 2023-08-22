import { assert, describe, test, newMockEvent, beforeEach, afterEach, clearStore } from 'matchstick-as'
import { handleTravelerTransfer } from '../../../src/chronos/traveler/handler'
import { generateId } from '../../../src/utils/helper'
import { createNewTransferEvent } from '../../mocks/events'
import { createMockNft } from '../../mocks/entities'
import { ZERO_ADDRESS } from '../../../src/utils/constants'

const tokenId = '123'
const address1 = '0x1111111111111111111111111111111111111111'
const address2 = '0x2222222222222222222222222222222222222222'

describe('When entities no exists', () => {
  beforeEach(() => {
    createMockNft(tokenId)
  })

  afterEach(() => {
    clearStore()
  })

  test('Should transfer currentOwner ownership', () => {
    const event = createNewTransferEvent(address1, address2, tokenId, ZERO_ADDRESS)
    const _id = generateId(event.params.tokenId.toString(), event.address.toHexString())

    handleTravelerTransfer(event)

    assert.fieldEquals('Nft', _id, 'address', ZERO_ADDRESS)
    assert.fieldEquals('Nft', _id, 'tokenId', '123')
    assert.fieldEquals('Nft', _id, 'previousOwner', address1)
    assert.fieldEquals('Nft', _id, 'currentOwner', address2)
    assert.fieldEquals('Nft', _id, 'originalOwner', address2)
  })
})
