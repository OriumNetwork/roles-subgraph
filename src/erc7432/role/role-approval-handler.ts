import { RoleApprovalForAll } from '../../../generated/ERC7432/ERC7432'
import {
  findOrCreateAccount,
  findOrCreateRoleApproval,
  deleteRoleApproval,
  generateRoleApprovalId,
  findOrCreateRolesRegistry,
} from '../../../utils'
import { log } from '@graphprotocol/graph-ts'

export function handleRoleApprovalForAll(event: RoleApprovalForAll): void {
  const rolesRegistryAddress = event.address.toHex()
  const grantorAddress = event.transaction.from.toHex()
  const operatorAddress = event.params._operator.toHex()
  const tokenAddress = event.params._tokenAddress.toHex()
  const isApproved = event.params._isApproved

  const grantorAccount = findOrCreateAccount(grantorAddress)
  const operatorAccount = findOrCreateAccount(operatorAddress)
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)

  if (isApproved) {
    const roleApproval = findOrCreateRoleApproval(rolesRegistry, grantorAccount, operatorAccount, tokenAddress)
    log.warning('[handleRoleApprovalForAll] Updated RoleAssignment Approval: {} Tx: {}', [
      roleApproval.id,
      event.transaction.hash.toHex(),
    ])
  } else {
    deleteRoleApproval(rolesRegistry, grantorAccount, operatorAccount, tokenAddress)
    log.warning('[handleRoleApprovalForAll] Removed RoleAssignment Approval: {} Tx: {}', [
      generateRoleApprovalId(rolesRegistry, grantorAccount, operatorAccount, tokenAddress),
      event.transaction.hash.toHex(),
    ])
  }
}
