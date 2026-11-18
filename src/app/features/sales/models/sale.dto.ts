export interface SaleDto {
    sale_id: number;
    nuip: number;
    total: number;
    created_at: string;
    status: 'PAGADA' | 'PARCIAL' | 'PENDIENTE';
}

export interface SaleCreateRequest {
    nuip: number;
    details: SaleDetailRequest[];
}

export interface SaleDetailRequest {
    item_id: number;
    item_type: 'PLAN' | 'PRODUCTO';
    quantity: number;
}
