export interface ApiListing {
  id: string;
  name: string;
  url: string;
  avgRating: number;      
  latestLatency: number | null;
  totalReviews: number;
}

export interface Review {
    rating: number;
    textContent: string;
    dateCreated: Date;
}

export interface PerformanceTestHistory {
    timestamp: Date;
    latencyMs: number;
    statusCode: number;
}

// Full data structure for the detail page
export interface ApiDetails {
    id: string;
    name: string;
    url: string;
    description: string | null;
    avgRating: number;
    totalReviews: number;
    reviews: Review[];
    performanceHistory: PerformanceTestHistory[];
}