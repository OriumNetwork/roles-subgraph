import { Account, RoleApproval, RolesRegistry } from '../../generated/schema'
import { store } from '@graphprotocol/graph-ts'

export function generateRoleApprovalId(
  roleRegistry: RolesRegistry,
  grantor: Account,
  operator: Account,
  tokenAddress: string,
): string {
  return roleRegistry.id + '-' + grantor.id + '-' + operator.id + '-' + tokenAddress.toLowerCase()
}

export function findOrCreateRoleApproval(
  rolesRegistry: RolesRegistry,
  grantor: Account,
  operator: Account,
  tokenAddress: string,
): RoleApproval {
  const roleApprovalId = generateRoleApprovalId(rolesRegistry, grantor, operator, tokenAddress)
  let roleApproval = RoleApproval.load(roleApprovalId)
  if (roleApproval) return roleApproval

  roleApproval = new RoleApproval(roleApprovalId)
  roleApproval.grantor = grantor.id
  roleApproval.operator = operator.id
  roleApproval.tokenAddress = tokenAddress
  roleApproval.rolesRegistry = rolesRegistry.id
  roleApproval.save()
  return roleApproval
}

export function deleteRoleApproval(
  rolesRegistry: RolesRegistry,
  grantor: Account,
  operator: Account,
  tokenAddress: string,
): void {
  const roleApprovalId = generateRoleApprovalId(rolesRegistry, grantor, operator, tokenAddress)
  if (!RoleApproval.load(roleApprovalId)) return
  store.remove('RoleApproval', roleApprovalId)
}
