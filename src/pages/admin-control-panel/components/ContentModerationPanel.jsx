import React, { useState } from 'react';
import Button from '../../../components/ui/Button';

const ContentModerationPanel = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [flaggedContent] = useState([
    {
      id: 1,
      type: 'listing',
      title: 'iPhone 15 Pro Max - Brand New',
      user: 'john.doe@example.com',
      reason: 'Potential counterfeit product',
      reportedBy: 'user_reports',
      reportCount: 3,
      status: 'pending',
      flaggedDate: '2024-08-10',
      priority: 'high'
    },
    {
      id: 2,
      type: 'review',
      title: 'Review for "Luxury Watch Collection"',
      user: 'sarah.m@example.com',
      reason: 'Inappropriate language',
      reportedBy: 'automated_detection',
      reportCount: 1,
      status: 'pending',
      flaggedDate: '2024-08-09',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'user_profile',
      title: 'Profile: Michael Chen',
      user: 'm.chen@example.com',
      reason: 'Suspicious profile information',
      reportedBy: 'admin_review',
      reportCount: 1,
      status: 'under_review',
      flaggedDate: '2024-08-08',
      priority: 'high'
    },
    {
      id: 4,
      type: 'message',
      title: 'Private message thread',
      user: 'alex.k@example.com',
      reason: 'Harassment reported',
      reportedBy: 'recipient_report',
      reportCount: 1,
      status: 'resolved',
      flaggedDate: '2024-08-07',
      priority: 'urgent'
    }
  ]);

  const [reportedUsers] = useState([
    {
      id: 1,
      name: 'Robert Wilson',
      email: 'r.wilson@example.com',
      reportCount: 5,
      lastReport: '2 hours ago',
      reasons: ['Fake products', 'Non-delivery', 'Poor communication'],
      status: 'investigated'
    },
    {
      id: 2,
      name: 'Lisa Anderson',
      email: 'l.anderson@example.com',
      reportCount: 2,
      lastReport: '1 day ago',
      reasons: ['Overcharging', 'Item not as described'],
      status: 'pending'
    }
  ]);

  const filteredContent = flaggedContent?.filter(item => 
    activeFilter === 'all' || item?.status === activeFilter
  );

  const handleContentAction = (contentId, action) => {
    console.log(`Performing ${action} on content ${contentId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-warning', text: 'text-warning-foreground', label: 'Pending' },
      under_review: { bg: 'bg-accent', text: 'text-accent-foreground', label: 'Under Review' },
      resolved: { bg: 'bg-success', text: 'text-success-foreground', label: 'Resolved' },
      dismissed: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Dismissed' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      urgent: { bg: 'bg-destructive', text: 'text-destructive-foreground', label: 'Urgent' },
      high: { bg: 'bg-warning', text: 'text-warning-foreground', label: 'High' },
      medium: { bg: 'bg-accent', text: 'text-accent-foreground', label: 'Medium' },
      low: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Low' }
    };
    
    const config = priorityConfig?.[priority] || priorityConfig?.medium;
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Content Moderation Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Pending Review</h3>
          <p className="text-2xl font-bold text-warning">
            {flaggedContent?.filter(item => item?.status === 'pending')?.length}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Under Review</h3>
          <p className="text-2xl font-bold text-accent">
            {flaggedContent?.filter(item => item?.status === 'under_review')?.length}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Resolved Today</h3>
          <p className="text-2xl font-bold text-success">12</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Auto-Flagged</h3>
          <p className="text-2xl font-bold text-primary">8</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-card rounded-lg border border-border">
        <div className="flex overflow-x-auto border-b border-border">
          {['all', 'pending', 'under_review', 'resolved']?.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-smooth border-b-2 ${
                activeFilter === filter
                  ? 'text-primary border-primary bg-primary/5' :'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {filter?.replace('_', ' ')?.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Flagged Content List */}
        <div className="divide-y divide-border">
          {filteredContent?.map((item) => (
            <div key={item?.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-foreground">{item?.title}</h3>
                    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                      {item?.type?.replace('_', ' ')}
                    </span>
                    {getPriorityBadge(item?.priority)}
                    {getStatusBadge(item?.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">User:</span> {item?.user}
                    </div>
                    <div>
                      <span className="font-medium">Reason:</span> {item?.reason}
                    </div>
                    <div>
                      <span className="font-medium">Reported by:</span> {item?.reportedBy?.replace('_', ' ')}
                    </div>
                    <div>
                      <span className="font-medium">Reports:</span> {item?.reportCount}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    Flagged on {item?.flaggedDate}
                  </p>
                </div>

                <div className="flex space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContentAction(item?.id, 'view')}
                  >
                    View Details
                  </Button>
                  
                  {item?.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleContentAction(item?.id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleContentAction(item?.id, 'remove')}
                      >
                        Remove
                      </Button>
                    </>
                  )}
                  
                  {item?.status === 'under_review' && (
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => handleContentAction(item?.id, 'escalate')}
                    >
                      Escalate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContent?.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-muted-foreground">No flagged content in this category.</p>
          </div>
        )}
      </div>

      {/* Reported Users Section */}
      <div className="bg-card rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Frequently Reported Users</h3>
        </div>
        
        <div className="divide-y divide-border">
          {reportedUsers?.map((user) => (
            <div key={user?.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-destructive">
                        {user?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{user?.name}</h4>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs bg-destructive text-destructive-foreground">
                      {user?.reportCount} reports
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {user?.reasons?.map((reason, index) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                        {reason}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Last reported: {user?.lastReport}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                  <Button size="sm" variant="warning">
                    Warn User
                  </Button>
                  <Button size="sm" variant="destructive">
                    Suspend
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Moderation Tools */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Moderation Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="justify-start">
            🤖 Configure Auto-Moderation Rules
          </Button>
          <Button variant="outline" className="justify-start">
            📝 Content Guidelines Editor
          </Button>
          <Button variant="outline" className="justify-start">
            📊 Generate Moderation Report
          </Button>
          <Button variant="outline" className="justify-start">
            🚫 Keyword Blacklist Management
          </Button>
          <Button variant="outline" className="justify-start">
            👥 Moderator Team Management
          </Button>
          <Button variant="outline" className="justify-start">
            📧 User Communication Templates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentModerationPanel;