import { Nft } from '../../generated/schema'
import { Transfer } from '../../generated/ERC721-Chronos-Traveler/ERC721'
import { generateNftId, createNft, findOrCreateAccount } from '../utils/helper'

export function handleErc721Transfer(event: Transfer): void {
  const contractAddress = event.address.toHex()
  const tokenId = event.params.tokenId

  const account = findOrCreateAccount(event.params.to.toHex())

  const id = generateNftId(tokenId.toString(), contractAddress)
  const nft = Nft.load(id)
  if (!nft) {
    createNft(id, contractAddress, tokenId, account.id)
  } else {
    nft.owner = account.id
    nft.save()
  }
}
