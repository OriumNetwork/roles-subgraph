export function generateId(tokenId: string, tokenAddress: string): string {
  return tokenId + '-' + tokenAddress
}
