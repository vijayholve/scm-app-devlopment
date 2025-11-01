// Create src/utils/cacheUtils.js
export const refreshDataGrid = (url) => {
  console.log(`🔄 Triggering refresh for: ${url}`);
  window.dispatchEvent(new CustomEvent('refreshDataGrid', { detail: { url } }));
};

export const refreshAllDataGrids = () => {
  console.log('🔄 Triggering refresh for all grids');
  window.dispatchEvent(new CustomEvent('refreshAllDataGrids'));
};
