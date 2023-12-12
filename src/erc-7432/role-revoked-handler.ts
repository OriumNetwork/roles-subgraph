import { BigInt, log } from '@graphprotocol/graph-ts'
import { RoleRevoked } from '../../generated/ERC7432/ERC7432'
import { Account, Nft, RoleAssignment } from '../../generated/schema'
import { findOrCreateRole, findOrCreateRolesRegistry, generateERC721NftId, generateRoleAssignmentId } from '../../utils'

/** 
@dev This handler is called when a role is revoked.
@param event RoleRevoked The event emitted by the contract.

Example:
    event RoleRevoked(
        bytes32 indexed _role,
        address indexed _tokenAddress,
        uint256 indexed _tokenId,
        address _revoker,
        address _grantee
    );
*/
export function handleRoleRevoked(event: RoleRevoked): void {
  const tokenId = event.params._tokenId
  const tokenAddress = event.params._tokenAddress.toHexString()

  const nftId = generateERC721NftId(tokenAddress, tokenId)
  const nft = Nft.load(nftId)
  if (!nft) {
    log.error('[erc-7432][handleRoleRevoked] NFT {} does not exist, tx {} skipping...', [
      nftId,
      event.transaction.hash.toHex(),
    ])
    return
  }

  const revokerAddress = event.params._revoker.toHex()
  const revoker = Account.load(revokerAddress)
  if (!revoker) {
    log.error('[erc-7432][handleRoleGranted] revoker {} does not exist, tx {} skipping...', [
      revokerAddress,
      event.transaction.hash.toHex(),
    ])
    return
  }

  const granteeAddress = event.params._grantee.toHex()
  const grantee = Account.load(granteeAddress)
  if (!grantee) {
    log.error('[erc-7432][handleRoleGranted] grantee {} does not exist, tx {} skipping...', [
      granteeAddress,
      event.transaction.hash.toHex(),
    ])
    return
  }

  const rolesRegistry = findOrCreateRolesRegistry(event.address.toHex())
  const roleAssignmentId = generateRoleAssignmentId(rolesRegistry, revoker, grantee, nft, event.params._role)
  const roleAssignment = RoleAssignment.load(roleAssignmentId)
  if (!roleAssignment) {
    log.error('[erc-7432][handleRoleRevoked] RoleAssignment {} does not exist, tx {} skipping...', [
      roleAssignmentId,
      event.transaction.hash.toHex(),
    ])
    return
  }
  if (event.block.timestamp > roleAssignment.expirationDate) {
    log.error('[erc-7432][handleRoleRevoked] RoleAssignment {} already expired, tx {} skipping...', [
      roleAssignmentId,
      event.transaction.hash.toHex(),
    ])
    return
  }

  roleAssignment.expirationDate = event.block.timestamp
  roleAssignment.save()

  if (!roleAssignment.revocable) {
    // smart contract validate that if a role is not revocable, it can only be revoked by the grantee
    // in that case, we can set the lastNonRevocableExpirationDate to zero, assuming that the grantee is revoking its own role
    const role = findOrCreateRole(rolesRegistry, nft, event.params._role)
    role.lastNonRevocableExpirationDate = BigInt.zero()
    role.save()
  }

  log.warning('[[erc-7432]handleRoleRevoked] Revoked RoleAssignment: {} NFT: {} tx: {}', [
    roleAssignmentId,
    nftId,
    event.transaction.hash.toHex(),
  ])
}
