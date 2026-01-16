import moment from 'moment';

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const INVOICE_TEMPLATE = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{FILE_NAME}</title> 
    <style>
        body { font-family: "Arial", sans-serif; margin: 0; padding: 20px; background-color: #e9e9e9; color: #333; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
        .invoice-wrapper { background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 320px; }
        .header { font-size: 1.4em; font-weight: bold; text-align: center; margin-bottom: 5px; text-transform: uppercase; }
        .sub-header { text-align: center; font-size: 0.9em; line-height: 1.4; color: #555; }
        hr { border: none; border-top: 1px dashed #ccc; margin: 10px 0; }
        .info { font-size: 0.9em; line-height: 1.5; }
        .info p { margin: 4px 0; display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table th, table td { text-align: left; padding: 6px 0; font-size: 0.9em; }
        table th { border-bottom: 2px solid #ddd; }
        table td { border-bottom: 1px solid #eee; }
        .text-right { text-align: right; }
        .total-section { margin-top: 15px; }
        .row-money { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9em; }
        .total-final { font-weight: bold; font-size: 1.2em; margin-top: 10px; border-top: 2px solid #333; padding-top: 10px; }
        .footer { margin-top: 20px; font-size: 0.85em; text-align: center; color: #666; font-style: italic; }
        
        .actions { margin-top: 20px; display: flex; gap: 10px; width: 320px; }
        .btn { flex: 1; padding: 10px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-family: inherit; transition: 0.2s; }
        .btn-print { background-color: #2f54eb; color: white; }
        .btn-close { background-color: #ff4d4f; color: white; }
        .btn:hover { opacity: 0.9; }
        
        @media print {
            body { background: white; padding: 0; }
            .invoice-wrapper { box-shadow: none; width: 100%; }
            .actions { display: none; }
        }
    </style>
</head>
<body>
    <div class="invoice-wrapper">
        <div class="header">Cafe w fen</div>
        <div class="sub-header">
            Đại học Công nghệ thông tin - ĐHQG TP.HCM<br>
            --------------------------------
        </div>
        <div class="info">
            <p><strong>Số HĐ:</strong> <span>#{ORDER_ID}</span></p>
            <p><strong>Ngày:</strong> <span>{DATE}</span></p>
            <p><strong>Loại:</strong> <span>{SERVICE_TYPE}</span></p>
            <p><strong>Thu ngân:</strong> <span>{STAFF_NAME}</span></p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th style="width: 40%">Món</th>
                    <th style="width: 15%; text-align: center">SL</th>
                    <th style="width: 45%; text-align: right">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                {ITEM_ROWS}
            </tbody>
        </table>

        <div class="total-section">
            <div class="row-money">
                <span>Tổng tiền hàng:</span>
                <span>{TOTAL_AMOUNT}</span>
            </div>
            <div class="row-money" style="color: red;">
                <span>Giảm giá:</span>
                <span>- {DISCOUNT_AMOUNT}</span>
            </div>
            <div class="row-money total-final">
                <span>THANH TOÁN:</span>
                <span>{FINAL_TOTAL}</span>
            </div>
        </div>

        <div class="footer">
            <p>Cảm ơn quý khách & Hẹn gặp lại!</p>
            <p>Wifi: <strong>Cafewfen</strong> | Pass: 12345678</p>
        </div>
    </div>

    <div class="actions">
        <button class="btn btn-print" onclick="window.print()">🖨️ In Hóa Đơn</button>
        <button class="btn btn-close" onclick="window.close()">✖ Đóng</button>
    </div>
</body>
</html>
`;

interface PrintData {
  orderId: number | string;
  serviceType: string;
  staffName: string;
  totalPrice: number;
  discountAmount: number;
  finalTotal: number;
  items: Array<{
    productName: string;
    size: string;
    mood?: string;
    quantity: number;
    price: number;
  }>;
}

export const printInvoice = (data: PrintData) => {
  const date = moment().format('DD/MM/YYYY HH:mm');

  const fileName = slugify(`Hóa đơn DH${data.orderId}`);

  const itemRowsHtml = data.items
    .map((item) => `
        <tr>
            <td>
                ${item.productName}<br/>
                <small style="color: #666; font-size: 0.85em;">${item.size} ${item.mood ? `(${item.mood})` : ''}</small>
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td class="text-right">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
        </tr>
    `)
    .join('');

  let invoiceContent = INVOICE_TEMPLATE;
  
  // 4. Thay thế Placeholder tiêu đề
  invoiceContent = invoiceContent.replace(/{FILE_NAME}/g, fileName);
  
  invoiceContent = invoiceContent.replace(/{ORDER_ID}/g, String(data.orderId));
  invoiceContent = invoiceContent.replace(/{SERVICE_TYPE}/g, data.serviceType);
  invoiceContent = invoiceContent.replace(/{DATE}/g, date);
  invoiceContent = invoiceContent.replace(/{STAFF_NAME}/g, data.staffName);
  invoiceContent = invoiceContent.replace(/{ITEM_ROWS}/g, itemRowsHtml);
  
  invoiceContent = invoiceContent.replace(/{TOTAL_AMOUNT}/g, data.totalPrice.toLocaleString('vi-VN') + '₫');
  invoiceContent = invoiceContent.replace(/{DISCOUNT_AMOUNT}/g, data.discountAmount.toLocaleString('vi-VN') + '₫');
  invoiceContent = invoiceContent.replace(/{FINAL_TOTAL}/g, data.finalTotal.toLocaleString('vi-VN') + '₫');

  const width = 400;
  const height = 700;
  const left = (window.screen.width / 2) - (width / 2);
  const top = (window.screen.height / 2) - (height / 2);

  const printWindow = window.open('', '_blank', `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`);
  
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
    printWindow.focus();
  } else {
    alert("Vui lòng cho phép mở Popup để xem hóa đơn!");
  }
};