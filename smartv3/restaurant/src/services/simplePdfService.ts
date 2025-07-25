// src/services/simplePdfService.ts
import jsPDF from 'jspdf';
import { formatCurrency } from '../utils/currency';
import type { DailySalesReport, CompletedOrder } from './reportingService';

class SimplePDFService {
  private async loadLogoAsBase64(): Promise<string | null> {
    try {
      const response = await fetch('/resta.png');
      if (!response.ok) return null;

      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log('Could not load logo:', error);
      return null;
    }
  }

  // Generate a simple Daily Sales Report PDF without autoTable
  async generateDailySalesReport(report: DailySalesReport, orders: CompletedOrder[]): Promise<void> {
    try {
      console.log('🔄 Starting simple PDF generation...', { report, orders });

      const doc = new jsPDF();
      let yPos = 20;

      // Load and add logo
      const logoBase64 = await this.loadLogoAsBase64();
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', 20, yPos, 20, 20);
          console.log('✅ Logo added to PDF');
        } catch (error) {
          console.log('Could not add logo to PDF:', error);
        }
      }

      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Smart Restaurant', logoBase64 ? 50 : 20, yPos + (logoBase64 ? 15 : 0));
      yPos += logoBase64 ? 30 : 15;

      doc.setFontSize(18);
      doc.text('Daily Sales Report', 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Date: ${new Date(report.date).toLocaleDateString('en-TZ')}`, 20, yPos);
      yPos += 8;
      doc.text(`Generated: ${new Date().toLocaleString('en-TZ')}`, 20, yPos);
      yPos += 15;
      
      // Line separator
      doc.setLineWidth(0.5);
      doc.line(20, yPos, 190, yPos);
      yPos += 15;
      
      // Sales Summary
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Sales Summary', 20, yPos);
      yPos += 12;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const summaryItems = [
        `Total Orders: ${report.total_orders}`,
        `Gross Revenue: ${formatCurrency(report.total_revenue)}`,
        `Tax (15% VAT): ${formatCurrency(report.total_tax)}`,
        `Service Charges: ${formatCurrency(report.total_service_charges)}`,
        `Discounts: ${formatCurrency(report.total_discounts)}`,
        `Net Revenue: ${formatCurrency(report.net_revenue)}`,
        `Average Order Value: ${formatCurrency(report.average_order_value)}`,
        `Average Prep Time: ${Math.round(report.average_preparation_time)} minutes`,
        `Customer Satisfaction: ${report.customer_satisfaction.toFixed(1)}/5 stars`
      ];
      
      summaryItems.forEach(item => {
        // Check if we need a new page before adding content
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(item, 25, yPos);
        yPos += 8;
      });

      yPos += 10;
      
      // Orders by Type
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Orders by Type', 20, yPos);
      yPos += 12;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      Object.entries(report.orders_by_type).forEach(([type, data]) => {
        // Check if we need a new page before adding content
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        const percentage = ((data.revenue / report.total_revenue) * 100).toFixed(1);
        doc.text(`${type.replace('_', ' ').toUpperCase()}: ${data.count} orders, ${formatCurrency(data.revenue)} (${percentage}%)`, 25, yPos);
        yPos += 8;
      });

      yPos += 10;
      
      // Payment Methods
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Methods', 20, yPos);
      yPos += 12;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      report.payment_methods.forEach(method => {
        // Check if we need a new page before adding content
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        const percentage = ((method.amount / report.total_revenue) * 100).toFixed(1);
        doc.text(`${method.method.toUpperCase()}: ${method.count} transactions, ${formatCurrency(method.amount)} (${percentage}%)`, 25, yPos);
        yPos += 8;
      });

      yPos += 10;
      
      // Top Selling Items
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Selling Items', 20, yPos);
      yPos += 12;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      report.top_selling_items.slice(0, 8).forEach((item, index) => {
        // Check if we need a new page before adding content
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        const percentage = ((item.revenue / report.total_revenue) * 100).toFixed(1);
        doc.text(`${index + 1}. ${item.name}: ${item.quantity} sold, ${formatCurrency(item.revenue)} (${percentage}%)`, 25, yPos);
        yPos += 8;
      });
      
      // Check if we need a new page (leave more space for footer)
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Daily Sales Report (Continued)', 20, yPos);
        yPos += 20;
      } else {
        yPos += 10;
      }
      
      // Recent Orders
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Recent Orders', 20, yPos);
      yPos += 12;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      orders.slice(-8).reverse().forEach(order => {
        const time = new Date(order.completed_at).toLocaleTimeString('en-TZ', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        doc.text(`${order.order_number} - ${order.customer_name} (${order.order_type.replace('_', ' ')}) - ${time} - ${formatCurrency(order.total_amount)}`, 25, yPos);
        yPos += 7;
        
        // Check if we need a new page (leave space for footer)
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Add footer to all pages
      this.addFooterToAllPages(doc);
      
      // Download the PDF
      const filename = `daily-sales-report-${report.date}.pdf`;
      doc.save(filename);
      console.log('✅ Simple PDF saved:', filename);
      
    } catch (error) {
      console.error('❌ Simple PDF generation failed:', error);
      throw new Error(`Simple PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate a simple order receipt PDF
  async generateOrderDetailsPDF(order: CompletedOrder): Promise<void> {
    try {
      console.log('🔄 Starting simple order PDF generation...', order);
      
      const doc = new jsPDF();
      let yPos = 20;

      // Load and add logo
      const logoBase64 = await this.loadLogoAsBase64();
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', 20, yPos, 20, 20);
          console.log('✅ Logo added to order PDF');
        } catch (error) {
          console.log('Could not add logo to order PDF:', error);
        }
      }

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Smart Restaurant', logoBase64 ? 50 : 20, yPos + (logoBase64 ? 15 : 0));
      yPos += logoBase64 ? 30 : 15;
      
      doc.setFontSize(16);
      doc.text('Order Receipt', 20, yPos);
      yPos += 15;
      
      // Order details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Order Number: ${order.order_number}`, 20, yPos);
      yPos += 8;
      doc.text(`Customer: ${order.customer_name}`, 20, yPos);
      yPos += 8;
      doc.text(`Order Type: ${order.order_type.replace('_', ' ').toUpperCase()}`, 20, yPos);
      yPos += 8;
      
      if (order.table_number) {
        doc.text(`Table: ${order.table_number}`, 20, yPos);
        yPos += 8;
      }
      
      doc.text(`Date: ${new Date(order.completed_at).toLocaleString('en-TZ')}`, 20, yPos);
      yPos += 15;
      
      // Items header
      doc.setFont('helvetica', 'bold');
      doc.text('Items:', 20, yPos);
      yPos += 10;
      
      // Items list
      doc.setFont('helvetica', 'normal');
      order.items.forEach(item => {
        doc.text(`${item.quantity}x ${item.name}`, 25, yPos);
        doc.text(`${formatCurrency(item.unit_price)} each`, 120, yPos);
        doc.text(`${formatCurrency(item.total_price)}`, 160, yPos);
        yPos += 8;
      });
      
      yPos += 10;
      
      // Totals
      const subtotal = order.total_amount - order.tax_amount - (order.service_charge || 0);
      doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 120, yPos);
      yPos += 8;
      doc.text(`Tax (15%): ${formatCurrency(order.tax_amount)}`, 120, yPos);
      yPos += 8;
      
