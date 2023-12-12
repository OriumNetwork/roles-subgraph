import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Nft, Role, RolesRegistry } from '../../generated/schema'

/**
 * @notice Generate a role id.
 * @dev rolesRegistry, nft, roleHash should be created/exist before calling this function.
 * @param rolesRegistry The roles registry used for the role.
 * @param nft The nft of the role.
 * @param roleHash The role hash of the role.
 * @returns The role id.
 */
export function generateRoleId(rolesRegistry: RolesRegistry, nft: Nft, roleHash: Bytes): string {
  return rolesRegistry.id + '-' + nft.id + '-' + roleHash.toHex()
}

/**
 * @notice Find or create a role.
 * @dev rolesRegistry, nft, roleHash should be created/exist before calling this function.
 * @param rolesRegistry The roles registry used for the role.
 * @param nft The nft of the role.
 * @param roleHash The role hash of the role.
 * @returns The role entity created (or found).
 */
export function findOrCreateRole(rolesRegistry: RolesRegistry, nft: Nft, roleHash: Bytes): Role {
  const roleId = generateRoleId(rolesRegistry, nft, roleHash)
  let role = Role.load(roleId)

  if (!role) {
    role = new Role(roleId)
    role.roleHash = roleHash
    role.nft = nft.id
    role.rolesRegistry = rolesRegistry.id
    role.save()
  }

  return role
}

/**
 * @notice Batch find or create a role.
 * @dev rolesRegistry, nft, roleHash should be created/exist before calling this function.
 * @param rolesRegistry The roles registry used for the role.
 * @param nft The nft of the role.
 * @param roleHash The role hash of the role.
 * @returns The role entity created (or found).
 */
export function findOrCreateRoles(rolesRegistry: RolesRegistry, nft: Nft, roleHashes: Bytes[]): string[] {
  const roles: string[] = []

  for (let i = 0; i < roleHashes.length; i++) {
    roles.push(findOrCreateRole(rolesRegistry, nft, roleHashes[i]).id)
  }

  return roles
}
