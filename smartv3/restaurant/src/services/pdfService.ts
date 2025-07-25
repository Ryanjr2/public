// src/services/pdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils/currency';
import type { DailySalesReport, CompletedOrder } from './reportingService';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

class PDFService {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  // Generate Daily Sales Report PDF
  generateDailySalesReport(report: DailySalesReport, orders: CompletedOrder[]): void {
    try {
      console.log('🔄 Starting PDF generation...', { report, orders });

      this.doc = new jsPDF();
      console.log('✅ jsPDF instance created');

      // Header
      this.addHeader('Daily Sales Report', report.date);
      console.log('✅ Header added');

      // Summary Section
      this.addSummarySection(report);
      console.log('✅ Summary section added');

      // Orders by Type
      this.addOrdersByTypeSection(report);
      console.log('✅ Orders by type section added');

      // Payment Methods
      this.addPaymentMethodsSection(report);
      console.log('✅ Payment methods section added');

      // Top Selling Items
      this.addTopSellingItemsSection(report);
      console.log('✅ Top selling items section added');

      // Recent Orders
      this.addRecentOrdersSection(orders);
      console.log('✅ Recent orders section added');

      // Footer
      this.addFooter();
      console.log('✅ Footer added');

      // Download the PDF
      const filename = `daily-sales-report-${report.date}.pdf`;
      this.doc.save(filename);
      console.log('✅ PDF saved:', filename);

    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private addHeader(title: string, date: string): void {
    // Restaurant Logo/Name
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('🇹🇿 Smart Restaurant', 20, 25);
    
    // Report Title
    this.doc.setFontSize(18);
    this.doc.text(title, 20, 40);
    
    // Date
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Report Date: ${new Date(date).toLocaleDateString('en-TZ')}`, 20, 50);
    this.doc.text(`Generated: ${new Date().toLocaleString('en-TZ')}`, 20, 58);
    
    // Line separator
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 65, 190, 65);
  }

  private addSummarySection(report: DailySalesReport): void {
    let yPos = 75;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('📊 Sales Summary', 20, yPos);
    
    yPos += 10;
    
    // Summary table
    const summaryData = [
      ['Total Orders', report.total_orders.toString()],
      ['Gross Revenue', formatCurrency(report.total_revenue)],
      ['Tax (15% VAT)', formatCurrency(report.total_tax)],
      ['Service Charges', formatCurrency(report.total_service_charges)],
      ['Discounts', formatCurrency(report.total_discounts)],
      ['Net Revenue', formatCurrency(report.net_revenue)],
      ['Average Order Value', formatCurrency(report.average_order_value)],
      ['Average Prep Time', `${Math.round(report.average_preparation_time)} minutes`],
      ['Customer Satisfaction', `${report.customer_satisfaction.toFixed(1)}/5 ⭐`]
    ];

    try {
      (this.doc as any).autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { cellWidth: 60, halign: 'right' }
        }
      });
    } catch (error) {
      console.error('Error in summary autoTable:', error);
      // Fallback: add text manually
      summaryData.forEach((row, index) => {
        this.doc.text(`${row[0]}: ${row[1]}`, 20, yPos + 10 + (index * 8));
      });
    }
  }

  private addOrdersByTypeSection(report: DailySalesReport): void {
    const yPos = (this.doc as any).lastAutoTable.finalY + 15;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('🍽️ Orders by Type', 20, yPos);
    
    const orderTypeData = Object.entries(report.orders_by_type).map(([type, data]) => [
      type.replace('_', ' ').toUpperCase(),
      data.count.toString(),
      formatCurrency(data.revenue),
      `${((data.revenue / report.total_revenue) * 100).toFixed(1)}%`
    ]);

    this.doc.autoTable({
      startY: yPos + 5,
      head: [['Order Type', 'Count', 'Revenue', '% of Total']],
      body: orderTypeData,
      theme: 'striped',
      headStyles: { fillColor: [46, 204, 113] },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
  }

  private addPaymentMethodsSection(report: DailySalesReport): void {
    const yPos = (this.doc as any).lastAutoTable.finalY + 15;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('💳 Payment Methods', 20, yPos);
    
    const paymentData = report.payment_methods.map(method => [
      method.method.toUpperCase(),
      method.count.toString(),
      formatCurrency(method.amount),
      `${((method.amount / report.total_revenue) * 100).toFixed(1)}%`
    ]);

    this.doc.autoTable({
      startY: yPos + 5,
      head: [['Payment Method', 'Transactions', 'Amount', '% of Total']],
      body: paymentData,
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182] },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
  }

  private addTopSellingItemsSection(report: DailySalesReport): void {
    const yPos = (this.doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > 250) {
      this.doc.addPage();
      this.addHeader('Daily Sales Report (Continued)', report.date);
      const newYPos = 75;
      this.addTopSellingItemsContent(report, newYPos);
    } else {
      this.addTopSellingItemsContent(report, yPos);
    }
  }

  private addTopSellingItemsContent(report: DailySalesReport, yPos: number): void {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('🏆 Top Selling Items', 20, yPos);
    
    const topItemsData = report.top_selling_items.slice(0, 10).map((item, index) => [
      `#${index + 1}`,
      item.name,
      item.quantity.toString(),
      formatCurrency(item.revenue),
      `${((item.revenue / report.total_revenue) * 100).toFixed(1)}%`
    ]);

    this.doc.autoTable({
      startY: yPos + 5,
      head: [['Rank', 'Item Name', 'Qty Sold', 'Revenue', '% of Total']],
      body: topItemsData,
      theme: 'striped',
      headStyles: { fillColor: [230, 126, 34] },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { cellWidth: 60 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 25 }
      }
    });
  }

  private addRecentOrdersSection(orders: CompletedOrder[]): void {
    const yPos = (this.doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > 220) {
      this.doc.addPage();
      this.addHeader('Daily Sales Report (Continued)', orders[0]?.completed_at.split('T')[0] || '');
      const newYPos = 75;
      this.addRecentOrdersContent(orders, newYPos);
    } else {
      this.addRecentOrdersContent(orders, yPos);
    }
  }

  private addRecentOrdersContent(orders: CompletedOrder[], yPos: number): void {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('📋 Recent Orders', 20, yPos);
    
    const recentOrdersData = orders.slice(-10).reverse().map(order => [
      order.order_number,
      order.customer_name,
      order.order_type.replace('_', ' ').toUpperCase(),
      new Date(order.completed_at).toLocaleTimeString('en-TZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      formatCurrency(order.total_amount),
      `${order.customer_rating}/5 ⭐`
    ]);

    this.doc.autoTable({
      startY: yPos + 5,
      head: [['Order #', 'Customer', 'Type', 'Time', 'Amount', 'Rating']],
      body: recentOrdersData,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 20, halign: 'center' }
      }
    });
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setLineWidth(0.5);
      this.doc.line(20, 280, 190, 280);
      
      // Footer text
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Smart Restaurant Management System - Tanzania', 20, 285);
      this.doc.text(`Page ${i} of ${pageCount}`, 170, 285);
      this.doc.text(`Generated on ${new Date().toLocaleDateString('en-TZ')}`, 20, 290);
    }
  }

  // Generate Order Details PDF
  generateOrderDetailsPDF(order: CompletedOrder): void {
    this.doc = new jsPDF();
    
    // Header
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('🇹🇿 Smart Restaurant', 20, 25);
    
    this.doc.setFontSize(16);
    this.doc.text('Order Receipt', 20, 40);
    
    // Order details
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Order Number: ${order.order_number}`, 20, 55);
    this.doc.text(`Customer: ${order.customer_name}`, 20, 65);
    this.doc.text(`Order Type: ${order.order_type.replace('_', ' ').toUpperCase()}`, 20, 75);
    if (order.table_number) {
      this.doc.text(`Table: ${order.table_number}`, 20, 85);
    }
    this.doc.text(`Date: ${new Date(order.completed_at).toLocaleString('en-TZ')}`, 20, 95);
    
    // Items table
    const itemsData = order.items.map(item => [
      item.name,
      item.quantity.toString(),
      formatCurrency(item.unit_price),
      formatCurrency(item.total_price)
    ]);

    this.doc.autoTable({
      startY: 105,
      head: [['Item', 'Qty', 'Unit Price', 'Total']],
      body: itemsData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
    
    // Totals
    const finalY = (this.doc as any).lastAutoTable.finalY + 10;
    this.doc.text(`Subtotal: ${formatCurrency(order.total_amount - order.tax_amount - (order.service_charge || 0))}`, 130, finalY);
    this.doc.text(`Tax (15%): ${formatCurrency(order.tax_amount)}`, 130, finalY + 10);
    if (order.service_charge) {
      this.doc.text(`Service Charge: ${formatCurrency(order.service_charge)}`, 130, finalY + 20);
    }
    if (order.discount_amount) {
      this.doc.text(`Discount: -${formatCurrency(order.discount_amount)}`, 130, finalY + 30);
    }
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Total: ${formatCurrency(order.total_amount)}`, 130, finalY + 40);
    
    // Download
    this.doc.save(`order-${order.order_number}.pdf`);
  }
}

export const pdfService = new PDFService();
