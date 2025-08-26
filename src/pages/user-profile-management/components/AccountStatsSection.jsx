import React, { useEffect, useState } from 'react';
import api from '../../../api';

const AccountStatsSection = ({ userRole }) => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/api/stats?role=${userRole}`);
        setStats(res.data.stats || []);
        setRecentActivity(res.data.recentActivity || []);
      } catch (err) {
        console.error('Failed to fetch account stats:', err);
      }
    };
    fetchStats();
  }, [userRole]);

  // Prioritize buyerStats when userRole is 'buyer'
  const displayedStats = userRole === 'buyer' ? stats.filter(stat => stat.type === 'buyer') : stats;

  return (
    <div className="space-y-6">
      {/* Account Statistics */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Account Statistics</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {displayedStats?.map((stat, index) => (
            <div key={index} className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl mb-1">{stat?.icon}</div>
              <div className="text-xl font-semibold text-foreground">{stat?.value}</div>
              <div className="text-xs text-muted-foreground">{stat?.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="mt-6 space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="text-foreground font-medium">75%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Verification Status</span>
              <span className="text-foreground font-medium">90%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
        
        <div className="space-y-3">
          {recentActivity?.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-muted/30 rounded-full flex items-center justify-center">
                <span className="text-sm">{activity?.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity?.description}</p>
                <p className="text-xs text-muted-foreground">{activity?.date}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 text-sm text-primary hover:text-primary/70 transition-smooth">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default AccountStatsSection;