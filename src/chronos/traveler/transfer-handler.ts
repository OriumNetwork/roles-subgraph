import { Transfer } from '../../../generated/Traveler/ChronosTraveler'
import { handleNftTransfer } from '../../entities/nft/transfer-handler'
import { NftTransfer } from '../../interfaces/nft-transfer'
import { generateNftId } from '../../utils/helper'

export function handleTravelerTransfer(event: Transfer): void {
  const tokenId = event.params.tokenId
  const address = event.address.toHexString()

  const id = generateNftId(tokenId.toString(), address)

  const nft: NftTransfer = {
    id: id,
    tokenId: tokenId,
    address: address,
    from: event.params.from.toHex(),
    to: event.params.to.toHex(),
  }

  handleNftTransfer(nft)
}
