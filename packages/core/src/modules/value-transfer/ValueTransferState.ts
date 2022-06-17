/**
 * Value Transfer protocol states
 *
 * */
export enum ValueTransferState {
  RequestSent = 'request-sent',
  RequestReceived = 'request-received',
  RequestAcceptanceSent = 'request-acceptance-sent',
  CashAcceptanceSent = 'cash-acceptance-sent',
  CashRemovalSent = 'cash-removal-sent',
  ReceiptReceived = 'receipt-received',
  Failed = 'failed',
  Completed = 'completed',
}
