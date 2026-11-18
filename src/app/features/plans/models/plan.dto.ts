export interface PlanDto {
    plan_id: number;
    name: string;
    description: string;
    duration: number;
    amount: number;
}


export interface PlanUpdateRequest {
    name?: string;
    description?: string;
    duration?: number;
    amount?: number;
}

export interface PlanCreateRequest {
    name: string;
    description: string;
    duration: number;
    amount: number;
}