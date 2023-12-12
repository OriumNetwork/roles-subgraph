import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Account, Nft, RoleAssignment, RoleApproval, Role } from '../../generated/schema'
import {
  generateERC721NftId,
  generateRoleAssignmentId,
  generateRoleApprovalId,
  generateRoleId,
  findOrCreateRolesRegistry,
  NftType,
} from '../../utils'

export function createMockNft(tokenAddress: string, tokenId: string, ownerAddress: string): Nft {
  const nft = new Nft(generateERC721NftId(tokenAddress, BigInt.fromString(tokenId)))
  nft.tokenAddress = tokenAddress
  nft.tokenId = BigInt.fromString(tokenId)
  nft.type = NftType.ERC721

  const nftOwner = createMockAccount(ownerAddress)

  nft.owner = nftOwner.id
  nft.save()
  return nft
}

export function createMockAccount(ethAddress: string): Account {
  const account = new Account(ethAddress)
  account.save()
  return account
}

export function createMockRoleAssignment(
  roleHash: Bytes,
  grantor: string,
  grantee: string,
  nft: Nft,
  expirationDate: BigInt,
  rolesRegistryAddress: string,
): RoleAssignment {
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleId = generateRoleId(rolesRegistry, nft, roleHash)
  const role = new Role(roleId)
  role.roleHash = roleHash
  role.nft = nft.id
  role.rolesRegistry = rolesRegistryAddress
  role.lastNonRevocableExpirationDate = BigInt.zero()
  role.save()

  const roleAssignmentId = generateRoleAssignmentId(
    rolesRegistry,
    new Account(grantor),
    new Account(grantee),
    nft,
    roleHash,
  )
  const newRoleAssignment = new RoleAssignment(roleAssignmentId)
  newRoleAssignment.role = role.id
  newRoleAssignment.nft = nft.id
  newRoleAssignment.grantor = grantor
  newRoleAssignment.grantee = grantee
  newRoleAssignment.expirationDate = expirationDate
  newRoleAssignment.revocable = true
  newRoleAssignment.data = Bytes.fromUTF8('data')
  newRoleAssignment.createdAt = BigInt.fromI32(123)
  newRoleAssignment.updatedAt = BigInt.fromI32(123)
  newRoleAssignment.save()
  return newRoleAssignment
}

export function createMockRoleApproval(
  grantor: string,
  operator: string,
  tokenAddress: string,
  rolesRegistryAddress: string,
  isApproved: boolean,
): RoleApproval {
  const rolesRegistry = findOrCreateRolesRegistry(rolesRegistryAddress)
  const roleApprovalId = generateRoleApprovalId(
    rolesRegistry,
    new Account(grantor),
    new Account(operator),
    tokenAddress,
  )
  const roleApproval = new RoleApproval(roleApprovalId)
  roleApproval.grantor = grantor
  roleApproval.operator = operator
  roleApproval.tokenAddress = tokenAddress
  roleApproval.rolesRegistry = rolesRegistryAddress
  roleApproval.isApproved = isApproved
  roleApproval.save()
  return roleApproval
}
