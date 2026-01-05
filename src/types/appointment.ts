/**
 * 予約情報
 */
export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  };
  instructor: {
    id: string;
    name: string;
  };
  shop: {
    id: string;
    name: string;
  };
}

