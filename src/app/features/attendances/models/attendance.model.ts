export interface Attendance {
    attendanceId: number;

    nuip: number;
    customerName: string;

    membershipName: string | null;

    checkIn: string;
    checkOut: string | null;

    status: 'ACTIVE' | 'FINISHED';
}