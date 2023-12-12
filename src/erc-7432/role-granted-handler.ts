import { log } from '@graphprotocol/graph-ts'
import { RoleGranted } from '../../generated/ERC7432/ERC7432'
import { Account, Nft } from '../../generated/schema'
import { generateERC721NftId, findOrCreateAccount, upsertERC721RoleAssignment } from '../../utils'

/** 
@dev This handler is called when a role is granted.
@param event RoleGranted The event emitted by the contract.

Example:
    event RoleGranted(
        bytes32 indexed _role,
        address indexed _tokenAddress,
        uint256 indexed _tokenId,
        address _grantor,
        address _grantee,
        uint64 _expirationDate,
        bool _revocable,
        bytes _data
    );
*/
export function handleRoleGranted(event: RoleGranted): void {
  const tokenId = event.params._tokenId
  const tokenAddress = event.params._tokenAddress.toHex()

  const nftId = generateERC721NftId(tokenAddress, tokenId)
  const nft = Nft.load(nftId)
  if (!nft) {
    log.error('[erc-7432][handleRoleGranted] NFT {} does not exist, tx {} skipping...', [
      nftId,
      event.transaction.hash.toHex(),
    ])
    return
  }

  const grantorAddress = event.params._grantor.toHex()
  const grantorAccount = Account.load(grantorAddress)
  if (!grantorAccount) {
    log.error('[erc-7432][handleRoleGranted] grantor {} does not exist, tx {} skipping...', [
      grantorAddress,
      event.transaction.hash.toHex(),
    ])
    return
  }
  if (grantorAccount.id != nft.owner) {
    log.error('[erc-7432][handleRoleGranted] NFT {} is not owned by {}, tx {} skipping...', [
      nftId,
      grantorAccount.id,
      event.transaction.hash.toHex(),
    ])
    return
  }

  const granteeAccount = findOrCreateAccount(event.params._grantee.toHex())
  const roleAssignment = upsertERC721RoleAssignment(event, grantorAccount, granteeAccount, nft)
  log.warning('[erc-7432][handleRoleGranted] roleAssignment: {} NFT: {} Tx: {}', [
    roleAssignment.id,
    nftId,
    event.transaction.hash.toHex(),
  ])
}
