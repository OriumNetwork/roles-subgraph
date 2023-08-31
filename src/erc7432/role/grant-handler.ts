import { log } from '@graphprotocol/graph-ts'
import { RoleGranted } from '../../../generated/Roles/ERC7432Roles'
import { Account, Nft, Role } from '../../../generated/schema'
import { generateId } from '../../utils/helper'

export function handleRoleGranted(event: RoleGranted): void {
  const tokenId = event.params._tokenId.toString()
  const address = event.address.toHexString()

  const nftId = generateId(tokenId, address)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.warning('[handleRoleGranted] NFT {} does not exist, skipping transfer...', [nftId])
    return
  }

  const nftOwner = nft.owner
  const grantor = Account.load(address)

  if (!grantor || nftOwner != address) {
    log.warning('[handleRoleGranted] NFT {} is not owned by {}, skipping transfer...', [address])
    return
  }

  const granteeId = event.params._grantee.toHex()
  let grantee = Account.load(granteeId)

  if (!grantee) {
    grantee = new Account(granteeId)
    grantee.save()
  }

  const roleId = event.params._role.toHex()
  let role = Role.load(roleId)

  if (!role) {
    role = new Role(roleId)
  }

  role.nft = nft.id
  role.grantor = grantor.id
  role.grantee = grantee.id
  role.expirationDate = event.params._expirationDate
  role.data = event.params._data
  role.save()

  log.info('[handleRentalEnded] Role {} NFT {} ended, tx: {}', [roleId, nftId, event.transaction.hash.toHex()])
}
