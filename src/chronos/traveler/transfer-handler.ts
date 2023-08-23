import { Transfer } from '../../../generated/Traveler/ChronosTraveler'
import { handleERC721Transfer } from '../../erc721/transfer-handler'

export function handleTravelerTransfer(event: Transfer): void {
  handleERC721Transfer(event)
}
