import { Transfer } from '../../generated/ERC721/ERC721'
import { NftType, upsertERC721Nft, upsertNftCollection } from '../../utils'
import { log } from '@graphprotocol/graph-ts'

export function handleTransfer(event: Transfer): void {
  const from = event.params.from.toHex()
  const to = event.params.to.toHex()
  const tokenAddress = event.address.toHex()
  const tokenId = event.params.tokenId

  upsertERC721Nft(tokenAddress, tokenId, to)
  upsertNftCollection(NftType.ERC721, tokenAddress, tokenId, from, to)

  log.warning('[erc721][handleTransfer] NFT {} transferred from {} to {} tx {}', [
    tokenId.toString(),
    from,
    to,
    event.transaction.hash.toHex(),
  ])
}
