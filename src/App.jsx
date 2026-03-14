import { useState, useEffect, useRef } from 'react';
import leads from './data/leads';
import './App.css';

const getSourceClass = (source) => {
  const classes = {
    'google': 'source-google',
    'facebook': 'source-facebook',
    'website': 'source-website',
    'referral': 'source-referral',
    'ads': 'source-ads',
    'direct': 'source-direct'
  };
  return classes[source] || 'source-website';
};

const getStatusClass = (status) => {
  const classes = {
    'new': 'status-new',
    'contacted': 'status-contacted',
    'qualified': 'status-qualified',
    'converted': 'status-converted',
    'lost': 'status-lost'
  };
  return classes[status] || 'status-new';
};

const getStatusLabel = (status) => {
  const labels = {
    'new': 'New',
    'contacted': 'Contacted',
    'qualified': 'Qualified',
    'converted': 'Converted',
    'lost': 'Lost'
  };
  return labels[status] || 'New';
};

function App() {
  const [allLeads, setAllLeads] = useState(leads);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedLead, setSelectedLead] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLeads = filter === 'all' 
    ? allLeads 
    : filter === 'ads' 
      ? allLeads.filter(l => ['google', 'facebook', 'ads'].includes(l.source))
      : allLeads.filter(l => l.source === filter);

  const adLeadsCount = allLeads.filter(l => ['google', 'facebook', 'ads'].includes(l.source)).length;
  const convertedCount = allLeads.filter(l => l.status === 'converted').length;
  const thisMonthCount = allLeads.filter(l => l.date.startsWith('2026-03')).length;

  const updateStatus = (id, newStatus) => {
    setAllLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const showLeadDetails = (lead) => {
    setSelectedLead(lead);
  };

  const closePanel = () => {
    setSelectedLead(null);
  };

  const renderDashboard = () => (
    <>
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">Total Leads</p>
                <h3 className="mb-0">{filter === 'all' ? allLeads.length : filteredLeads.length}</h3>
              </div>
              <div className="icon" style={{ background: '#d4e6f1', color: '#2471a3' }}>
                <i className="fas fa-users"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">Ad Leads</p>
                <h3 className="mb-0">{adLeadsCount}</h3>
              </div>
              <div className="icon" style={{ background: '#d5f5e3', color: '#1e8449' }}>
                <i className="fas fa-ad"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">Converted</p>
                <h3 className="mb-0">{convertedCount}</h3>
              </div>
              <div className="icon" style={{ background: '#eafaf1', color: '#27ae60' }}>
                <i className="fas fa-check-circle"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">This Month</p>
                <h3 className="mb-0">{thisMonthCount}</h3>
              </div>
              <div className="icon" style={{ background: '#fef9e7', color: '#f39c12' }}>
                <i className="fas fa-calendar"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>Recent Leads {filter !== 'all' && `(${filter})`}</h5>
        <button className="btn btn-primary btn-sm" onClick={() => { setCurrentView('all'); }}>
          View All <i className="fas fa-arrow-right ms-1"></i>
        </button>
      </div>
    </>
  );

  const handleFilterClick = (filterValue) => {
    setFilter(filterValue);
    if (currentView !== 'dashboard') {
      setCurrentView('all');
    }
  };

  const renderLeadsList = (leadsToRender) => {
    if (leadsToRender.length === 0) {
      return <p className="text-muted">No leads found for this filter.</p>;
    }
    return leadsToRender.map(lead => (
      <div key={lead.id} className="lead-card" onClick={() => showLeadDetails(lead)}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1">{lead.name}</h6>
            <p className="text-muted mb-0" style={{ fontSize: '14px' }}>{lead.phone}</p>
          </div>
          <span className={`source-badge ${getSourceClass(lead.source)}`}>{lead.sourceDisplay}</span>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <p className="mb-1" style={{ fontSize: '13px' }}><strong>Property:</strong> {lead.property}</p>
            <p className="mb-0" style={{ fontSize: '13px' }}><strong>Budget:</strong> {lead.budget}</p>
          </div>
          <div className="col-6 text-end">
            <span className={`source-badge ${getStatusClass(lead.status)}`}>{getStatusLabel(lead.status)}</span>
            <p className="text-muted mb-0 mt-2" style={{ fontSize: '12px' }}>{lead.date}</p>
          </div>
        </div>
      </div>
    ));
  };

  const renderAnalytics = () => {
    const sourceStats = {};
    allLeads.forEach(l => {
      sourceStats[l.sourceDisplay] = (sourceStats[l.sourceDisplay] || 0) + 1;
    });

    const statusStats = {};
    allLeads.forEach(l => {
      statusStats[getStatusLabel(l.status)] = (statusStats[getStatusLabel(l.status)] || 0) + 1;
    });

    return (
      <div className="row">
        <div className="col-md-6">
          <div className="stat-card">
            <h6 className="mb-3">Leads by Source</h6>
            {Object.entries(sourceStats).map(([source, count]) => (
              <div key={source} className="d-flex justify-content-between mb-2">
                <span>{source}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <div className="stat-card">
            <h6 className="mb-3">Leads by Status</h6>
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="d-flex justify-content-between mb-2">
                <span>{status}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 sidebar p-3">
          <h4 className="mb-4 px-3">
            <i className="fas fa-home me-2"></i>RealEstate CRM
          </h4>
          <nav>
            <a href="#" className={currentView === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); setFilter('all'); }}>
              <i className="fas fa-chart-pie"></i> Dashboard
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('all'); setFilter('all'); }}>
              <i className="fas fa-users"></i> All Leads
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleFilterClick('ads'); }}>
              <i className="fas fa-ad"></i> Ad Leads
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('analytics'); }}>
              <i className="fas fa-chart-line"></i> Analytics
            </a>
          </nav>
        </div>

        <div className="col-md-10 p-0">
          <div className="top-bar d-flex justify-content-between align-items-center">
            <h5 className="m-0">
              {currentView === 'dashboard' && 'Dashboard'}
              {currentView === 'all' && (filter === 'ads' ? 'Ad Leads' : filter === 'all' ? 'All Leads' : `${filter} Leads`)}
              {currentView === 'analytics' && 'Analytics'}
            </h5>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">Welcome, Admin</span>
              <div className="dropdown" style={{ position: 'relative' }} ref={filterRef}>
                <button 
                  className="btn btn-outline-secondary btn-sm dropdown-toggle" 
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <i className="fas fa-filter me-1"></i> Filter {filter !== 'all' && `(${filter})`}
                </button>
                {showFilterDropdown && (
                  <ul className="dropdown-menu show" style={{ display: 'block', position: 'absolute', right: 0, top: '100%', marginTop: '5px' }}>
                    <li><button className="dropdown-item" onClick={() => { handleFilterClick('all'); setShowFilterDropdown(false); }}>All Sources</button></li>
                    <li><button className="dropdown-item" onClick={() => { handleFilterClick('ads'); setShowFilterDropdown(false); }}>Ads Only</button></li>
                    <li><button className="dropdown-item" onClick={() => { handleFilterClick('website'); setShowFilterDropdown(false); }}>Website</button></li>
                    <li><button className="dropdown-item" onClick={() => { handleFilterClick('facebook'); setShowFilterDropdown(false); }}>Facebook</button></li>
                    <li><button className="dropdown-item" onClick={() => { handleFilterClick('google'); setShowFilterDropdown(false); }}>Google</button></li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="p-4">
            {currentView === 'dashboard' && (
              <>
                {renderDashboard()}
                <div className="mt-4">
                  <h5 className="mb-3">Leads</h5>
                  {renderLeadsList(filteredLeads.slice(0, 5))}
                </div>
              </>
            )}
            {currentView === 'all' && renderLeadsList(filteredLeads)}
            {currentView === 'analytics' && renderAnalytics()}
          </div>
        </div>
      </div>

      {selectedLead && (
        <>
          <div className="overlay show" onClick={closePanel}></div>
          <div className="lead-details-panel open">
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5>Lead Details</h5>
                <button className="btn-close" onClick={closePanel}></button>
              </div>
              
              <div className="mb-4">
                <span className={`source-badge ${getSourceClass(selectedLead.source)} mb-2`}>
                  {selectedLead.sourceDisplay}
                </span>
                {selectedLead.campaign && (
                  <span className={`source-badge source-ads ms-2 mb-2`}>
                    {selectedLead.campaign}
                  </span>
                )}
              </div>

              <div className="mb-3">
                <label className="text-muted" style={{ fontSize: '12px' }}>Name</label>
                <p className="mb-1" style={{ fontSize: '18px', fontWeight: '600' }}>{selectedLead.name}</p>
              </div>

              <div className="row mb-3">
                <div className="col-6">
                  <label className="text-muted" style={{ fontSize: '12px' }}>Phone</label>
                  <p className="mb-0"><a href={`tel:${selectedLead.phone}`}>{selectedLead.phone}</a></p>
                </div>
                <div className="col-6">
                  <label className="text-muted" style={{ fontSize: '12px' }}>Email</label>
                  <p className="mb-0"><a href={`mailto:${selectedLead.email}`}>{selectedLead.email}</a></p>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted" style={{ fontSize: '12px' }}>Property Interest</label>
                <p className="mb-1">{selectedLead.property}</p>
              </div>

              <div className="row mb-3">
                <div className="col-6">
                  <label className="text-muted" style={{ fontSize: '12px' }}>Budget</label>
                  <p className="mb-0">{selectedLead.budget}</p>
                </div>
                <div className="col-6">
                  <label className="text-muted" style={{ fontSize: '12px' }}>Location</label>
                  <p className="mb-0">{selectedLead.location}</p>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted" style={{ fontSize: '12px' }}>Status</label>
                <select 
                  className="form-select mt-1"
                  value={selectedLead.status}
                  onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="text-muted" style={{ fontSize: '12px' }}>Notes</label>
                <p className="mb-0">{selectedLead.notes}</p>
              </div>

              <div className="mb-4">
                <label className="text-muted" style={{ fontSize: '12px' }}>Lead Date</label>
                <p className="mb-0">{selectedLead.date}</p>
              </div>

              <div className="d-grid gap-2">
                <button className="btn btn-primary" onClick={() => window.open(`tel:${selectedLead.phone}`)}>
                  <i className="fas fa-phone me-2"></i>Call Now
                </button>
                <button className="btn btn-outline-primary" onClick={() => window.open(`mailto:${selectedLead.email}`)}>
                  <i className="fas fa-envelope me-2"></i>Send Email
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
