import { RoleApprovalForAll } from '../../generated/SftRolesRegistry/SftRolesRegistry'
import { findOrCreateRoleApproval, findOrCreateAccount, findOrCreateRolesRegistry } from '../../utils'
import { log } from '@graphprotocol/graph-ts'

/** 
@dev This handler is called when a role approval for all is set.
@param event RoleApprovalForAll The event emitted by the contract.

Example:
    event RoleApprovalForAll(address indexed _tokenAddress, address indexed _operator, bool _isApproved);
*/
export function handleRoleApprovalForAll(event: RoleApprovalForAll): void {
  const rolesRegistryAddress = event.address.toHex()
  const grantorAddress = event.transaction.from.toHex()
  const operatorAddress = event.params._operator.toHex()
  const tokenAddress = event.params._tokenAddress.toHex()
  const isApproved = event.params._isApproved

  const grantor = findOrCreateAccount(grantorAddress)
  const operator = findOrCreateAccount(operatorAddress)
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleApproval = findOrCreateRoleApproval(rolesRegistry, grantor, operator, tokenAddress)
  roleApproval.isApproved = isApproved
  roleApproval.save()

  log.warning('[sft-roles-registry][handleRoleApprovalForAll] Updated RoleAssignment Approval: {} Tx: {}', [
    roleApproval.id,
    event.transaction.hash.toHex(),
  ])
}
