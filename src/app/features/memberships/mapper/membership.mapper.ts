import { MembershipDetailDto } from "../models/membership.dto";
import { MembershipDetail } from "../models/membership.model";

export class MembershipMapper {

    static toModelDetail(
        dto: MembershipDetailDto
    ): MembershipDetail {

        return {
            membershipId: dto.membership_id,

            customerId: dto.customer_id,

            planId: dto.plan_id,

            status: dto.status,

            startDate: dto.start_date,

            endDate: dto.end_date,
            customerName: dto.customer_name,
            planName: dto.plan_name
        };

    }

}