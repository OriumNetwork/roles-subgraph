import { log } from '@graphprotocol/graph-ts'
import { RoleRevoked } from '../../../generated/Roles/ERC7432Roles'
import { Nft, Role } from '../../../generated/schema'
import { generateId } from '../../utils/helper'

export function handleRoleRevoked(event: RoleRevoked): void {
  const tokenId = event.params._tokenId.toString()
  const address = event.address.toHexString()

  const nftId = generateId(tokenId, address)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.info('NFT {} does not exist, skipping transfer...', [nftId])
    return
  }

  const nftOwner = nft.owner

  if (nftOwner != address) {
    log.info('NFT {} is not owned by {}, skipping transfer...', [address])
    return
  }

  if (event.address!) let entity = Role.load(event.params._role.toHex())

  if (entity == null) {
    entity = new Role(event.params._role.toHex())
  }

  entity.account = event.params.account.toHex()
  entity.save()
}
