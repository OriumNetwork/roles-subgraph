export function generateId(tokenId: string, nftAddress: string): string {
  return nftAddress + '-' + tokenId
}
