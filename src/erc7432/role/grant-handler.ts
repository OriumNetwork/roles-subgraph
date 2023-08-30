export function handleRoleGranted(event: RoleGranted): void {
  let entity = Role.load(event.params.role.toHex())

  if (entity == null) {
    entity = new Role(event.params.role.toHex())
  }

  entity.account = event.params.account.toHex()
  entity.save()
}
