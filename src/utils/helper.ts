import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Account, Nft } from '../../generated/schema'

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
