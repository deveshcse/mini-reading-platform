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
  price: number;
  currency: string;
  interval: string;
  intervalCount: number;
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

export interface ProfilePayment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  razorpayPaymentId: string | null;
  createdAt: string;
  subscription?: {
    id: number;
    status: string;
    plan?: ProfilePlan;
  } | null;
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
