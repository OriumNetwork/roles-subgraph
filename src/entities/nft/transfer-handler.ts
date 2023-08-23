import { Account, Nft } from '../../../generated/schema'
import { NftTransfer } from '../../interfaces/nft-transfer'

export function handleNftTransfer(nft: NftTransfer): void {
  let entity = Nft.load(nft.id)
  if (!entity) {
    entity = new Nft(nft.id)
    entity.tokenId = nft.tokenId
    entity.address = nft.address
  }

  let toAccount = Account.load(nft.to)
  if (!toAccount) {
    toAccount = new Account(nft.to)
    toAccount.save()
  }

  let fromAccount = Account.load(nft.from)
  if (!fromAccount) {
    fromAccount = new Account(nft.from)
    fromAccount.save()
  }

  entity.owner = toAccount.id
  entity.save()
}
