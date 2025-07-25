// src/layouts/DashboardLayout.tsx
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from './DashboardLayout.module.css';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={styles.contentWrapper}>
        <Header onToggleSidebar={() => setSidebarOpen(o => !o)} />
        <main className={styles.mainArea}>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
