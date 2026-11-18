export interface MembershipDetailDto {
    membership_id: number;

    customer_id: number;

    plan_id: number;

    status: boolean;

    start_date: string;

    end_date: string | null;

    customer_name: string;

    plan_name: string;


}