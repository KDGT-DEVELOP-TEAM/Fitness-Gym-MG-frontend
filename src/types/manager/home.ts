export interface ManagerHomeResponse {
    totalCustomers: number;
    activeCustomers: number;
    pendingLessons: number;
    [key: string]: any; // BE 仕様に応じて具体化
    }