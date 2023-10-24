import { BigInt, Bytes, store } from '@graphprotocol/graph-ts'
import { Account, Nft, Role, RoleApproval, RoleAssignment, RolesRegistry } from '../../generated/schema'
import { RoleGranted } from '../../generated/ERC7432-Immutable-Roles/ERC7432'

export function findOrCreateAccount(id: string): Account {
  const lowerCaseId = id.toLowerCase()
  let account = Account.load(lowerCaseId)
  if (!account) {
    account = new Account(lowerCaseId)
    account.save()
  }
  return account
}

export function createNft(id: string, contractAddress: string, tokenId: BigInt, owner: string): Nft {
  const nft = new Nft(id)
  nft.tokenId = tokenId
  nft.tokenAddress = contractAddress.toLowerCase()
  nft.owner = owner.toLowerCase()
  nft.save()
  return nft
}

export function generateNftId(tokenAddress: string, tokenId: string): string {
  return tokenAddress + '-' + tokenId
}

export function generateRoleAssignmentId(
  roleRegistryAddress: string,
  grantor: Account,
  grantee: Account,
  nft: Nft,
  roleAssignment: Bytes,
): string {
  return roleRegistryAddress + '-' + grantor.id + '-' + grantee.id + '-' + nft.id + '-' + roleAssignment.toHex()
}

export function findOrCreateRoleAssignment(
  event: RoleGranted,
  grantor: Account,
  grantee: Account,
  nft: Nft,
): RoleAssignment {
  const roleAssignmentId = generateRoleAssignmentId(event.address.toHex(), grantor, grantee, nft, event.params._role)
  let roleAssignment = RoleAssignment.load(roleAssignmentId)

  if (!roleAssignment) {
    roleAssignment = new RoleAssignment(roleAssignmentId)
    roleAssignment.role = findOrCreateRole(event.address.toHex(), nft, event.params._role).id
    roleAssignment.rolesRegistry = findOrCreateRolesRegistry(event.address.toHex()).id
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

export function findOrCreateRole(roleRegistryAddress: string, nft: Nft, roleHash: Bytes): Role {
  const roleId = generateRoleId(roleRegistryAddress, nft, roleHash)
  let role = Role.load(roleId)

  if (!role) {
    role = new Role(roleId)
    role.roleHash = roleHash
    role.nft = nft.id
    role.rolesRegistry = findOrCreateRolesRegistry(roleRegistryAddress).id
    role.save()
  }

  return role
}

export function generateRoleId(roleRegistryAddress: string, nft: Nft, roleHash: Bytes): string {
  return roleRegistryAddress + '-' + nft.id + '-' + roleHash.toHex()
}

export function generateRoleApprovalId(
  rolesRegistryAddress: string,
  grantor: Account,
  operator: Account,
  tokenAddress: string,
): string {
  return rolesRegistryAddress + '-' + grantor.id + '-' + operator.id + '-' + tokenAddress.toLowerCase()
}

export function insertRoleApprovalIfNotExist(
  rolesRegistryAddress: string,
  grantor: Account,
  operator: Account,
  tokenAddress: string,
): RoleApproval {
  const roleApprovalId = generateRoleApprovalId(rolesRegistryAddress, grantor, operator, tokenAddress)
  let roleApproval = RoleApproval.load(roleApprovalId)
  if (!roleApproval) {
    roleApproval = new RoleApproval(roleApprovalId)
    roleApproval.grantor = grantor.id
    roleApproval.operator = operator.id
    roleApproval.tokenAddress = tokenAddress.toLowerCase()
    roleApproval.rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress).id
    roleApproval.save()
  }
  return roleApproval
}

export function deleteRoleApprovalIfExist(roleApprovalId: string): void {
  const roleApproval = RoleApproval.load(roleApprovalId)
  if (roleApproval) {
    store.remove('RoleApproval', roleApprovalId)
  }
}

export function findOrCreateRolesRegistry(rolesRegistryAddress: string): RolesRegistry {
  let rolesRegistry = RolesRegistry.load(rolesRegistryAddress)

  if (!rolesRegistry) {
    rolesRegistry = new RolesRegistry(rolesRegistryAddress)
    rolesRegistry.save()
  }

  return rolesRegistry
}
