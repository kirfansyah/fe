import { useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ProfileContext } from '@/contexts/profile/ProfileContext';

export const useMenuPermissions = () => {
  const router = useRouter();
  const { dataMenu } = useContext(ProfileContext);

  const currentPermissions = useMemo(() => {
    if (!dataMenu || dataMenu.length === 0) {
      return {
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false,
        can_approve: false,
      };
    }

    const currentPath = router.pathname;

    // Fungsi rekursif untuk mencari menu berdasarkan URL
    const findMenuByUrl = (menus, url) => {
      for (const menu of menus) {
        if (menu.menu_url === url) {
          return menu;
        }
        if (menu.children && menu.children.length > 0) {
          const found = findMenuByUrl(menu.children, url);
          if (found) return found;
        }
      }
      return null;
    };

    const currentMenu = findMenuByUrl(dataMenu, currentPath);

    if (currentMenu && currentMenu.permissions) {
      return currentMenu.permissions;
    }

    return {
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
      can_approve: false,
    };
  }, [dataMenu, router.pathname]);

  return currentPermissions;
};

export const useHasPermission = (action) => {
  const permissions = useMenuPermissions();
  
  const permissionMap = {
    view: permissions.can_view,
    create: permissions.can_create,
    edit: permissions.can_edit,
    delete: permissions.can_delete,
    approve: permissions.can_approve,
  };

  return permissionMap[action] ?? false;
};