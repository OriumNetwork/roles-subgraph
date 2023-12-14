import { newMockEvent } from 'matchstick-as'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  buildEventParamAddress,
  buildEventParamBoolean,
  buildEventParamBytes,
  buildEventParamUint,
  buildEventParamUintArray,
} from '../helpers/events'
import { TransferBatch, TransferSingle } from '../../generated/ERC1155/ERC1155'
import { Transfer } from '../../generated/ERC721/ERC721'
import { RoleApprovalForAll, RoleGranted, RoleRevoked } from '../../generated/ERC7432/ERC7432'
import { ZERO_ADDRESS } from '../helpers/contants'
import { Nft } from '../../generated/schema'

/**
@dev Creates a mock for the event Transfer

Example:
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
 */
export function createTransferEvent(from: string, to: string, tokenId: string, address: string): Transfer {
  const event = changetype<Transfer>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamAddress('from', from))
  event.parameters.push(buildEventParamAddress('to', to))
  event.parameters.push(buildEventParamUint('tokenId', BigInt.fromString(tokenId)))
  event.address = Address.fromString(address)
  return event
}

/**
@dev Creates a mock for the event TransferSingle

Example:
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)
 */
export function createTransferSingleEvent(
  operator: string,
  from: string,
  to: string,
  tokenId: BigInt,
  amount: BigInt,
  address: string,
): TransferSingle {
  const event = changetype<TransferSingle>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamAddress('operator', operator))
  event.parameters.push(buildEventParamAddress('from', from))
  event.parameters.push(buildEventParamAddress('to', to))
  event.parameters.push(buildEventParamUint('id', tokenId))
  event.parameters.push(buildEventParamUint('value', amount))
  event.address = Address.fromString(address)
  return event
}

/**
@dev Creates a mock for the event TransferBatch

Example:
    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] values
    )
 */
export function createTransferBatchEvent(
  operator: string,
  from: string,
  to: string,
  tokenIds: Array<BigInt>,
  amounts: Array<BigInt>,
  address: string,
): TransferBatch {
  const event = changetype<TransferBatch>(newMockEvent())
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamAddress('operator', operator))
  event.parameters.push(buildEventParamAddress('from', from))
  event.parameters.push(buildEventParamAddress('to', to))
  event.parameters.push(buildEventParamUintArray('ids', tokenIds))
  event.parameters.push(buildEventParamUintArray('values', amounts))
  event.address = Address.fromString(address)
  return event
}

/**
@dev Creates a mock for the event RoleRevoked

Example:
    event RoleRevoked(
        bytes32 indexed _role,
        address indexed _tokenAddress,
        uint256 indexed _tokenId,
        address _revoker,
        address _grantee
    )
 */
export function createNewRoleRevokedEvent(
  roleAssignment: Bytes,
  nft: Nft,
  revoker: string,
  grantee: string,
): RoleRevoked {
  const event = changetype<RoleRevoked>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamBytes('_role', roleAssignment))
  event.parameters.push(buildEventParamAddress('_tokenAddress', nft.tokenAddress))
  event.parameters.push(buildEventParamUint('_tokenId', nft.tokenId))
  event.parameters.push(buildEventParamAddress('_revoker', revoker))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  return event
}

/**
@dev Creates a mock for the event RoleGranted

Example:
    event RoleGranted(
        bytes32 indexed _role,
        address indexed _tokenAddress,
        uint256 indexed _tokenId,
        address _grantor,
        address _grantee,
        uint64 _expirationDate,
        bool _revocable,
        bytes _data
    )
 */
export function createNewRoleGrantedEvent(
  roleAssignment: Bytes,
  tokenId: string,
  tokenAddress: string,
  grantee: string,
  grantor: string,
  expirationDate: BigInt,
  revocable: boolean,
  data: Bytes,
): RoleGranted {
  const event = changetype<RoleGranted>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.parameters.push(buildEventParamBytes('_role', roleAssignment))
  event.parameters.push(buildEventParamAddress('_tokenAddress', tokenAddress))
  event.parameters.push(buildEventParamUint('_tokenId', BigInt.fromString(tokenId)))
  event.parameters.push(buildEventParamAddress('_grantor', grantor))
  event.parameters.push(buildEventParamAddress('_grantee', grantee))
  event.parameters.push(buildEventParamUint('_expirationDate', expirationDate))
  event.parameters.push(buildEventParamBoolean('_revocable', revocable))
  event.parameters.push(buildEventParamBytes('_data', data))
  return event
}

/**
@dev Creates a mock for the event RoleApprovalForAll

Example:
    event RoleApprovalForAll(
        address indexed _tokenAddress,
        address indexed _operator,
        bool _isApproved
    );
 */
export function createNewRoleApprovalForAllEvent(
  grantor: string,
  operator: string,
  tokenAddress: string,
  isApproved: boolean,
): RoleApprovalForAll {
  const event = changetype<RoleApprovalForAll>(newMockEvent())
  event.address = Address.fromString(ZERO_ADDRESS)
  event.parameters = new Array<ethereum.EventParam>()
  event.transaction.from = Address.fromString(grantor)
  event.parameters.push(buildEventParamAddress('_tokenAddress', tokenAddress))
  event.parameters.push(buildEventParamAddress('_operator', operator))
  event.parameters.push(buildEventParamBoolean('_isApproved', isApproved))
  return event
}
