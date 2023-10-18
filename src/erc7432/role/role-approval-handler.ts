import { RoleApprovalForAll } from '../../../generated/ERC7432-Immutable-Roles/ERC7432'
import {
  findOrCreateAccount,
  insertRoleApprovalIfNotExist,
  deleteRoleApprovalIfExist,
  generateRoleApprovalId,
} from '../../utils/helper'
import { log } from '@graphprotocol/graph-ts'

export function handleRoleApprovalForAll(event: RoleApprovalForAll): void {
  const grantorAddress = event.transaction.from.toHex()
  const operatorAddress = event.params._operator.toHex()
  const tokenAddress = event.params._tokenAddress.toHex()
  const isApproved = event.params._isApproved

  const grantorAccount = findOrCreateAccount(grantorAddress)
  const operatorAccount = findOrCreateAccount(operatorAddress)

  if (isApproved) {
    const roleApproval = insertRoleApprovalIfNotExist(grantorAccount, operatorAccount, tokenAddress)
    log.warning('[handleRoleApprovalForAll] Updated Role Approval: {} Tx: {}', [
      roleApproval.id,
      event.transaction.hash.toHex(),
    ])
  } else {
    const roleApprovalId = generateRoleApprovalId(grantorAccount, operatorAccount, tokenAddress)
    deleteRoleApprovalIfExist(roleApprovalId)
    log.warning('[handleRoleApprovalForAll] Removed Role Approval: {} Tx: {}', [
      roleApprovalId,
      event.transaction.hash.toHex(),
    ])
  }
}
