import { assert, describe, test, newMockEvent } from 'matchstick-as'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Nft } from '../../../generated/schema'
import { Transfer } from '../../../generated/Traveler/ChronosTraveler'
import { generateId, handleTravelerTransfer } from '../../../src/chronos/traveler/handler'

describe('When entities no exists', () => {
  test('Should transfer currentOwner ownership', () => {
    const nft = new Nft('1')
    nft.address = '0x1'
    nft.state = 'AVAILABLE'
    nft.type = 'ERC721'
    nft.tokenId = BigInt.fromI32(1)
    nft.platform = 'OpenSea'
    nft.currentOwner = '0x1111111111111111111111111111111111111111'
    nft.previousOwner = '0x1'
    nft.originalOwner = '0x1'
    nft.save()

    const event = changetype<Transfer>(newMockEvent())
    event.parameters = new Array<ethereum.EventParam>()

    event.parameters.push(
      new ethereum.EventParam(
        'from',
        ethereum.Value.fromAddress(Address.fromString('0x1111111111111111111111111111111111111111')),
      ),
    )
    event.parameters.push(
      new ethereum.EventParam(
        'to',
        ethereum.Value.fromAddress(Address.fromString('0x2222222222222222222222222222222222222222')),
      ),
    )
    event.parameters.push(new ethereum.EventParam('tokenId', ethereum.Value.fromI32(1)))

    const eventId = generateId(event)

    handleTravelerTransfer(event)

    assert.fieldEquals('Nft', eventId, 'previousOwner', '0x1111111111111111111111111111111111111111')
    assert.fieldEquals('Nft', eventId, 'currentOwner', '0x2222222222222222222222222222222222222222')
  })
})
