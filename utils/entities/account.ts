import { Account } from '../../generated/schema'
/**
 * @notice Find or create an Account entity.
 * @dev This function is used to find or create an Account entity.
 * @param id The id of the account.
 * @returns The Account entity.
 */
export function findOrCreateAccount(id: string): Account {
  const lowerCaseId = id.toLowerCase()
  let account = Account.load(lowerCaseId)
  if (!account) {
    account = new Account(lowerCaseId)
    account.save()
  }
  return account
}
