import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Account, Nft, RoleAssignment, RolesRegistry } from '../../../generated/schema'
import { RoleGranted } from '../../../generated/SftRolesRegistry/SftRolesRegistry'
import { findOrCreateRolesRegistry } from '../roles-registry'
import { findOrCreateRole } from '../role'

/**
 * @notice Generate a role assignment id.
 * @dev roleRegistry, grantor, grantee, nft should be created/exist before calling this function.
 * @param roleRegistry The roles registry used for the role assignment.
 * @param grantor The grantor of the role assignment.
 * @param grantee The grantee of the role assignment.
 * @param nft The nft of the role assignment.
 * @param roleHash The role hash of the role assignment.
 * @param nonce The nonce of the role assignment.
 * @returns The role assignment id.
 */
export function generateERC1155RoleAssignmentId(
  roleRegistry: RolesRegistry,
  grantor: Account,
  grantee: Account,
  nft: Nft,
  roleHash: Bytes,
  nonce: BigInt,
): string {
  return (
    roleRegistry.id +
    '-' +
    grantor.id +
    '-' +
    grantee.id +
    '-' +
    nft.id +
    '-' +
    roleHash.toHex() +
    '-' +
    nonce.toString()
  )
}

/**
 * @notice Upsert a role assignment.
 * @dev roleRegistry, grantor, grantee, nft should be created/exist before calling this function.
 * @param event The role granted event.
 * @param grantor The grantor of the role assignment.
 * @param grantee The grantee of the role assignment.
 * @param nft The nft of the role assignment.
 * @param nonce The nonce of the role assignment.
 * @returns The role assignment entity created (or found).
 */
export function upsertERC1155RoleAssignment(
  event: RoleGranted,
  grantor: Account,
  grantee: Account,
  nft: Nft,
  nonce: BigInt,
): RoleAssignment {
  const rolesRegistry = findOrCreateRolesRegistry(event.address.toHex())
  const roleAssignmentId = generateERC1155RoleAssignmentId(
    rolesRegistry,
    grantor,
    grantee,
    nft,
    event.params._role,
    nonce,
  )
  let roleAssignment = RoleAssignment.load(roleAssignmentId)
  const role = findOrCreateRole(rolesRegistry, nft, event.params._role)

  if (!roleAssignment) {
    roleAssignment = new RoleAssignment(roleAssignmentId)
    roleAssignment.role = role.id
    roleAssignment.nft = nft.id
    roleAssignment.grantor = grantor.id
    roleAssignment.grantee = grantee.id
    roleAssignment.createdAt = event.block.timestamp
    roleAssignment.nonce = nonce
    roleAssignment.tokenAmount = event.params._tokenAmount
  }

  roleAssignment.expirationDate = event.params._expirationDate
  roleAssignment.revocable = event.params._revocable
  roleAssignment.data = event.params._data
  roleAssignment.updatedAt = event.block.timestamp

  roleAssignment.save()
  return roleAssignment
}
