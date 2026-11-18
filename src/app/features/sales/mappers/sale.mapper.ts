import { SaleDto } from '../models/sale.dto';
import { Sale } from '../models/sale.model';

export class SaleMapper {

    static toModel(
        dto: SaleDto
    ): Sale {

        return {
            saleId: dto.sale_id,
            nuip: dto.nuip,
            total: dto.total,
            createdAt: dto.created_at,
            status: dto.status
        };

    }

}