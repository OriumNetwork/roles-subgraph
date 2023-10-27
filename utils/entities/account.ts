import { Account } from '../../generated/schema'

export function findOrCreateAccount(id: string): Account {
  const lowerCaseId = id.toLowerCase()
  let account = Account.load(lowerCaseId)
  if (!account) {
    account = new Account(lowerCaseId)
    account.save()
  }
  return account
}