      if (order.service_charge) {
        doc.text(`Service Charge: ${formatCurrency(order.service_charge)}`, 120, yPos);
        yPos += 8;
      }
      
      if (order.discount_amount) {
        doc.text(`Discount: -${formatCurrency(order.discount_amount)}`, 120, yPos);
        yPos += 8;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${formatCurrency(order.total_amount)}`, 120, yPos);
      
      // Add footer
      this.addFooterToAllPages(doc, 'Thank you for dining with us!');
      
      // Download
      const filename = `order-${order.order_number}.pdf`;
      doc.save(filename);
      console.log('✅ Simple order PDF saved:', filename);
      
    } catch (error) {
      console.error('❌ Simple order PDF generation failed:', error);
      throw new Error(`Simple order PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to add footer to all pages
  private addFooterToAllPages(doc: any, customMessage?: string): void {
    const pageCount = doc.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Footer line at fixed position
      const footerY = 275;
      doc.setLineWidth(0.5);
      doc.line(20, footerY, 190, footerY);

      // Footer text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      if (customMessage) {
        doc.text(customMessage, 20, footerY + 8);
        doc.text('Smart Restaurant Management System - Tanzania', 20, footerY + 15);
        doc.text(`Page ${i} of ${pageCount}`, 150, footerY + 8);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-TZ')}`, 150, footerY + 15);
      } else {
        doc.text('Smart Restaurant Management System - Tanzania', 20, footerY + 8);
        doc.text(`Page ${i} of ${pageCount}`, 150, footerY + 8);
        doc.text(`Generated: ${new Date().toLocaleDateString('en-TZ')}`, 20, footerY + 15);
      }
    }
  }
}

export const simplePdfService = new SimplePDFService();
