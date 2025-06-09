'use client';

/* eslint-disable */

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
}

interface FilterableTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  initialSortColumn?: keyof T | string;
  initialSortDirection?: 'asc' | 'desc';
  searchable?: boolean;
  onRowClick?: (item: T) => void;
  filterOptions?: {
    column: keyof T | string;
    options: { label: string; value: string | number }[];
  }[];
}

export function FilterableTable<T extends Record<string, any>>({
  data,
  columns,
  initialSortColumn,
  initialSortDirection = 'asc',
  searchable = true,
  onRowClick,
  filterOptions = [],
}: FilterableTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<keyof T | string | undefined>(
    initialSortColumn
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    initialSortDirection
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string | number>>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleSort = (column: keyof T | string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: keyof T | string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className='h-4 w-4' />
    ) : (
      <ChevronDown className='h-4 w-4' />
    );
  };

  const handleFilterChange = (
    column: keyof T | string,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    setShowFilterPanel(false);
  };

  // Filter and sort the data
  let filteredData = [...data];

  // Apply search term filtering
  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    filteredData = filteredData.filter((item) => {
      return Object.entries(item).some(([key, value]) => {
        // Skip complex objects or functions
        if (value === null || value === undefined) return false;
        if (typeof value === 'object') {
          // For simple objects we can try to stringify them
          try {
            return JSON.stringify(value)
              .toLowerCase()
              .includes(lowerSearchTerm);
          } catch (e) {
            return false;
          }
        }
        if (typeof value === 'function') return false;

        return value.toString().toLowerCase().includes(lowerSearchTerm);
      });
    });
  }

  // Apply column filters
  Object.entries(filters).forEach(([column, value]) => {
    if (value !== '') {
      // Find column definition for potential custom rendering
      const columnDef = columns.find((col) => col.key === column);

      filteredData = filteredData.filter((item) => {
        // Special handling for custom columns with render functions
        if (columnDef?.render && !item.hasOwnProperty(column)) {
          try {
            const renderedValue = columnDef.render(undefined, item);
            if (renderedValue !== undefined && renderedValue !== null) {
              return renderedValue.toString() === value.toString();
            }
          } catch (e) {
            return false;
          }
        }

        // Standard property filtering
        if (!item.hasOwnProperty(column)) return false;
        const itemValue = item[column as keyof typeof item];
        if (itemValue === null || itemValue === undefined) return false;
        if (typeof itemValue === 'object' || typeof itemValue === 'function')
          return false;

        return itemValue.toString() === value.toString();
      });
    }
  });

  // Apply sorting
  if (sortColumn) {
    // Find the column definition for potential custom rendering
    const sortColumnDef = columns.find((col) => col.key === sortColumn);

    filteredData.sort((a, b) => {
      // Check if sortColumn is a valid key in the data items
      const aHasProperty = Object.prototype.hasOwnProperty.call(
        a,
        sortColumn as string
      );
      const bHasProperty = Object.prototype.hasOwnProperty.call(
        b,
        sortColumn as string
      );

      // Special handling for custom columns (like fullName that's computed)
      // If neither item has the property but we have a render function, use that for comparison
      if (!aHasProperty && !bHasProperty && sortColumnDef?.render) {
        // We'll use the render function to get comparable values
        try {
          const aRendered = sortColumnDef.render(undefined, a);
          const bRendered = sortColumnDef.render(undefined, b);

          // If rendered values are strings or numbers, we can compare them
          if (typeof aRendered === 'string' && typeof bRendered === 'string') {
            if (aRendered < bRendered) return sortDirection === 'asc' ? -1 : 1;
            if (aRendered > bRendered) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          }

          // If we can't compare directly, fall back to string representation
          const aStr = String(aRendered);
          const bStr = String(bRendered);
          if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        } catch (e) {
          // If rendering fails, don't change order
          return 0;
        }
      }

      // Standard property comparison
      // If neither item has the property, don't change order
      if (!aHasProperty && !bHasProperty) return 0;

      // If only one item has the property, sort it first/last depending on direction
      if (!aHasProperty) return sortDirection === 'asc' ? 1 : -1;
      if (!bHasProperty) return sortDirection === 'asc' ? -1 : 1;

      // Get values safely using type assertion
      const aValue = a[sortColumn as keyof typeof a];
      const bValue = b[sortColumn as keyof typeof b];

      // Handle undefined, null, or complex types
      if (aValue === undefined || aValue === null)
        return sortDirection === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null)
        return sortDirection === 'asc' ? 1 : -1;

      // Handle complex types that can't be compared
      if (typeof aValue === 'object' || typeof bValue === 'object') return 0;
      if (typeof aValue === 'function' || typeof bValue === 'function')
        return 0;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className='w-full'>
      {/* Search and Filter Bar */}
      <div className='mb-4 flex flex-wrap gap-3 items-center justify-between'>
        {searchable && (
          <div className='relative flex-1 min-w-[200px]'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <input
              type='search'
              placeholder='Search...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-4 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring'
            />
          </div>
        )}

        {filterOptions.length > 0 && (
          <motion.div className='relative flex items-center'>
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className='flex items-center gap-2 rounded-md border border-input bg-transparent px-4 py-2 text-sm hover:bg-accent'
            >
              <Filter className='h-4 w-4' />
              <span>Filter</span>
            </button>

            {Object.keys(filters).length > 0 && (
              <div className='ml-2 flex items-center'>
                <span className='text-xs text-muted-foreground'>
                  {Object.keys(filters).length} active
                </span>
                <button
                  onClick={resetFilters}
                  className='ml-2 text-xs text-blue-500 hover:underline'
                >
                  Clear
                </button>
              </div>
            )}

            <AnimatePresence>
              {showFilterPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className='absolute right-0 top-full mt-2 z-10 w-64 rounded-md border border-border bg-background shadow-lg p-4'
                >
                  <h4 className='font-medium mb-3'>Filters</h4>

                  <div className='space-y-3'>
                    {filterOptions.map((filterOption) => (
                      <div
                        key={filterOption.column.toString()}
                        className='space-y-1'
                      >
                        <label className='text-sm font-medium text-muted-foreground'>
                          {filterOption.column.toString()}
                        </label>
                        <select
                          value={filters[filterOption.column] || ''}
                          onChange={(e) =>
                            handleFilterChange(
                              filterOption.column,
                              e.target.value
                            )
                          }
                          className='w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring'
                        >
                          <option value=''>All</option>
                          {filterOption.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className='mt-4 flex justify-between'>
                    <button
                      onClick={resetFilters}
                      className='text-sm text-muted-foreground hover:text-foreground'
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilterPanel(false)}
                      className='text-sm text-blue-500 hover:text-blue-600'
                    >
                      Apply
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className='w-full overflow-auto rounded-md border'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50 text-muted-foreground'>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  className='h-10 px-4 text-left align-middle font-medium'
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className='flex items-center gap-1'>
                    <span>{column.title}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filteredData.map((item, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`border-b border-border ${
                    onRowClick ? 'cursor-pointer hover:bg-accent/50' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={`${index}-${String(column.key)}`}
                      className='px-4 py-2'
                    >
                      {column.render
                        ? column.render(
                            item.hasOwnProperty(column.key as string)
                              ? item[column.key as keyof typeof item]
                              : undefined,
                            item
                          )
                        : item.hasOwnProperty(column.key as string)
                        ? String(item[column.key as keyof typeof item])
                        : ''}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className='h-32 text-center'>
                  <p className='text-muted-foreground'>No data found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
