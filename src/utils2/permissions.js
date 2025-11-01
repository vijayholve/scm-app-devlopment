export const hasBackOfficePermission = (user) => {
  return user?.accountId === 10 && user?.type === 'ADMIN';
};
