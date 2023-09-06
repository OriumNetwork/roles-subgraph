import { log } from '@graphprotocol/graph-ts'
import { RoleGranted } from '../../../generated/Roles/ERC7432Roles'
import { Account, Nft, Role } from '../../../generated/schema'
import { generateNftId, generateRoleId } from '../../utils/helper'

export function handleRoleGranted(event: RoleGranted): void {
  const tokenId = event.params._tokenId.toString()
  const tokenAddress = event.params._tokenAddress.toHexString()

  const nftId = generateNftId(tokenId, tokenAddress)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.warning('[handleRoleGranted] NFT {} does not exist, skipping...', [nftId])
    return
  }

  const address = event.address.toHexString()
  const grantor = Account.load(address)

  if (!grantor) {
    log.warning('[handleRoleGranted] grantor {} does not exist, skipping...', [address])
    return
  }

  if (grantor.id != nft.owner) {
    log.warning('[handleRoleGranted] NFT {} is not owned by {}, skipping...', [nftId, grantor.id.toString()])
    return
  }

  const granteeId = event.params._grantee.toHex()
  let grantee = Account.load(granteeId)

  if (!grantee) {
    grantee = new Account(granteeId)
    grantee.save()
  }

  const roleId = generateRoleId(grantor.id, nft.id, grantee.id, event.params._role.toHex())
  let role = Role.load(roleId)

  if (!role) {
    role = new Role(roleId)
  }

  role.roleId = event.params._role
  role.nft = nft.id
  role.grantor = grantor.id
  role.grantee = grantee.id
  role.expirationDate = event.params._expirationDate
  role.data = event.params._data
  role.save()

  log.info('[handleRoleGranted] Role: {} NFT: {} Tx: {}', [roleId, nftId, event.transaction.hash.toHex()])
}
