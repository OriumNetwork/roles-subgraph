import { log } from '@graphprotocol/graph-ts'
import { RoleRevoked } from '../../../generated/ERC7432-Immutable-Roles/ERC7432'
import { Account, Nft, Role } from '../../../generated/schema'
import { generateNftId, generateRoleId } from '../../utils/helper'

export function handleRoleRevoked(event: RoleRevoked): void {
  const tokenId = event.params._tokenId.toString()
  const tokenAddress = event.params._tokenAddress.toHexString()

  const nftId = generateNftId(tokenAddress, tokenId)
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

  const roleId = generateRoleId(revoker, grantee, nft, event.params._role)
  const role = Role.load(roleId)
  if (!role) {
    log.warning('[handleRoleRevoked] Role {} does not exist, skipping...', [roleId])
    return
  }
  if (event.block.timestamp > role.expirationDate) {
    log.warning('[handleRoleRevoked] Role {} already expired, skipping...', [roleId])
    return
  }

  role.expirationDate = event.block.timestamp
  role.save()
  log.info('[handleRoleRevoked] Revoked Role: {} NFT: {} Tx: {}', [roleId, nftId, event.transaction.hash.toHex()])
}
