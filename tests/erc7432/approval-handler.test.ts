import { assert, describe, test, clearStore, afterEach } from 'matchstick-as'
import { createNewRoleApprovalForAllEvent } from '../helpers/events'
import { validateRoleApproval, createMockRoleApproval } from '../helpers/entities'
import { Addresses } from '../helpers/contants'
import { handleRoleApprovalForAll } from '../../src/erc7432'

const grantor = Addresses[0]
const operator = Addresses[1]
const tokenAddress = Addresses[2]

describe('ERC-7432 RoleApprovalForAll Handler', () => {
  afterEach(() => {
    clearStore()
  })

  test('should not do anything when approval does not exist and is set to false', () => {
    assert.entityCount('RoleApproval', 0)

    const event = createNewRoleApprovalForAllEvent(grantor, operator, tokenAddress, false)
    handleRoleApprovalForAll(event)

    assert.entityCount('RoleApproval', 0)
  })

  test('should create approval when approval does not exist and is set to true', () => {
    assert.entityCount('RoleApproval', 0)

    const event = createNewRoleApprovalForAllEvent(grantor, operator, tokenAddress, true)
    handleRoleApprovalForAll(event)

    assert.entityCount('RoleApproval', 1)
    validateRoleApproval(grantor, operator, tokenAddress)
  })

  test('should remove approval when approval exists and is set to false', () => {
    createMockRoleApproval(grantor, operator, tokenAddress)
    assert.entityCount('RoleApproval', 1)

    const event = createNewRoleApprovalForAllEvent(grantor, operator, tokenAddress, false)
    handleRoleApprovalForAll(event)

    assert.entityCount('RoleApproval', 0)
  })

  test('should not do anything when approval exists and is set to true', () => {
    createMockRoleApproval(grantor, operator, tokenAddress)
    assert.entityCount('RoleApproval', 1)

    const event = createNewRoleApprovalForAllEvent(grantor, operator, tokenAddress, true)
    handleRoleApprovalForAll(event)

    assert.entityCount('RoleApproval', 1)
    validateRoleApproval(grantor, operator, tokenAddress)
  })
})
