// utils/permissionUtils.js
export function hasPermission(permissions, entityName, action) {
  const entity = permissions.find(p => p.entityName === entityName);
  return entity && entity.actions && entity.actions[action];
}