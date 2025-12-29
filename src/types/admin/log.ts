export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    createdAt: string; // or createdAt（BEと統一）
}
    
export interface LogListParams {
    page?: number;
    size?: number;
}