import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export default async function PrintOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true, variant: true },
      },
    },
  });

  if (!order) notFound();

  // Chỉ in tự động khi vừa mở trang (sử dụng JS thuần)
  const autoPrintScript = `window.onload = function() { window.print(); }`;

  const trackingCode = order.shippingCode || order.code;
  const maskedPhone = order.customerPhone.replace(/.(?=.{4})/g, '*');

  return (
    <div className="print-wrapper bg-white">
      <script dangerouslySetInnerHTML={{ __html: autoPrintScript }} />
      <style dangerouslySetInnerHTML={{
        __html: `
          @page { size: 75mm 100mm; margin: 0; }
          body { background: #fff; margin: 0; padding: 0; }
          nav, aside, header, footer, .admin-sidebar, .admin-header { display: none !important; }
          .print-wrapper { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 4px; color: #000; width: 73mm; position: absolute; top: 0; left: 0; right: 0; z-index: 9999; background: white; min-height: 100vh; font-size: 9px; }
          
          .ghtk-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
          .ghtk-logo { font-size: 14px; font-weight: 800; font-style: italic; }
          .sorting-code { border: 1px solid #000; padding: 2px 4px; font-size: 10px; font-weight: bold; }
          
          .barcode-section { text-align: center; padding: 4px 0; border-bottom: 1px solid #000; margin-bottom: 4px; }
          .barcode-img { width: 60mm; height: 12mm; }
          .tracking-id { font-size: 11px; font-weight: bold; margin-top: 2px; }
          
          .address-grid { display: grid; grid-template-columns: 1fr; gap: 4px; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
          .addr-box { line-height: 1.3; }
          .label { font-weight: bold; text-decoration: underline; margin-bottom: 1px; display: block; text-transform: uppercase; font-size: 8px; }
          
          .items-section { border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 4px; }
          .items-table { width: 100%; border-collapse: collapse; font-size: 8px; }
          .items-table th { text-align: left; border-bottom: 1px solid #ccc; padding: 2px 0; }
          .items-table td { padding: 3px 0; border-bottom: 1px dotted #eee; }
          
          .footer-section { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; align-items: center; }
          .cod-amount-box { border: 2px solid #000; padding: 4px; text-align: center; }
          .cod-val { font-size: 16px; font-weight: 900; }
          .instruction { font-size: 8px; font-style: italic; line-height: 1.2; text-align: center; }
          
          .shop-tag { text-align: center; font-size: 8px; margin-top: 4px; border-top: 1px dotted #ccc; padding-top: 4px; }
        `
      }} />

      {/* Header GHTK Style */}
      <div className="ghtk-header">
        <div className="ghtk-logo">GHTK</div>
        <div className="sorting-code">{(order.provinceName || "GHTK").substring(0, 3).toUpperCase()}-TB</div>
      </div>

      {/* Barcode */}
      <div className="barcode-section">
        <img 
          src={`https://barcode.tec-it.com/barcode.ashx?data=${trackingCode}&code=Code128&translate-esc=true`} 
          alt="barcode" 
          className="barcode-img"
        />
        <div className="tracking-id">{trackingCode}</div>
      </div>

      {/* Address */}
      <div className="address-grid">
        <div className="addr-box">
          <span className="label">Từ:</span>
          <strong>TINORI SHOP</strong> - 0987.xxx.xxx<br/>
          Số 123, Đường ABC, Quận XYZ, Hà Nội
        </div>
        <div className="addr-box" style={{ borderTop: '1px dotted #000', paddingTop: '4px' }}>
          <span className="label">Đến:</span>
          <strong>{order.customerName}</strong> - {maskedPhone}<br/>
          {order.detailedAddress}, {order.wardName}, {order.districtName}, {order.provinceName}
        </div>
      </div>

      {/* Items */}
      <div className="items-section">
        <span className="label">Nội dung hàng hóa:</span>
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '70%' }}>Sản phẩm</th>
              <th style={{ width: '10%', textAlign: 'center' }}>SL</th>
              <th style={{ width: '20%', textAlign: 'right' }}>Giá</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  {item.product.name}
                  {item.variant && <div style={{ fontSize: '7px', color: '#555' }}>({item.variant.value})</div>}
                </td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right' }}>{formatPrice(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer COD */}
      <div className="footer-section">
        <div className="instruction">
          Cho xem hàng, không thử.<br/>
          Trân trọng cảm ơn!
        </div>
        <div className="cod-amount-box">
          <div style={{ fontSize: '8px' }}>TIỀN THU (COD)</div>
          <div className="cod-val">{formatPrice(order.totalAmount - order.depositAmount)}</div>
        </div>
      </div>

      <div className="shop-tag">
        ♡ Chúc cậu một ngày thật xinh đẹp cùng Tinori ♡
      </div>
    </div>
  );
}
