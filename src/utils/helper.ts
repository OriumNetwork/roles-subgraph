import { BigInt, Bytes, log, store } from '@graphprotocol/graph-ts'
import { Account, Nft, Role, RoleApproval } from '../../generated/schema'
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

export function generateRoleApprovalId(grantor: Account, operator: Account, tokenAddress: string): string {
  return grantor.id + '-' + operator.id + '-' + tokenAddress.toLowerCase()
}

export function insertRoleApprovalIfNotExist(grantor: Account, operator: Account, tokenAddress: string): RoleApproval {
  const roleApprovalId = generateRoleApprovalId(grantor, operator, tokenAddress)
  let roleApproval = RoleApproval.load(roleApprovalId)
  if (!roleApproval) {
    roleApproval = new RoleApproval(roleApprovalId)
    roleApproval.grantor = grantor.id
    roleApproval.operator = operator.id
    roleApproval.tokenAddress = tokenAddress.toLowerCase()
    roleApproval.save()
  }
  return roleApproval
}

export function deleteRoleApprovalIfExist(roleApprovalId: string): void {
  const roleApproval = RoleApproval.load(roleApprovalId)
  if (roleApproval) {
    store.remove('RoleApproval', roleApprovalId)
    log.info('[handleRoleApprovalForAll] Removing Role Approval: {}', [roleApproval.id])
  }
}
