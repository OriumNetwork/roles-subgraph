import { log } from '@graphprotocol/graph-ts'
import { RoleGranted } from '../../generated/SftRolesRegistry/SftRolesRegistry'
import { Account, Nft } from '../../generated/schema'
import { generateERC721NftId, findOrCreateAccount, findOrCreateRoleAssignment } from '../../utils'

export function handleRoleGranted(event: RoleGranted): void {
  const tokenId = event.params._tokenId
  const tokenAddress = event.params._tokenAddress.toHex()

  const nftId = generateERC721NftId(tokenAddress, tokenId)
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
