import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Account, Nft, Role } from '../../generated/schema'
import { generateNftId, generateRoleId } from '../../src/utils/helper'

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

export function createMockRole(
  role: Bytes,
  grantor: string,
  grantee: string,
  tokenAddress: string,
  tokenId: string,
  expirationDate: BigInt,
): Role {
  const nft = new Nft(generateNftId(tokenAddress, tokenId))
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
