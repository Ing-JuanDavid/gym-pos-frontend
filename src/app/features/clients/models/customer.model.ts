// export interface Customer {
//     nuip: number;
//     firstName: string;
//     lastName: string;
//     email: string;
//     phone: string;
//     sex: string;
// }


export interface Customer {
    nuip: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    sex: string;
    birth?: string;

    membershipName?: string | null;
    lastAttendance?: string | null;
}

