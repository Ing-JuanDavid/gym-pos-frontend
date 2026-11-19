export interface CustomerDto {
    customer_id: number;
    nuip: number;

    first_name: string;
    last_name: string;

    phone: string;
    email: string;

    sex: string;

    birth: string | null;

    membership_name: string | null;

    last_attendance: string | null;

    photo_url?: string | null;
}

export interface CustomerUpdate {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    sex?: string;
    birth?: string;
}

export interface CreateCustomerRequest {
    nuip: number;

    first_name: string;
    last_name: string;

    phone: string;
    email: string;

    sex: string;

    birth?: string | null;
}
