import { BigInt, log } from '@graphprotocol/graph-ts'
import { RoleRevoked } from '../../../generated/Roles/ERC7432Roles'
import { Nft, Role } from '../../../generated/schema'
import { generateId } from '../../utils/helper'

export function handleRoleRevoked(event: RoleRevoked): void {
  const tokenId = event.params._tokenId.toString()
  const address = event.address.toHexString()

  const nftId = generateId(tokenId, address)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.warning('[handleRoleRevoked] NFT {} does not exist, skipping transfer...', [nftId])
    return
  }

  const nftOwner = nft.owner

  if (nftOwner != address) {
    log.warning('[handleRoleRevoked] NFT {} is not owned by {}, skipping transfer...', [address])
    return
  }

  const roleId = event.params._role.toHex()
  const role = Role.load(roleId)

  if (!role) {
    log.warning('[handleRoleRevoked] Role {} does not exist, skipping transfer...', [roleId])
    return
  }

  role.expirationDate = new BigInt(0)
  role.save()

  log.info('[handleRoleRevoked] Role {} NFT {} ended, tx: {}', [roleId, nftId, event.transaction.hash.toHex()])
}
