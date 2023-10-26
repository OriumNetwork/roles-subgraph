import { RolesRegistry } from '../../generated/schema'

export function findOrCreateRolesRegistry(rolesRegistryAddress: string): RolesRegistry {
  let rolesRegistry = RolesRegistry.load(rolesRegistryAddress)

  if (!rolesRegistry) {
    rolesRegistry = new RolesRegistry(rolesRegistryAddress)
    rolesRegistry.save()
  }

  return rolesRegistry
}
