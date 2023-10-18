import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Account, Nft, Role, RoleApproval } from '../../generated/schema'
import { generateNftId, generateRoleId, generateRoleApprovalId } from '../../src/utils/helper'
import { assert } from 'matchstick-as'

export function createMockNft(tokenAddress: string, tokenId: string, ownerAddress: string): Nft {
  const nft = new Nft(generateNftId(tokenAddress, tokenId))
  nft.address = tokenAddress
  nft.tokenId = BigInt.fromString(tokenId)

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

export function createMockRole(role: Bytes, grantor: string, grantee: string, nft: Nft, expirationDate: BigInt): Role {
  const roleId = generateRoleId(new Account(grantor), new Account(grantee), nft, role)
  const newRole = new Role(roleId)
  newRole.roleId = role
  newRole.nft = nft.id
  newRole.grantor = grantor
  newRole.grantee = grantee
  newRole.expirationDate = expirationDate
  newRole.revocable = true
  newRole.data = Bytes.fromUTF8('data')
  newRole.save()
  return newRole
}

export function createMockRoleApproval(grantor: string, operator: string, tokenAddress: string): RoleApproval {
  const roleApprovalId = generateRoleApprovalId(new Account(grantor), new Account(operator), tokenAddress)
  const roleApproval = new RoleApproval(roleApprovalId)
  roleApproval.grantor = grantor
  roleApproval.operator = operator
  roleApproval.tokenAddress = tokenAddress
  roleApproval.save()
  return roleApproval
}

export function validateRole(
  grantor: Account,
  grantee: Account,
  nft: Nft,
  role: Bytes,
  expirationDate: BigInt,
  data: Bytes,
): void {
  const _id = generateRoleId(grantor, grantee, nft, role)
  assert.fieldEquals('Role', _id, 'roleId', role.toHex())
  assert.fieldEquals('Role', _id, 'nft', nft.id)
  assert.fieldEquals('Role', _id, 'grantor', grantor.id)
  assert.fieldEquals('Role', _id, 'grantee', grantee.id)
  assert.fieldEquals('Role', _id, 'expirationDate', expirationDate.toString())
  assert.fieldEquals('Role', _id, 'data', data.toHex())
}

export function validateRoleApproval(grantor: string, operator: string, tokenAddress: string): void {
  const roleApprovalId = generateRoleApprovalId(
    new Account(grantor.toLowerCase()),
    new Account(operator.toLowerCase()),
    tokenAddress,
  )
  assert.fieldEquals('RoleApproval', roleApprovalId, 'grantor', grantor)
  assert.fieldEquals('RoleApproval', roleApprovalId, 'operator', operator)
  assert.fieldEquals('RoleApproval', roleApprovalId, 'tokenAddress', tokenAddress)
}
