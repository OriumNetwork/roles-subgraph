import { Bytes } from '@graphprotocol/graph-ts'
import { Account, Nft, RoleAssignment, RolesRegistry } from '../../generated/schema'
import { RoleGranted } from '../../generated/ERC7432/ERC7432'
import { findOrCreateRolesRegistry } from './roles-registry'
import { findOrCreateRole } from './role'

export function generateRoleAssignmentId(
  roleRegistry: RolesRegistry,
  grantor: Account,
  grantee: Account,
  nft: Nft,
  roleHash: Bytes,
): string {
  return roleRegistry.id + '-' + grantor.id + '-' + grantee.id + '-' + nft.id + '-' + roleHash.toHex()
}

export function findOrCreateRoleAssignment(
  event: RoleGranted,
  grantor: Account,
  grantee: Account,
  nft: Nft,
): RoleAssignment {
  const rolesRegistry = findOrCreateRolesRegistry(event.address.toHex())
  const roleAssignmentId = generateRoleAssignmentId(rolesRegistry, grantor, grantee, nft, event.params._role)
  let roleAssignment = RoleAssignment.load(roleAssignmentId)

  if (!roleAssignment) {
    roleAssignment = new RoleAssignment(roleAssignmentId)
    roleAssignment.role = findOrCreateRole(rolesRegistry, nft, event.params._role).id
    roleAssignment.nft = nft.id
    roleAssignment.grantor = grantor.id
    roleAssignment.grantee = grantee.id
    roleAssignment.createdAt = event.block.timestamp
  }

  roleAssignment.expirationDate = event.params._expirationDate
  roleAssignment.revocable = event.params._revocable
  roleAssignment.data = event.params._data
  roleAssignment.updatedAt = event.block.timestamp
  roleAssignment.save()
  return roleAssignment
}
