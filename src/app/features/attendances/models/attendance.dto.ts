export interface AttendanceDto {
    attendance_id: number;

    nuip: number;
    customer_name: string;

    membership_name: string | null;

    check_in: string;
    check_out: string | null;

    status: 'ACTIVE' | 'FINISHED';
}