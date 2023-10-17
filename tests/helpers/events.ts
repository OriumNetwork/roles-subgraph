import { newMockEvent } from 'matchstick-as'
import { Transfer } from '../../generated/ERC721-Chronos-Traveler/ERC721'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { RoleGranted, RoleRevoked } from '../../generated/ERC7432-Immutable-Roles/ERC7432'

export function createTransferEvent(from: string, to: string, tokenId: string, address: string): Transfer {
  const event = changetype<Transfer>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamAddress('from', from))
  event.parameters.push(buildEventParamAddress('to', to))
  event.parameters.push(buildEventParamUint('tokenId', tokenId))
  event.address = Address.fromString(address)
  return event
}

export function createNewRoleRevokedEvent(
  role: Bytes,
  tokenId: string,
  tokenAddress: string,
  revoker: string,
  grantee: string,
  address: string,
): RoleRevoked {
  const event = changetype<RoleRevoked>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamBytes('_role', role))
  event.parameters.push(buildEventParamAddress('_tokenAddress', tokenAddress))
  event.parameters.push(buildEventParamUint('_tokenId', tokenId))
  event.parameters.push(buildEventParamAddress('_revoker', revoker))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  event.transaction.from = Address.fromString(address)
  return event
}

export function createNewRoleGrantedEvent(
  role: Bytes,
  tokenId: string,
  tokenAddress: string,
  grantee: string,
  grantor: string,
  expirationDate: string,
  revocable: boolean,
  data: Bytes,
  address: string,
): RoleGranted {
  const event = changetype<RoleGranted>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamBytes('_role', role))
  event.parameters.push(buildEventParamAddress('_tokenAddress', tokenAddress))
  event.parameters.push(buildEventParamUint('_tokenId', tokenId))
  event.parameters.push(buildEventParamAddress('_grantor', grantor))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  event.parameters.push(buildEventParamUint('_expirationDate', expirationDate))
  event.parameters.push(buildEventParamBoolean('_revocable', revocable))
  event.parameters.push(buildEventParamBytes('_data', data))
  event.transaction.from = Address.fromString(address)
  return event
}

function buildEventParamBoolean(name: string, value: boolean): ethereum.EventParam {
  const ethAddress = ethereum.Value.fromBoolean(value)
  return new ethereum.EventParam(name, ethAddress)
}

function buildEventParamAddress(name: string, address: string): ethereum.EventParam {
  const ethAddress = ethereum.Value.fromAddress(Address.fromString(address))
  return new ethereum.EventParam(name, ethAddress)
}

function buildEventParamUint(name: string, value: string): ethereum.EventParam {
  const ethValue = ethereum.Value.fromUnsignedBigInt(BigInt.fromString(value))
  return new ethereum.EventParam(name, ethValue)
}

function buildEventParamBytes(name: string, value: Bytes): ethereum.EventParam {
  const ethValue = ethereum.Value.fromFixedBytes(value)
  return new ethereum.EventParam(name, ethValue)
}
