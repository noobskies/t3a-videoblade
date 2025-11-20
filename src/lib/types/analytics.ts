export interface VideoStats {
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalVideos: number;
  viewsGrowth: number; // percentage
  platformBreakdown: {
    youtube: number;
    tiktok: number;
  };
}

export interface TrendDataPoint {
  date: string;
  views: number;
  youtube: number;
  tiktok: number;
}
