import { Typography } from '@mui/material';

/**
 * Resolves the name for a given ID using the provided map or SCD data.
 * @param {string|number} id - The ID to resolve.
 * @param {Array} data - The SCD data array (schools, classes, divisions).
 * @param {Object} map - The cached map for quick lookup.
 * @returns {string} - The resolved name or 'N/A' if not found.
 */
export const resolveNameById = (id, data, map) => {
  if (!id) return 'N/A';
  if (map && map[id]) return map[id];
  const item = data.find((entry) => String(entry.id) === String(id));
  return item ? item.name : 'N/A';
};

/**
 * Generates a column configuration for resolving names using SCD data.
 * @param {string} field - The field name (e.g., 'schoolId', 'classId', 'divisionId').
 * @param {string} headerName - The header name for the column.
 * @param {Array} data - The SCD data array (schools, classes, divisions).
 * @param {Object} map - The cached map for quick lookup.
 * @returns {Object} - The column configuration for the DataGrid.
 */
export const generateSCDColumn = (field, headerName, data, map) => ({
  field,
  headerName,
  valueGetter: (params) => {
    const id = params?.value || params?.row?.[field];
    return resolveNameById(id, data, map);
  },
  renderCell: (params) => {
    const text = params?.value || 'N/A';
    return (
      <Typography variant="body2" title={text}>
        {text}
      </Typography>
    );
  }
});
