import { newMockEvent } from 'matchstick-as'
import { Transfer } from '../../generated/Traveler/ChronosTraveler'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'

function createNewTransferEvent(from: string, to: string, tokenId: string, address: string): Transfer {
  const event = changetype<Transfer>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamAddress('from', from))
  event.parameters.push(buildEventParamAddress('to', to))
  event.parameters.push(buildEventParamUint('tokenId', tokenId))
  event.address = Address.fromString(address)

  return event
}

function buildEventParamAddress(name: string, address: string): ethereum.EventParam {
  const ethAddress = ethereum.Value.fromAddress(Address.fromString(address))
  return new ethereum.EventParam(name, ethAddress)
}

function buildEventParamUint(name: string, value: string): ethereum.EventParam {
  const ethValue = ethereum.Value.fromUnsignedBigInt(BigInt.fromString(value))
  return new ethereum.EventParam(name, ethValue)
}

export { createNewTransferEvent }
