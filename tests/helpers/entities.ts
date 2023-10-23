import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Account, Nft, RoleAssignment, RoleApproval } from '../../generated/schema'
import { generateNftId, generateRoleAssignmentId, generateRoleApprovalId } from '../../src/utils/helper'
import { assert } from 'matchstick-as'

export function createMockNft(tokenAddress: string, tokenId: string, ownerAddress: string): Nft {
  const nft = new Nft(generateNftId(tokenAddress, tokenId))
  nft.tokenAddress = tokenAddress
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

export function createMockRoleAssignment(
  roleHash: Bytes,
  grantor: string,
  grantee: string,
  nft: Nft,
  expirationDate: BigInt,
): RoleAssignment {
  const roleAssignmentId = generateRoleAssignmentId(new Account(grantor), new Account(grantee), nft, roleHash)
  const newRoleAssignment = new RoleAssignment(roleAssignmentId)
  newRoleAssignment.role = `${nft.id}-${roleHash.toHex()}`
  newRoleAssignment.nft = nft.id
  newRoleAssignment.grantor = grantor
  newRoleAssignment.grantee = grantee
  newRoleAssignment.expirationDate = expirationDate
  newRoleAssignment.revocable = true
  newRoleAssignment.data = Bytes.fromUTF8('data')
  newRoleAssignment.createdAt = BigInt.fromI32(123)
  newRoleAssignment.save()
  return newRoleAssignment
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
  roleAssignment: Bytes,
  expirationDate: BigInt,
  data: Bytes,
): void {
  const _id = generateRoleAssignmentId(grantor, grantee, nft, roleAssignment)
  assert.fieldEquals('RoleAssignment', _id, 'role', `${nft.id}-${roleAssignment.toHex()}`)
  assert.fieldEquals('RoleAssignment', _id, 'nft', nft.id)
  assert.fieldEquals('RoleAssignment', _id, 'grantor', grantor.id)
  assert.fieldEquals('RoleAssignment', _id, 'grantee', grantee.id)
  assert.fieldEquals('RoleAssignment', _id, 'expirationDate', expirationDate.toString())
  assert.fieldEquals('RoleAssignment', _id, 'data', data.toHex())
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
