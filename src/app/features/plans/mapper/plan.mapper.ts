import { PlanDto } from '../models/plan.dto';
import { Plan } from '../models/plan.model';

export class PlanMapper {

    static toModel(dto: PlanDto): Plan {

        return {
            planId: dto.plan_id,
            name: dto.name,
            description: dto.description,
            duration: dto.duration,
            amount: dto.amount
        };

    }

}