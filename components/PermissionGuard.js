import { useHasPermission } from '@/hooks/useMenuPermissions';

export const PermissionGuard = ({ 
  actions = [], // ['create', 'edit']
  requireAll = false, // true = butuh semua permission, false = salah satu aja cukup
  children, 
  fallback = null 
}) => {
  const permissions = useHasPermission();

  const hasPermission = requireAll
    ? actions.every(action => permissions[`can_${action}`])
    : actions.some(action => permissions[`can_${action}`]);

  if (!hasPermission) {
    return fallback;
  }

  return children;
};