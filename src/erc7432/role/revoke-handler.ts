import { BigInt, log } from '@graphprotocol/graph-ts'
import { RoleRevoked } from '../../../generated/Roles/ERC7432Roles'
import { Account, Nft, Role } from '../../../generated/schema'
import { generateNftId, generateRoleId } from '../../utils/helper'

export function handleRoleRevoked(event: RoleRevoked): void {
  const tokenId = event.params._tokenId.toString()
  const tokenAddress = event.params._tokenAddress.toHexString()

  const nftId = generateNftId(tokenId, tokenAddress)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.warning('[handleRoleRevoked] NFT {} does not exist, skipping...', [nftId])
    return
  }

  const address = event.transaction.from.toHexString()
  const grantor = Account.load(address)
  if (!grantor) {
    log.warning('[handleRoleGranted] grantor {} does not exist, skipping...', [address])
    return
  }

  if (grantor.id != nft.owner) {
    log.warning('[handleRoleRevoked] NFT {} is not owned by {}, skipping...', [nftId, grantor.id])
    return
  }

  const granteeId = event.params._grantee.toHex()
  const grantee = Account.load(granteeId)

  if (!grantee) {
    log.warning('[handleRoleGranted] grantee {} does not exist, skipping...', [address])
    return
  }

  const roleId = generateRoleId(grantor.id, nft.id, grantee.id, event.params._role.toHex())
  const role = Role.load(roleId)

  if (!role) {
    log.warning('[handleRoleRevoked] Role {} does not exist, skipping...', [roleId])
    return
  }

  role.expirationDate = new BigInt(0)
  role.save()

  log.info('[handleRoleRevoked] Role: {} NFT: {} Tx: {}', [roleId, nftId, event.transaction.hash.toHex()])
}
