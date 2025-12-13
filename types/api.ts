export interface ApiListing {
  id: string;
  name: string;
  url: string;
  avgRating: number;      // 0.0 to 5.0
  latestLatency: number | null; // Latency in milliseconds (null if not tested)
  totalReviews: number;
}