import { newMockEvent } from 'matchstick-as'
import { Transfer } from '../../generated/Traveler/ChronosTraveler'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { RoleGranted, RoleRevoked } from '../../generated/Roles/ERC7432Roles'

function createNewTransferEvent(from: string, to: string, tokenId: string, address: string): Transfer {
  const event = changetype<Transfer>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamAddress('from', from))
  event.parameters.push(buildEventParamAddress('to', to))
  event.parameters.push(buildEventParamUint('tokenId', tokenId))
  event.address = Address.fromString(address)

  return event
}

function createNewRoleRevokedEvent(role: string, tokenId: string, address: string, grantee: string): RoleRevoked {
  const event = changetype<RoleRevoked>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamBytes('_role', role))
  event.parameters.push(buildEventParamUint('_tokenId', tokenId))
  event.parameters.push(buildEventParamAddress('_tokenAddress', address))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  event.address = Address.fromString(address)

  return event
}

function createNewRoleGrantedEvent(
  role: string,
  tokenId: string,
  address: string,
  grantee: string,
  expirationDate: string,
  data: string,
): RoleGranted {
  const event = changetype<RoleGranted>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamBytes('_role', role))
  event.parameters.push(buildEventParamUint('_tokenId', tokenId))
  event.parameters.push(buildEventParamAddress('_tokenAddress', address))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  event.parameters.push(buildEventParamUint('_expirationDate', expirationDate))
  event.parameters.push(buildEventParamBytes('_data', data))
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

function buildEventParamBytes(name: string, value: string): ethereum.EventParam {
  const ethValue = ethereum.Value.fromFixedBytes(Bytes.fromHexString(value))
  return new ethereum.EventParam(name, ethValue)
}
export { createNewTransferEvent, createNewRoleGrantedEvent, createNewRoleRevokedEvent }
