export interface ProfileStats {
  subscriptionsCount: number;
  paymentsCount: number;
  storiesCount: number;
  commentsCount: number;
  bookmarksCount: number;
}

export interface ProfilePlan {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  interval: string;
  intervalCount: number;
  isActive?: boolean;
  razorpayPlanId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileSubscription {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
  razorpaySubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
  plan: ProfilePlan;
  payments?: ProfilePayment[];
}

/** Nested on each payment from `GET /auth/me/payments`. */
export interface ProfilePaymentSubscription {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
  razorpaySubscriptionId: string | null;
  plan: ProfilePlan;
}

export interface ProfilePayment {
  id: number;
  userId?: number;
  subscriptionId?: number | null;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  razorpayPaymentId: string | null;
  razorpayOrderId?: string | null;
  razorpaySignature?: string | null;
  failureReason?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  subscription?: ProfilePaymentSubscription | null;
}

export interface ProfileBookmark {
  id: number;
  createdAt: string;
  story: {
    id: number;
    title: string;
    isPublished: boolean;
    isPremium: boolean;
  };
}

export interface ProfileStory {
  id: number;
  title: string;
  isPublished: boolean;
  isPremium: boolean;
  createdAt: string;
}

export interface ProfileComment {
  id: number;
  content: string;
  createdAt: string;
}

export interface ProfileMeResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  account: {
    id: number;
    role: string;
    isEmailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  stats: ProfileStats;
  activeSubscription: ProfileSubscription | null;
}

export interface ProfileSubscriptionsResponse {
  activeSubscription: ProfileSubscription | null;
  subscriptions: ProfileSubscription[];
}

export interface ProfilePaymentsResponse {
  payments: ProfilePayment[];
}

export interface ProfileActivityResponse {
  recentStories: ProfileStory[];
  recentComments: ProfileComment[];
  bookmarks: ProfileBookmark[];
}
