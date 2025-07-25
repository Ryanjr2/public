// src/pages/CorporateAccountsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiSearch, FiFilter, FiEdit, FiEye, FiUsers, FiFileText,
  FiTrendingUp, FiCalendar, FiPhone, FiMail, FiMapPin, FiRefreshCw,
  FiSend, FiBell, FiBarChart2, FiAlertTriangle,
  FiDownload, FiCreditCard, FiBriefcase
} from 'react-icons/fi';
import { formatCurrency } from '../utils/currency';
import { corporateService, type CorporateAccount } from '../services/corporateService';
import CorporateAccountModal from '../components/CorporateAccountModal';
import CorporateEmployeesModal from '../components/CorporateEmployeesModal';
import CorporateDashboard from '../components/CorporateDashboard';
import styles from './CorporateAccounts.module.css';

const CorporateAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<CorporateAccount | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState<'accounts' | 'analytics' | 'invoices'>('accounts');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = () => {
    setLoading(true);
    try {
      const corporateAccounts = corporateService.getCorporateAccounts();
      const corporateAnalytics = corporateService.getCorporateAnalytics();
      setAccounts(corporateAccounts);
      setAnalytics(corporateAnalytics);
    } catch (error) {
      console.error('Failed to load corporate accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsEditing(false);
    setShowAccountModal(true);
  };

  const handleEditAccount = (account: CorporateAccount) => {
    setSelectedAccount(account);
    setIsEditing(true);
    setShowAccountModal(true);
  };

  const handleAccountSaved = () => {
    setShowAccountModal(false);
    loadAccounts();
  };

  const handleViewEmployees = (account: CorporateAccount) => {
    setSelectedAccount(account);
    setShowEmployeesModal(true);
  };

  const handleViewDashboard = (account: CorporateAccount) => {
    setSelectedAccount(account);
    setShowDashboard(true);
  };

  const handleGenerateInvoice = async (account: CorporateAccount) => {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const invoice = corporateService.generateMonthlyInvoice(account.id, year, month);
      alert(`Invoice ${invoice.invoiceNumber} generated successfully!`);
      loadAccounts();
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const handleSendInvoice = async (account: CorporateAccount) => {
    try {
      const invoices = corporateService.getCorporateInvoices(account.id);
      const latestInvoice = invoices
        .filter(inv => inv.status === 'draft')
        .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0];
      
      if (!latestInvoice) {
        alert('No draft invoices found. Please generate an invoice first.');
        return;
      }

      const success = await corporateService.sendInvoiceByEmail(latestInvoice.id);
      if (success) {
        alert(`Invoice ${latestInvoice.invoiceNumber} sent successfully!`);
        loadAccounts();
      } else {
        alert('Failed to send invoice. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading corporate accounts...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Corporate Accounts</h1>
          <p className={styles.subtitle}>
            Manage corporate clients and B2B relationships
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshButton} onClick={loadAccounts}>
            <FiRefreshCw />
          </button>
          <button className={styles.addButton} onClick={handleAddAccount}>
            <FiPlus /> Add Account
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'accounts' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          <FiUsers /> Accounts ({accounts.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FiBarChart2 /> Analytics
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'invoices' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FiFileText /> Invoices
        </button>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <>
          {/* Registration Section */}
          <div className={styles.registrationSection}>
            <div className={styles.registrationCard}>
              <div className={styles.registrationIcon}>
                <FiBriefcase />
              </div>
              <div className={styles.registrationContent}>
                <h3>Register New Corporate Account</h3>
                <p>Add a new corporate client to start managing their employees and billing</p>
                <button className={styles.registerButton} onClick={handleAddAccount}>
                  <FiPlus /> Register Corporate Account
                </button>
              </div>
              <div className={styles.registrationStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{accounts.length}</span>
                  <span className={styles.statLabel}>Total Accounts</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{analytics?.activeAccounts || 0}</span>
                  <span className={styles.statLabel}>Active</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{analytics?.totalEmployees || 0}</span>
                  <span className={styles.statLabel}>Employees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className={styles.searchSection}>
            <div className={styles.searchBox}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.filterButton}>
              <FiFilter /> Filters
            </button>
          </div>

          {/* Accounts Grid */}
          <div className={styles.accountsGrid}>
            {filteredAccounts.map((account) => (
              <div key={account.id} className={styles.accountCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.companyInfo}>
                    <h3 className={styles.companyName}>{account.companyName}</h3>
                    <span 
                      className={styles.accountStatus}
                      style={{ backgroundColor: getStatusColor(account.status) }}
                    >
                      {account.status}
                    </span>
                  </div>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactItem}>
                      <FiMail className={styles.contactIcon} />
                      <span>{account.email}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <FiPhone className={styles.contactIcon} />
                      <span>{account.phone}</span>
                    </div>
                    <div className={styles.contactItem}>
                      <FiMapPin className={styles.contactIcon} />
                      <span>{account.address}</span>
                    </div>
                  </div>

                  <div className={styles.financialInfo}>
                    <div className={styles.financialItem}>
                      <span className={styles.label}>Credit Limit</span>
                      <span className={styles.value}>{formatCurrency(account.creditLimit)}</span>
                    </div>
                    <div className={styles.financialItem}>
                      <span className={styles.label}>Current Balance</span>
                      <span className={styles.value}>{formatCurrency(account.currentBalance)}</span>
                    </div>
                    <div className={styles.financialItem}>
                      <span className={styles.label}>Payment Terms</span>
                      <span className={styles.value}>{account.paymentTerms} days</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleViewDashboard(account)}
                    title="View Dashboard"
                  >
                    <FiBarChart2 />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleViewEmployees(account)}
                    title="View Employees"
                  >
                    <FiUsers />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleGenerateInvoice(account)}
                    title="Generate Invoice"
                  >
                    <FiFileText />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleSendInvoice(account)}
                    title="Send Invoice"
                  >
                    <FiSend />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEditAccount(account)}
                    title="Edit Account"
                  >
                    <FiEdit />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAccounts.length === 0 && searchTerm === '' && (
            <div className={styles.emptyState}>
              <FiBriefcase size={64} />
              <h3>No Corporate Accounts Yet</h3>
              <p>Start building your B2B relationships by registering your first corporate client</p>
              <div className={styles.emptyStateFeatures}>
                <div className={styles.feature}>
                  <FiUsers />
                  <span>Manage employee dining</span>
                </div>
                <div className={styles.feature}>
                  <FiFileText />
                  <span>Automated monthly billing</span>
                </div>
                <div className={styles.feature}>
                  <FiTrendingUp />
                  <span>Credit limit management</span>
                </div>
              </div>
              <button className={styles.emptyStateButton} onClick={handleAddAccount}>
                <FiPlus /> Register First Corporate Account
              </button>
            </div>
          )}

          {filteredAccounts.length === 0 && searchTerm !== '' && (
            <div className={styles.emptyState}>
              <FiSearch size={48} />
              <h3>No accounts match your search</h3>
              <p>Try adjusting your search terms or <button className={styles.linkButton} onClick={() => setSearchTerm('')}>view all accounts</button></p>
            </div>
          )}
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className={styles.analyticsContent}>
          <div className={styles.analyticsHeader}>
            <h2>Corporate Analytics Overview</h2>
            <p>Comprehensive analytics across all corporate accounts</p>
          </div>
          
          <div className={styles.overallMetrics}>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#3b82f6' }}>
                <FiUsers />
              </div>
              <div className={styles.metricInfo}>
                <h3>Total Accounts</h3>
                <p className={styles.metricValue}>{analytics?.totalAccounts || 0}</p>
                <span className={styles.metricLabel}>{analytics?.activeAccounts || 0} active</span>
              </div>
            </div>
            
            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#10b981' }}>
                <FiTrendingUp />
              </div>
              <div className={styles.metricInfo}>
                <h3>Total Revenue</h3>
                <p className={styles.metricValue}>{formatCurrency(analytics?.totalRevenue || 0)}</p>
                <span className={styles.metricLabel}>All-time earnings</span>
              </div>
            </div>
            
            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#8b5cf6' }}>
                <FiUsers />
              </div>
              <div className={styles.metricInfo}>
                <h3>Total Employees</h3>
                <p className={styles.metricValue}>{analytics?.totalEmployees || 0}</p>
                <span className={styles.metricLabel}>Registered staff</span>
              </div>
            </div>
            
            <div className={styles.metricCard}>
              <div className={styles.metricIcon} style={{ backgroundColor: '#f59e0b' }}>
                <FiTrendingUp />
              </div>
              <div className={styles.metricInfo}>
                <h3>Avg Order Value</h3>
                <p className={styles.metricValue}>{formatCurrency(analytics?.averageOrderValue || 0)}</p>
                <span className={styles.metricLabel}>Per transaction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className={styles.invoicesContent}>
          <div className={styles.invoicesHeader}>
            <h2>Invoice Management</h2>
            <p>Manage and track all corporate invoices</p>
          </div>
          
          <div className={styles.invoiceActions}>
            <button 
              className={styles.bulkActionButton}
              onClick={() => {
                accounts.forEach(account => handleGenerateInvoice(account));
              }}
            >
              <FiFileText /> Generate All Monthly Invoices
            </button>
          </div>

          <div className={styles.invoicesList}>
            {corporateService.getCorporateInvoices().map(invoice => {
              const account = accounts.find(acc => acc.id === invoice.corporateAccountId);
              return (
                <div key={invoice.id} className={styles.invoiceCard}>
                  <div className={styles.invoiceHeader}>
                    <div className={styles.invoiceInfo}>
                      <h4>Invoice {invoice.invoiceNumber}</h4>
                      <p>{account?.companyName}</p>
                    </div>
                    <span 
                      className={styles.invoiceStatus}
                      style={{ 
                        backgroundColor: 
                          invoice.status === 'paid' ? '#10b981' :
                          invoice.status === 'overdue' ? '#ef4444' :
                          invoice.status === 'sent' ? '#f59e0b' : '#6b7280'
                      }}
                    >
                      {invoice.status}
                    </span>
                  </div>
                  <div className={styles.invoiceDetails}>
                    <div className={styles.invoiceMetric}>
                      <span className={styles.metricLabel}>Amount:</span>
                      <span className={styles.metricValue}>{formatCurrency(invoice.summary.total)}</span>
                    </div>
                    <div className={styles.invoiceMetric}>
                      <span className={styles.metricLabel}>Due Date:</span>
                      <span className={styles.metricValue}>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <CorporateAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        account={selectedAccount}
        isEditing={isEditing}
        onSave={handleAccountSaved}
      />

      {selectedAccount && (
        <CorporateEmployeesModal
          isOpen={showEmployeesModal}
          onClose={() => setShowEmployeesModal(false)}
          account={selectedAccount}
        />
      )}

      {selectedAccount && showDashboard && (
        <div className={styles.dashboardModal}>
          <div className={styles.dashboardOverlay} onClick={() => setShowDashboard(false)} />
          <div className={styles.dashboardContent}>
            <div className={styles.dashboardHeader}>
              <h2>{selectedAccount.companyName} - Analytics Dashboard</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowDashboard(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.dashboardBody}>
              <CorporateDashboard account={selectedAccount} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateAccountsPage;
