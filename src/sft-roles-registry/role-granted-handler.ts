import { log } from '@graphprotocol/graph-ts'
import { RoleGranted } from '../../generated/SftRolesRegistry/SftRolesRegistry'
import { Nft } from '../../generated/schema'
import { findOrCreateAccount, generateERC1155NftId, upsertERC1155RoleAssignment } from '../../utils'

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
  const grantorAddress = event.params._grantor.toHex()
  const grantor = findOrCreateAccount(grantorAddress)
  const nonce = event.params._nonce

  const nftId = generateERC1155NftId(tokenAddress, tokenId, grantor.id)
  const nft = Nft.load(nftId)

  if (!nft) {
    log.error('[sft-roles-registry][handleRoleGranted] NFT {} does not exist, tx {} skipping...', [
      nftId,
      event.transaction.hash.toHex(),
    ])
    return
  }

  const granteeAccount = findOrCreateAccount(event.params._grantee.toHex())
  const roleAssignment = upsertERC1155RoleAssignment(event, grantor, granteeAccount, nft, nonce)
  log.warning('[sft-roles-registry][handleRoleGranted] roleAssignment: {} NFT: {} Tx: {}', [
    roleAssignment.id,
    nftId,
    event.transaction.hash.toHex(),
  ])
}
