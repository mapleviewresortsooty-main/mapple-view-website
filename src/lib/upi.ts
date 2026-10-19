export function buildUpiPaymentLink(params: {
  payeeUpiId: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
}): string {
  const { payeeUpiId, payeeName, amount, transactionNote } = params;
  const query = new URLSearchParams({
    pa: payeeUpiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: transactionNote,
  });
  return `upi://pay?${query.toString()}`;
}
