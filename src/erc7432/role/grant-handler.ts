import { log } from '@graphprotocol/graph-ts'
import { RoleGranted } from '../../../generated/ERC7432-Immutable-Roles/ERC7432'
import { Account, Nft } from '../../../generated/schema'
import { generateNftId, findOrCreateAccount, findOrCreateRoleAssignment } from '../../utils/helper'

export function handleRoleGranted(event: RoleGranted): void {
  const tokenId = event.params._tokenId.toString()
  const tokenAddress = event.params._tokenAddress.toHex()

  const nftId = generateNftId(tokenAddress, tokenId)
  const nft = Nft.load(nftId)
  if (!nft) {
    log.warning('[handleRoleGranted] NFT {} does not exist, skipping...', [nftId])
    return
  }

  const grantorAddress = event.params._grantor.toHex().toLowerCase()
  const grantorAccount = Account.load(grantorAddress)
  if (!grantorAccount) {
    log.warning('[handleRoleGranted] grantor {} does not exist, skipping...', [grantorAddress])
    return
  }
  if (grantorAccount.id != nft.owner) {
    log.warning('[handleRoleGranted] NFT {} is not owned by {}, skipping...', [nftId, grantorAccount.id])
    return
  }

  const granteeAccount = findOrCreateAccount(event.params._grantee.toHex())
  const roleAssignment = findOrCreateRoleAssignment(event, grantorAccount, granteeAccount, nft)
  log.warning('[handleRoleGranted] roleAssignment: {} NFT: {} Tx: {}', [
    roleAssignment.id,
    nftId,
    event.transaction.hash.toHex(),
  ])
}
