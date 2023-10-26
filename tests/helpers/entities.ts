import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Account, Nft, RoleAssignment, RoleApproval, Role } from '../../generated/schema'
import {
  generateERC721NftId,
  generateRoleAssignmentId,
  generateRoleApprovalId,
  generateRoleId,
  findOrCreateRolesRegistry,
  NftType,
} from '../../utils'
import { assert } from 'matchstick-as'

export function createMockNft(tokenAddress: string, tokenId: string, ownerAddress: string): Nft {
  const nft = new Nft(generateERC721NftId(tokenAddress, BigInt.fromString(tokenId)))
  nft.tokenAddress = tokenAddress
  nft.tokenId = BigInt.fromString(tokenId)
  nft.type = NftType.ERC721.toString()

  const nftOwner = createMockAccount(ownerAddress)

  nft.owner = nftOwner.id
  nft.save()
  return nft
}

export function createMockAccount(ethAddress: string): Account {
  const account = new Account(ethAddress)
  account.save()
  return account
}

export function createMockRoleAssignment(
  roleHash: Bytes,
  grantor: string,
  grantee: string,
  nft: Nft,
  expirationDate: BigInt,
  rolesRegistryAddress: string,
): RoleAssignment {
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleId = generateRoleId(rolesRegistry, nft, roleHash)
  const role = new Role(roleId)
  role.roleHash = roleHash
  role.nft = nft.id
  role.rolesRegistry = rolesRegistryAddress
  role.save()

  const roleAssignmentId = generateRoleAssignmentId(
    rolesRegistry,
    new Account(grantor),
    new Account(grantee),
    nft,
    roleHash,
  )
  const newRoleAssignment = new RoleAssignment(roleAssignmentId)
  newRoleAssignment.role = role.id
  newRoleAssignment.nft = nft.id
  newRoleAssignment.grantor = grantor
  newRoleAssignment.grantee = grantee
  newRoleAssignment.expirationDate = expirationDate
  newRoleAssignment.revocable = true
  newRoleAssignment.data = Bytes.fromUTF8('data')
  newRoleAssignment.createdAt = BigInt.fromI32(123)
  newRoleAssignment.updatedAt = BigInt.fromI32(123)
  newRoleAssignment.save()
  return newRoleAssignment
}

export function createMockRoleApproval(
  grantor: string,
  operator: string,
  tokenAddress: string,
  rolesRegistryAddress: string,
): RoleApproval {
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleApprovalId = generateRoleApprovalId(
    rolesRegistry,
    new Account(grantor),
    new Account(operator),
    tokenAddress,
  )
  const roleApproval = new RoleApproval(roleApprovalId)
  roleApproval.grantor = grantor
  roleApproval.operator = operator
  roleApproval.tokenAddress = tokenAddress
  roleApproval.rolesRegistry = rolesRegistryAddress
  roleApproval.save()
  return roleApproval
}

export function validateRole(
  grantor: Account,
  grantee: Account,
  nft: Nft,
  roleAssignment: Bytes,
  expirationDate: BigInt,
  data: Bytes,
  rolesRegistryAddress: string,
): void {
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleId = generateRoleId(rolesRegistry, nft, roleAssignment)
  assert.fieldEquals('Role', roleId, 'roleHash', roleAssignment.toHex())
  assert.fieldEquals('Role', roleId, 'nft', nft.id)

  const roleAssignmentId = generateRoleAssignmentId(rolesRegistry, grantor, grantee, nft, roleAssignment)
  assert.fieldEquals(
    'RoleAssignment',
    roleAssignmentId,
    'role',
    `${rolesRegistryAddress}-${nft.id}-${roleAssignment.toHex()}`,
  )
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'nft', nft.id)
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'grantor', grantor.id)
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'grantee', grantee.id)
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'expirationDate', expirationDate.toString())
  assert.fieldEquals('RoleAssignment', roleAssignmentId, 'data', data.toHex())
}

export function validateRoleApproval(
  rolesRegistryAddress: string,
  grantor: string,
  operator: string,
  tokenAddress: string,
): void {
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleApprovalId = generateRoleApprovalId(
    rolesRegistry,
    new Account(grantor.toLowerCase()),
    new Account(operator.toLowerCase()),
    tokenAddress,
  )
  assert.fieldEquals('RoleApproval', roleApprovalId, 'grantor', grantor)
  assert.fieldEquals('RoleApproval', roleApprovalId, 'operator', operator)
  assert.fieldEquals('RoleApproval', roleApprovalId, 'tokenAddress', tokenAddress)
}
