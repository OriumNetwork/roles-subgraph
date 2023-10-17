import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Account, Nft, Role } from '../../generated/schema'
import { RoleGranted } from '../../generated/ERC7432-Immutable-Roles/ERC7432'

export function findOrCreateAccount(id: string): Account {
  const lowerCaseId = id.toLowerCase()
  let account = Account.load(lowerCaseId)
  if (!account) {
    account = new Account(lowerCaseId)
    account.save()
  }
  return account
}

export function createNft(id: string, contractAddress: string, tokenId: BigInt, owner: string): Nft {
  const nft = new Nft(id)
  nft.tokenId = tokenId
  nft.address = contractAddress.toLowerCase()
  nft.owner = owner.toLowerCase()
  nft.save()
  return nft
}

export function generateNftId(tokenAddress: string, tokenId: string): string {
  return tokenAddress + '-' + tokenId
}

export function generateRoleId(grantor: Account, grantee: Account, nft: Nft, role: Bytes): string {
  return grantor.id + '-' + grantee.id + '-' + nft.id + '-' + role.toHex()
}

export function findOrCreateRole(event: RoleGranted, grantor: Account, grantee: Account, nft: Nft): Role {
  const roleId = generateRoleId(grantor, grantee, nft, event.params._role)
  let role = Role.load(roleId)
  if (!role) {
    role = new Role(roleId)
    role.roleId = event.params._role
    role.nft = nft.id
    role.grantor = grantor.id
    role.grantee = grantee.id
  }
  role.expirationDate = event.params._expirationDate
  role.revocable = event.params._revocable
  role.data = event.params._data
  role.save()
  return role
}
