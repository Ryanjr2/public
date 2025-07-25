// src/components/RoleSelector.tsx
import React, { useState } from 'react';
import { getRoleInfo } from '../config/roleMenus';
import styles from './RoleSelector.module.css';

type UserRole = 'admin' | 'chef' | 'server';

interface Props {
  onRoleSelect: (role: UserRole) => void;
  currentRole?: UserRole;
}

const RoleSelector: React.FC<Props> = ({ onRoleSelect, currentRole }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'admin');

  const roles: UserRole[] = ['admin', 'chef', 'server'];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    onRoleSelect(role);
  };

  return (
    <div className={styles.roleSelector}>
      <h3>Select User Role (Demo)</h3>
      <p>Choose a role to see the interface from that user's perspective:</p>
      
      <div className={styles.roleGrid}>
        {roles.map((role) => {
          const roleInfo = getRoleInfo(role);
          const isSelected = selectedRole === role;
          
          return (
            <div
              key={role}
              className={`${styles.roleCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleRoleChange(role)}
              style={{ borderColor: isSelected ? roleInfo.color : '#e2e8f0' }}
            >
              <div 
                className={styles.roleBadge}
                style={{ backgroundColor: roleInfo.color }}
              >
                {roleInfo.badge}
              </div>
              <h4>{roleInfo.title}</h4>
              <p>{roleInfo.description}</p>
              
              {isSelected && (
                <div className={styles.selectedIndicator}>
                  ✓ Currently Active
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className={styles.note}>
        <strong>Note:</strong> This role selector is for demonstration purposes. 
        In a real application, user roles would be determined by authentication and stored in the database.
      </div>
    </div>
  );
};

export default RoleSelector;
