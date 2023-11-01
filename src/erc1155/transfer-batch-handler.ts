import { log } from '@graphprotocol/graph-ts'
import { TransferBatch } from '../../generated/ERC1155/ERC1155'
import { upsertERC1155Nft } from '../../utils'

/** 
@dev This handler is called when a token is transferred.
@param event TransferBatch The event emitted by the contract.

Example:
    emit TransferBatch(operator, from, to, ids, amounts);
*/
export function handleTransferBatch(event: TransferBatch): void {
  const tokenAddress = event.address.toHex()
  const tokenIds = event.params.ids
  const fromAddress = event.params.from.toHex()
  const toAddress = event.params.to.toHex()
  const amounts = event.params.values

  if (tokenIds.length != amounts.length) {
    log.error('[erc1155][handleTransferBatch] tokenIds length {} does not match amounts length {}, tx {}', [
      tokenIds.length.toString(),
      amounts.length.toString(),
      event.transaction.hash.toHex(),
    ])
    return
  }

  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i]
    const amount = amounts[i]

    const nft = upsertERC1155Nft(tokenAddress, tokenId, amount, fromAddress, toAddress)

    log.warning('[erc1155][handleTransferBatch] NFT {} amount {} transferred from {} to {} tx {}', [
      nft.id,
      amount.toString(),
      fromAddress,
      toAddress,
      event.transaction.hash.toHex(),
    ])
  }
}
