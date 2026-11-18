import { Plan } from "../models/plan.model";


export const MOCK_PLANS: Plan[] = [
    {
        planId: 1,
        name: 'Mensual',
        description: 'Acceso completo durante 30 días',
        duration: 30,
        amount: 120000
    },
    {
        planId: 2,
        name: 'Trimestral',
        description: 'Acceso completo durante 90 días',
        duration: 90,
        amount: 320000
    },
    {
        planId: 3,
        name: 'Anual',
        description: 'Acceso completo durante 365 días',
        duration: 365,
        amount: 1100000
    }
];