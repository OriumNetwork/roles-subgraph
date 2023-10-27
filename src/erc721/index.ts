import { Transfer } from '../../generated/ERC721/ERC721'
import { upsertERC721Nft } from '../../utils'
import { log } from '@graphprotocol/graph-ts'

export function handleTransfer(event: Transfer): void {
  const tokenAddress = event.address.toHex()
  const tokenId = event.params.tokenId
  const accountAddress = event.params.to.toHex()

  upsertERC721Nft(tokenAddress, tokenId, accountAddress)

  log.warning('[erc721][handleTransfer] NFT {} transferred from {} to {} tx {}', [
    tokenId.toString(),
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.transaction.hash.toHex(),
  ])
}
