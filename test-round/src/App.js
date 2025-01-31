import './App.css';
import React, { createContext, useContext, useState, useMemo } from "react";
import { FixedSizeList as List } from 'react-window';

const DataGridContext = createContext();

const DataGrid = ({ data, defaultSort, rowSelection = "multi", children }) => {
  const [sortField, setSortField] = useState(defaultSort?.field || null);
  const [sortDirection, setSortDirection] = useState(defaultSort?.direction || "asc");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [filters, setFilters] = useState({});

  const sortedData = useMemo(() => {
    let filteredData = data;

    // Apply filters
    Object.keys(filters).forEach(field => {
      filteredData = filteredData.filter(row => {
        return row[field].toString().toLowerCase().includes(filters[field].toLowerCase());
      });
    });

    // Apply sorting
    if (sortField) {
      filteredData = [...filteredData].sort((a, b) =>
        sortDirection === "asc"
          ? String(a[sortField]).localeCompare(String(b[sortField]))
          : String(b[sortField]).localeCompare(String(a[sortField]))
      );
    }

    return filteredData;
  }, [data, filters, sortField, sortDirection]);

  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  return (
    <DataGridContext.Provider value={{
      sortedData,
      sortField,
      setSortField,
      sortDirection,
      setSortDirection,
      selectedRows,
      setSelectedRows,
      rowSelection,
      filters,
      handleFilterChange
    }}>
      <table className='data-grid'>
        {children}
      </table>
    </DataGridContext.Provider>
  );
};

const Header = ({ children }) => <thead><tr>{children}</tr></thead>;

const Column = ({ field, label, sortable, filter: FilterComponent }) => {
  const { sortField, setSortField, sortDirection, setSortDirection, handleFilterChange } = useContext(DataGridContext);

  const handleSort = () => {
    if (!sortable) return;
    setSortField(field);
    setSortDirection(sortField === field && sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <th>
      <div onClick={sortable ? handleSort : undefined} style={{ cursor: sortable ? "pointer" : "default" }}>
        {label} {sortable && (sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : "")}
        {FilterComponent && <FilterComponent field={field} onFilterChange={handleFilterChange} />}
      </div>
    </th>
  );
};

const TextFilter = ({ field, onFilterChange }) => (
  <input
    type="text"
    placeholder="Filter..."
    onChange={(e) => onFilterChange(field, e.target.value)}
  />
);

const Row = ({ index, style }) => {
  const { sortedData, selectedRows, setSelectedRows, rowSelection } = useContext(DataGridContext);
  const row = sortedData[index];
  if (!row) return null;

  const isSelected = selectedRows.has(row.id);

  const toggleSelection = () => {
    if (rowSelection === "single") {
      setSelectedRows(new Set([row.id]));
    } else {
      const newSelection = new Set(selectedRows);
      isSelected ? newSelection.delete(row.id) : newSelection.add(row.id);
      setSelectedRows(newSelection);
    }
  };

  return (
    <tr onClick={toggleSelection} style={style} className={isSelected ? "selected" : ""}>
      {Object.values(row).map((value, idx) => (
        <td key={idx}>{value}</td>
      ))}
    </tr>
  );
};

const Body = () => {
  const { sortedData } = useContext(DataGridContext);

  return (
    <tbody>
      <List
        height={300}
        itemCount={sortedData.length}
        itemSize={35}
        width="100%"
      >
        {({ index, style }) => <Row index={index} style={style} />}
      </List>
    </tbody>
  );
};



function App() {
  const data = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + (i % 50),
  }));

  return (
    <div className="App">
      <h1>Data Grid</h1>
      <DataGrid data={data} defaultSort={{ field: 'name', direction: 'asc' }} rowSelection="multi">
        <Header>
          <Column field="name" label="Name" sortable filter={TextFilter} />
          <Column field="age" label="Age" sortable filter={TextFilter} />
        </Header>
        <Body/>
      </DataGrid>
    </div>
  );
}

export default App;
