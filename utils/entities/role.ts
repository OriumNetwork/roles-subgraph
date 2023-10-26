import { Bytes } from '@graphprotocol/graph-ts'
import { Nft, Role, RolesRegistry } from '../../generated/schema'

export function generateRoleId(rolesRegistry: RolesRegistry, nft: Nft, roleHash: Bytes): string {
  return rolesRegistry.id + '-' + nft.id + '-' + roleHash.toHex()
}

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
