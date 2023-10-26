import { log } from '@graphprotocol/graph-ts'
import { TransferSingle } from '../../generated/ERC1155/ERC1155'
import { upsertERC1155Nft } from '../../utils'

/** 
@dev This handler is called when a token is transferred.
@param event TransferSingle The event emitted by the contract.

Example:
    emit TransferSingle(operator, from, to, id, value);
*/
export function handleTransferSingle(event: TransferSingle): void {
  const tokenAddress = event.address.toHex()
  const tokenId = event.params.id
  const fromAddress = event.params.to.toHex()
  const toAddress = event.params.to.toHex()
  const amount = event.params.value

  const nft = upsertERC1155Nft(tokenAddress, tokenId, amount, fromAddress, toAddress)

  log.warning('[erc1155][handleTransferSingle] NFT {} amount {} transferred from {} to {} tx {}', [
    nft.id,
    amount.toString(),
    fromAddress,
    toAddress,
    event.transaction.hash.toHex(),
  ])
}
