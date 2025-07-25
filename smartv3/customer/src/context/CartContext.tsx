import { useState } from 'react';

const [table, setTable] = useState<string>('');

// Ensure table is properly stored and retrieved
const setCustomerTable = (tableNumber: string) => {
  setTable(tableNumber);
  localStorage.setItem('selectedTable', tableNumber);
};

const getCustomerTable = () => {
  return table || localStorage.getItem('selectedTable');
};
