import { log } from '@graphprotocol/graph-ts'
import { RoleRevoked } from '../../../generated/ERC7432/ERC7432'
import { Account, Nft, RoleAssignment } from '../../../generated/schema'
import { findOrCreateRolesRegistry, generateERC721NftId, generateRoleAssignmentId } from '../../../utils'

export function handleRoleRevoked(event: RoleRevoked): void {
  const tokenId = event.params._tokenId
  const tokenAddress = event.params._tokenAddress.toHexString()

  const nftId = generateERC721NftId(tokenAddress, tokenId)
  const nft = Nft.load(nftId)
  if (!nft) {
    log.warning('[handleRoleRevoked] NFT {} does not exist, skipping...', [nftId])
    return
  }

  const revokerAddress = event.params._revoker.toHex().toLowerCase()
  const revoker = Account.load(revokerAddress)
  if (!revoker) {
    log.warning('[handleRoleGranted] revoker {} does not exist, skipping...', [revokerAddress])
    return
  }

  const granteeAddress = event.params._grantee.toHex().toLowerCase()
  const grantee = Account.load(granteeAddress)
  if (!grantee) {
    log.warning('[handleRoleGranted] grantee {} does not exist, skipping...', [granteeAddress])
    return
  }
  const rolesRegistry = findOrCreateRolesRegistry(event.address.toHex())
  const roleAssignmentId = generateRoleAssignmentId(rolesRegistry, revoker, grantee, nft, event.params._role)
  const roleAssignment = RoleAssignment.load(roleAssignmentId)
  if (!roleAssignment) {
    log.warning('[handleRoleRevoked] RoleAssignment {} does not exist, skipping...', [roleAssignmentId])
    return
  }
  if (event.block.timestamp > roleAssignment.expirationDate) {
    log.warning('[handleRoleRevoked] RoleAssignment {} already expired, skipping...', [roleAssignmentId])
    return
  }

  roleAssignment.expirationDate = event.block.timestamp
  roleAssignment.save()
  log.warning('[handleRoleRevoked] Revoked RoleAssignment: {} NFT: {} Tx: {}', [
    roleAssignmentId,
    nftId,
    event.transaction.hash.toHex(),
  ])
}
