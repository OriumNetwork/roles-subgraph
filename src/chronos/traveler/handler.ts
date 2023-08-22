import { Transfer } from '../../../generated/Traveler/ChronosTraveler'
import { generateId } from '../../utils/helper'
import { Account, Nft } from '../../../generated/schema'

export function handleTravelerTransfer(event: Transfer): void {
  const tokenId = event.params.tokenId
  const nftAddress = event.address.toHexString()

  const id = generateId(tokenId.toString(), nftAddress)

  let entity = Nft.load(id)
  if (!entity) {
    entity = new Nft(id)
    entity.tokenId = tokenId
    entity.address = nftAddress
  }

  const to = event.params.to.toHex()
  let toAccount = Account.load(to)
  if (!toAccount) {
    toAccount = new Account(to)
    toAccount.save()
  }

  const from = event.params.from.toHex()
  let fromAccount = Account.load(from)
  if (!fromAccount) {
    fromAccount = new Account(from)
    fromAccount.save()
  }

  entity.currentOwner = toAccount.id
  entity.previousOwner = fromAccount.id
  entity.originalOwner = toAccount.id
  entity.save()
}
