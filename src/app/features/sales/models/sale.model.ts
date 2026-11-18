export interface Sale {
    saleId: number;
    nuip: number;
    total: number;
    createdAt: string;
    status: 'PAGADA' | 'PARCIAL' | 'PENDIENTE';
}