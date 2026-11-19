import { Attendance } from "../models/attendance.model";
import { AttendanceDto } from "../models/attendance.dto";

export class AttendanceMapper {

    static toModel(dto: AttendanceDto): Attendance {

        return {

            attendanceId: dto.attendance_id,
            checkIn: dto.check_in,
            checkOut: dto.check_out,
            customerName: dto.customer_name,
            membershipName: dto.membership_name,
            nuip: dto.nuip,
            status: dto.status
        };
    }

}