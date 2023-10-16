import { log } from '@graphprotocol/graph-ts'
import { RoleGranted } from '../../../generated/ERC7432-Immutable-Roles/ERC7432'
import { Account, Nft, Role } from '../../../generated/schema'
import { generateNftId, generateRoleId, findOrCreateAccount } from '../../utils/helper'

export function handleRoleGranted(event: RoleGranted): void {
  const tokenId = event.params._tokenId.toString()
  const tokenAddress = event.params._tokenAddress.toHex()

  const nftId = generateNftId(tokenId, tokenAddress)
  const nft = Nft.load(nftId)
  if (!nft) {
    log.warning('[handleRoleGranted] NFT {} does not exist, skipping...', [nftId])
    return
  }

  const grantorAddress = event.params._grantor.toHex().toLowerCase()
  const grantor = Account.load(grantorAddress)
  if (!grantor) {
    log.warning('[handleRoleGranted] grantor {} does not exist, skipping...', [grantorAddress])
    return
  }
  if (grantor.id != nft.owner) {
    log.warning('[handleRoleGranted] NFT {} is not owned by {}, skipping...', [nftId, grantor.id])
    return
  }

  const granteeAccount = findOrCreateAccount(event.params._grantee.toHex())
  const role = createRole(event, grantor, granteeAccount, nft)
  log.info('[handleRoleGranted] Role: {} NFT: {} Tx: {}', [role.id, nftId, event.transaction.hash.toHex()])
}

function createRole(event: RoleGranted, grantor: Account, grantee: Account, nft: Nft): Role {
  const roleId = generateRoleId(grantor.id, nft.id, grantee.id, event.params._role.toHex())
  const role = new Role(roleId)
  role.roleId = event.params._role
  role.nft = nft.id
  role.grantor = grantor.id
  role.grantee = grantee.id
  role.expirationDate = event.params._expirationDate
  role.revocable = event.params._revocable
  role.data = event.params._data
  role.save()
  return role
}
