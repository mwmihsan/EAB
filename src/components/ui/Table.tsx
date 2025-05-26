import React from 'react';

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No data available',
  isLoading = false,
  onRowClick,
  className = '',
}: TableProps<T>) {
  // Render cell content based on accessor type
  const renderCell = (item: T, accessor: TableColumn<T>['accessor']) => {
    if (typeof accessor === 'function') {
      return accessor(item);
    }
    
    const value = item[accessor];
    return value as React.ReactNode;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`overflow-x-auto rounded-lg border border-neutral-200 shadow-sm ${className}`}>
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {[...Array(5)].map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="animate-pulse h-4 bg-neutral-200 rounded"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={`rounded-lg border border-neutral-200 shadow-sm bg-white ${className}`}>
        <div className="text-center py-8">
          <p className="text-neutral-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Render table
  return (
    <div className={`overflow-x-auto rounded-lg border border-neutral-200 shadow-sm ${className}`}>
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {data.map(item => (
            <tr 
              key={keyExtractor(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex} 
                  className={`px-6 py-4 whitespace-nowrap text-sm text-neutral-800 ${column.className || ''}`}
                >
                  {renderCell(item, column.accessor)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;