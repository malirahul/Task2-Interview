import './App.css';
import React,{createContext,useContext, useState, useMemo} from "react";
import { FixedSizeList as List } from 'react-window';

const DataGridContext=createContext;

const DataGrid =({data, defaultSort, rowSelection ="multi", children})=>{

const[sortField, setSortField] = useState(defaultSort?.field || null);
const[sortDirection, setSortDirection] = useState(defaultSort?.direection || "asc");
const[selectedRows, setselectedRows] = useState(new Set());

const sortedData = useMemo(()=>{
  if(!sortField) return data;
  return[...data].sort((a,b)=>
    sortDirection==="asc"?String(a[sortField]).localeCompare(String(b[sortField])):String(b[sortField]).localeCompare(String(a[sortField]))
  );
},[data,sortField,sortDirection]);


return(
    <DataGridContext.Provider value={{sortedData, sortField, setSortField, sortDirection, setSortDirection,selectedRows,setselectedRows,rowSelection}}>

      <table className='data-grid'>
        {children}
      </table>
    </DataGridContext.Provider>
)
}

const Header =({children})=><thead> <tr>{children}</tr></thead>;

const Column = ({field, label, sortable})=>{
  const{sortField,setSortField,sortDirection,setSortDirection} =useContext(DataGridContext);


  const handleSort=()=>{
    if(!sortable) return;
    setSortDirection(sortField===field && sortDirection=="asc"?"desc":"asc");
  };

  return(
    <th>
      <div onClick={sortable?handleSort:undefined} style={{cursor:sortable?"pointer":"default"}}>
        {label} {sortable && (sortField===field?(sortDirection=="asc"?"up":"down"):"")}
      </div>
      
    </th>
  );
};

const TextFilter =({onFilterChange})=>(
  <input
    type="text"
    placeholder="Filter...."
    onChange={(e)=> onFilterChange(e.target.value)}
    />
);

const Row =({row,style})=>{
  const {selectedRows,setselectedRows,rowSelection}= useContext(DataGridContext);
  const isSelected =selectedRows.has(row.id);

  const toggelSelection =()=>{
    if(rowSelection==="single"){
      setselectedRows(new Set([row.id]));
    }else{
      const newSelection=new Set(selectedRows);
      isSelected?newSelection.delete(row.id):newSelection.add(row.id);
      setselectedRows(newSelection);
    }
  };

  return(
    <tr onClick={toggelSelection} style={style} className={isSelected?"selected":""}>
      {Object.values(row).map((value,idx)=>(
        <td key={idx}>{value}</td>
      ))}
    </tr>
  );
};

const Body=()=>{
  const {sortedData}=useContext(DataGridContext);

  return(
    <tbody>
      <List
        height={300}
        itemCount={sortedData.length}
        itemSize={35}
        width="100%"
        >
          {Row}
        </List>
    </tbody>
  );
};



function App() {
  const data =Array.from({length:1000},(_,i)=>({
    id:i+1,
    name:`User ${i+1}`,
    age:20+(i%50),
  })
  );

  return (
    <div className="App">
      <h1>Data Grid</h1>
      <DataGrid data ={data} defaultSort={{ field: 'name', direction: 'asc' }} rowSelection ="multi">
        <Header>
          <Column field="name" label="Name" sortable/>
          <Column field="age" label="Age" sortable/>
        </Header>
        <Body/>
      </DataGrid>
    </div>
  );
}

export default App;
