import { BigInt, Bytes, store } from '@graphprotocol/graph-ts'
import { Account, Nft, Role, RoleApproval, RoleAssignment } from '../../generated/schema'
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

export function generateRoleAssignmentId(grantor: Account, grantee: Account, nft: Nft, roleAssignment: Bytes): string {
  return grantor.id + '-' + grantee.id + '-' + nft.id + '-' + roleAssignment.toHex()
}

export function findOrCreateRoleAssignment(
  event: RoleGranted,
  grantor: Account,
  grantee: Account,
  nft: Nft,
): RoleAssignment {
  const roleAssignmentId = generateRoleAssignmentId(grantor, grantee, nft, event.params._role)
  let roleAssignment = RoleAssignment.load(roleAssignmentId)

  if (!roleAssignment) {
    roleAssignment = new RoleAssignment(roleAssignmentId)
    roleAssignment.role = findOrCreateRole(nft, event.params._role).id
    roleAssignment.nft = nft.id
    roleAssignment.grantor = grantor.id
    roleAssignment.grantee = grantee.id
  }

  roleAssignment.expirationDate = event.params._expirationDate
  roleAssignment.revocable = event.params._revocable
  roleAssignment.data = event.params._data
  roleAssignment.timestamp = event.block.timestamp
  roleAssignment.save()
  return roleAssignment
}

export function findOrCreateRole(nft: Nft, roleHash: Bytes): Role {
  let role = Role.load(generateRoleId(nft, roleHash))

  if (!role) {
    role = new Role(generateRoleId(nft, roleHash))
    role.roleHash = roleHash
    role.nft = nft.id
    role.save()
  }

  return role
}

export function generateRoleId(nft: Nft, roleHash: Bytes): string {
  return nft.id + '-' + roleHash.toHex()
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
  }
}
