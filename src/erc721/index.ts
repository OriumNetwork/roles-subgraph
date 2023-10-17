import { Nft } from '../../generated/schema'
import { Transfer } from '../../generated/ERC721-Chronos-Traveler/ERC721'
import { generateNftId, createNft, findOrCreateAccount } from '../utils/helper'

export function handleTransfer(event: Transfer): void {
  const tokenAddress = event.address.toHex()
  const tokenId = event.params.tokenId

  const account = findOrCreateAccount(event.params.to.toHex())

  const id = generateNftId(tokenAddress, tokenId.toString())
  const nft = Nft.load(id)
  if (!nft) {
    createNft(id, tokenAddress, tokenId, account.id)
  } else {
    nft.owner = account.id
    nft.save()
  }
}
