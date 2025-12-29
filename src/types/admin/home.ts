export interface AdminHomeStats {
    totalUsers: number;
    activeUsers: number;
    totalCustomers: number;
    activeCustomers: number;
}
    
export interface AdminHomeResponse {
    stats: AdminHomeStats;
    notices: {
    id: string;
    message: string;
    createdAt: string;
    }[];
}