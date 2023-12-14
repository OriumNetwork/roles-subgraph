import { Transfer } from '../../generated/ERC721/ERC721'
import { upsertERC721Nft } from '../../utils'
import { log } from '@graphprotocol/graph-ts'

/** 
@dev This handler is called when a token is transferred.
@param event Transfer The event emitted by the contract.

Example:
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
*/
export function handleTransfer(event: Transfer): void {
  const tokenAddress = event.address.toHex()
  const tokenId = event.params.tokenId
  const from = event.params.from.toHex()
  const to = event.params.to.toHex()

  upsertERC721Nft(tokenAddress, tokenId, to)

  log.warning('[erc-721][handleTransfer] NFT {} transferred from {} to {} tx {}', [
    tokenId.toString(),
    from,
    to,
    event.transaction.hash.toHex(),
  ])
}
