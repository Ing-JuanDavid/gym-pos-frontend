export interface Membership {
    membershipId: number;

    customerId: number;

    planId: number;

    status: boolean;

    startDate: string;

    endDate: string | null;
}



export interface MembershipDetail {
    membershipId: number;

    customerId: number;

    planId: number;

    status: boolean;

    startDate: string;

    endDate: string | null;
    customerName: string;
    planName: string
}