export function generateId(tokenId: string, tokenAddress: string): string {
  return tokenId + '-' + tokenAddress
}

export function generateRoleId(grantor: string, nftId: string, grantee: string, role: string): string {
  return grantor + '-' + nftId + '-' + grantee + '-' + role
}
