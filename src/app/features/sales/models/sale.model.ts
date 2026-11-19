export interface Sale {
    saleId: number;
    nuip: number;
    total: number;
    createdAt: string;
    status: 'PAGADA' | 'PARCIAL' | 'PENDIENTE';
}

export type ResumeStatus = 'PAGADA' | 'PARCIAL' | 'PENDIENTE';

export interface SaleResumeDetail {
    id: number;
    saleId: number;
    itemId: number;
    itemType: 'PLAN' | 'PRODUCTO';
    quantity: number;
    unitPrice: number;
}

export interface SaleResume {
    saleId: number;
    nuip: number;
    total: number;
    createdAt: string;
    status: ResumeStatus;
    pendingAmount: number;
    details: SaleResumeDetail[];
}