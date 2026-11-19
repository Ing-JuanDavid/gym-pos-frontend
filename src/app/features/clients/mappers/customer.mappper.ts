import { Customer } from '../models/customer.model';
import { CustomerDto } from '../models/customer.dto';

export class CustomerMapper {

    static toModel(dto: CustomerDto): Customer {

        return {

            nuip: dto.nuip,

            firstName: dto.first_name,
            lastName: dto.last_name,

            phone: dto.phone,
            email: dto.email,

            sex: dto.sex ?? undefined,

            birth: dto.birth ?? undefined,

            membershipName: dto.membership_name,

            lastAttendance: dto.last_attendance,

            photoUrl: dto.photo_url ?? undefined
        };
    }

}