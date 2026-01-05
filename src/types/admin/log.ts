/**
 * バックエンドのAuditLogResponseに対応する型
 * 監査ログレスポンス
 */
export interface AuditLog {
    id: string;
    userId: string;
    userName: string; // ユーザー名
    action: string; // アクション（CREATE, UPDATE, DELETE等）
    targetTable: string; // 対象テーブル名
    targetId: string | null; // 対象ID（UUID形式、変換できない場合はnull）
    createdAt: string; // ISO8601形式の日時文字列（LocalDateTime）
}
    
export interface LogListParams {
    page?: number;
    size?: number;
}