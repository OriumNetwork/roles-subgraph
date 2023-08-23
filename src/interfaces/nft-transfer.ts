/* eslint-disable @typescript-eslint/ban-types */
import { BigInt } from '@graphprotocol/graph-ts'

export class NftTransfer {
  address: string
  from: string
  to: string
  tokenId: BigInt
  id: string
}
