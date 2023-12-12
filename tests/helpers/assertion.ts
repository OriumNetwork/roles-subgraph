import { assert } from 'matchstick-as'
import { Account, Nft } from '../../generated/schema'
import {
  findOrCreateRolesRegistry,
  generateRoleApprovalId,
  generateERC721RoleAssignmentId,
  generateRoleId,
} from '../../utils'
import { BigInt, Bytes } from '@graphprotocol/graph-ts'

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

  const roleAssignmentId = generateERC721RoleAssignmentId(rolesRegistry, grantor, grantee, nft, roleAssignment)
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
  isApproved: boolean,
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
  assert.fieldEquals('RoleApproval', roleApprovalId, 'isApproved', isApproved.toString())
}
