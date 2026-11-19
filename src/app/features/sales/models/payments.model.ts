export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA';

export interface Payment {
    paymentId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    createdAt: string;
    saleId: number;
}

export interface PaymentCreateRequest {
    paymentMethod: PaymentMethod;
    amount: number;
}