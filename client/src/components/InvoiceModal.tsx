import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import { toast } from "sonner";

interface InvoiceData {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  createdAt: Date;
  items: Array<{ id: number; productName: string; quantity: number; price: string }>;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
}

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceData | null;
}

export default function InvoiceModal({ open, onOpenChange, invoice }: InvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById("invoice-content");
    if (!element) {
      toast.error("Failed to generate invoice");
      return;
    }

    const html = element.innerHTML;
    const link = document.createElement("a");
    const blob = new Blob([html], { type: "text/html" });
    link.href = URL.createObjectURL(blob);
    link.download = `invoice-${invoice.orderNumber}.html`;
    link.click();
    toast.success("Invoice downloaded");
  };

  const paymentMethodLabel = invoice.paymentMethod === "bank_transfer" ? "Bank Transfer (Al Rajhi)" : "PayPal";
  const paymentStatusMap: Record<string, string> = {
    unpaid: "Unpaid",
    pending_verification: "Pending Verification",
    paid: "Paid",
  };
  const paymentStatusLabel = paymentStatusMap[invoice.paymentStatus] || invoice.paymentStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice #{invoice.orderNumber}</DialogTitle>
        </DialogHeader>

        <div id="invoice-content" className="bg-background p-8 rounded-lg border border-border/50">
          {/* Header */}
          <div className="text-center mb-8 pb-8 border-b border-border/50">
            <h1 className="text-3xl font-bold text-primary mb-2">MLZ STORE</h1>
            <p className="text-sm text-muted-foreground">Dead by Daylight Gaming Store</p>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Bill To</h3>
              <p className="font-semibold">{invoice.customerName}</p>
              <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Invoice Number</p>
                <p className="font-bold text-lg">#{invoice.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Date</p>
                <p className="text-sm">{new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-2 font-semibold">Item</th>
                  <th className="text-center py-2 px-2 font-semibold">Qty</th>
                  <th className="text-right py-2 px-2 font-semibold">Unit Price</th>
                  <th className="text-right py-2 px-2 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-border/30">
                    <td className="py-3 px-2">{item.productName}</td>
                    <td className="text-center py-3 px-2">{item.quantity}</td>
                    <td className="text-right py-3 px-2">${item.price}</td>
                    <td className="text-right py-3 px-2 font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-t border-border/50">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-lg text-primary">${invoice.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-muted/20 rounded-lg p-4 mb-8">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Payment Method</p>
                <p className="font-semibold">{paymentMethodLabel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Payment Status</p>
                <p className="font-semibold">{paymentStatusLabel}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order Status</p>
                <p className="font-semibold capitalize">{invoice.status}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground border-t border-border/50 pt-4">
            <p>Thank you for your purchase!</p>
            <p>For support, join our Discord: discord.gg/MLZ</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
