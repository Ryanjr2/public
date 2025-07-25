// src/components/CSVImportModal.tsx
import React, { useState, useRef } from 'react';
import { FiX, FiUpload, FiDownload, FiCheck, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import { corporateService, type CorporateAccount, type ImportResult } from '../services/corporateService';
import styles from './CSVImportModal.module.css';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: CorporateAccount;
  onImportComplete: () => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  account,
  onImportComplete
}) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [csvData, setCsvData] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvData(content);
      setStep('preview');
    };
    
    reader.readAsText(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setCsvData(content);
          setStep('preview');
        };
        reader.readAsText(file);
      } else {
        alert('Please select a CSV file');
      }
    }
  };

  const downloadTemplate = () => {
    const template = corporateService.generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_import_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const processImport = async () => {
    setIsProcessing(true);
    try {
      const result = await corporateService.importEmployeesFromCSV(account.id, csvData);
      setImportResult(result);
      setStep('result');
      
      if (result.success) {
        onImportComplete();
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setStep('upload');
    setCsvData('');
    setFileName('');
    setImportResult(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const previewData = csvData ? csvData.split('\n').slice(0, 6) : [];
  const headers = previewData[0]?.split(',') || [];
  const rows = previewData.slice(1);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <FiUpload className={styles.headerIcon} />
            <div>
              <h2>Import Employees</h2>
              <p className={styles.companyName}>{account.companyName}</p>
            </div>
          </div>
          <button className={styles.closeButton} onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.content}>
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className={styles.uploadStep}>
              <div className={styles.instructions}>
                <h3>Upload Employee CSV File</h3>
                <p>Import multiple employees at once using a CSV file. Download our template to get started.</p>
                
                <div className={styles.templateSection}>
                  <button className={styles.templateButton} onClick={downloadTemplate}>
                    <FiDownload /> Download CSV Template
                  </button>
                  <p className={styles.templateNote}>
                    Use this template to ensure your data is formatted correctly
                  </p>
                </div>
              </div>

              <div 
                className={styles.dropZone}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FiFileText size={48} />
                <h4>Drag & drop your CSV file here</h4>
                <p>or click to browse files</p>
                <span className={styles.fileTypes}>Supports: .csv files only</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <div className={styles.requirements}>
                <h4>CSV Requirements:</h4>
                <ul>
                  <li>Required columns: employeeId, fullName, email, phone, department, position</li>
                  <li>Optional columns: dailyLimit, monthlyLimit, status</li>
                  <li>First row must contain column headers</li>
                  <li>Employee IDs must be unique</li>
                  <li>Email addresses must be valid</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <div className={styles.previewStep}>
              <div className={styles.previewHeader}>
                <h3>Preview Import Data</h3>
                <p>File: <strong>{fileName}</strong> ({previewData.length - 1} employees)</p>
              </div>

              <div className={styles.previewTable}>
                <div className={styles.tableHeader}>
                  {headers.map((header, index) => (
                    <div key={index} className={styles.headerCell}>
                      {header.trim()}
                    </div>
                  ))}
                </div>
                <div className={styles.tableBody}>
                  {rows.map((row, index) => (
                    <div key={index} className={styles.tableRow}>
                      {row.split(',').map((cell, cellIndex) => (
                        <div key={cellIndex} className={styles.tableCell}>
                          {cell.trim()}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {rows.length > 5 && (
                <p className={styles.moreRows}>
                  ... and {csvData.split('\n').length - 6} more rows
                </p>
              )}

              <div className={styles.previewActions}>
                <button 
                  className={styles.backButton} 
                  onClick={() => setStep('upload')}
                >
                  ← Back to Upload
                </button>
                <button 
                  className={styles.importButton} 
                  onClick={processImport}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Import ${csvData.split('\n').length - 1} Employees`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 'result' && importResult && (
            <div className={styles.resultStep}>
              <div className={styles.resultHeader}>
                <div className={`${styles.resultIcon} ${importResult.success ? styles.success : styles.error}`}>
                  {importResult.success ? <FiCheck /> : <FiAlertTriangle />}
                </div>
                <h3>Import {importResult.success ? 'Completed' : 'Failed'}</h3>
              </div>

              <div className={styles.resultSummary}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryNumber}>{importResult.totalRows}</div>
                  <div className={styles.summaryLabel}>Total Rows</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryNumber}>{importResult.successfulImports}</div>
                  <div className={styles.summaryLabel}>Successful</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryNumber}>{importResult.failedImports}</div>
                  <div className={styles.summaryLabel}>Failed</div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryNumber}>{importResult.duplicates.length}</div>
                  <div className={styles.summaryLabel}>Duplicates</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className={styles.errorSection}>
                  <h4>Errors ({importResult.errors.length})</h4>
                  <div className={styles.errorList}>
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className={styles.errorItem}>
                        <span className={styles.errorRow}>Row {error.row}:</span>
                        <span className={styles.errorField}>{error.field}</span>
                        <span className={styles.errorMessage}>{error.message}</span>
                      </div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <p className={styles.moreErrors}>
                        ... and {importResult.errors.length - 10} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}

              {importResult.duplicates.length > 0 && (
                <div className={styles.duplicateSection}>
                  <h4>Duplicate Employee IDs ({importResult.duplicates.length})</h4>
                  <div className={styles.duplicateList}>
                    {importResult.duplicates.slice(0, 5).map((duplicate, index) => (
                      <div key={index} className={styles.duplicateItem}>
                        <span className={styles.duplicateRow}>Row {duplicate.row}:</span>
                        <span className={styles.duplicateId}>{duplicate.employeeId}</span>
                        <span className={styles.duplicateName}>
                          (conflicts with {duplicate.existingEmployee.fullName})
                        </span>
                      </div>
                    ))}
                    {importResult.duplicates.length > 5 && (
                      <p className={styles.moreDuplicates}>
                        ... and {importResult.duplicates.length - 5} more duplicates
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.resultActions}>
                <button 
                  className={styles.newImportButton} 
                  onClick={resetModal}
                >
                  Import Another File
                </button>
                <button 
                  className={styles.doneButton} 
                  onClick={handleClose}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal;
