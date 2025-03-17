import { User } from './User';
import { Order } from './Order';

export interface Review {
    id: number;
    reviewerId: number;
    reviewer: User;
    reviewedId: number;
    reviewed: User;
    orderId?: number;
    order?: Order;
    rating: number;
    title?: string;
    comment?: string;
    reviewType: 'USER_REVIEW' | 'EXPERIENCE_REVIEW' | 'DELIVERYMAN_REVIEW' | 'PICKUPPOINT_REVIEW';
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDITED';
}
export interface ReviewComponentProps {
    onReviewSubmitted?: () => void; // Optional callback when review is submitted
}