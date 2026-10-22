import QRCode from "qrcode";

export function buildUpiUri(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  note: string;
}) {
  const search = new URLSearchParams({
    pa: params.upiId,
    pn: params.payeeName || "Resort",
    am: params.amount.toFixed(2),
    cu: "INR",
    tn: params.note,
  });
  return `upi://pay?${search.toString()}`;
}

export async function buildUpiQrDataUrl(params: {
  upiId: string;
  payeeName: string;
  amount: number;
  note: string;
}) {
  const uri = buildUpiUri(params);
  return QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}
