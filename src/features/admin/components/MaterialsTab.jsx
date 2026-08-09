import { useState } from "react";
import { Folder, FolderOpen, FileText, Search, Filter, AlertTriangle, Trash2, Download, BarChart2, ShieldCheck, Upload, Eye, HardDrive, FolderCheck } from "lucide-react";

const MaterialsTab = ({ 
  materials, 
  subjects, 
  teachers, 
  onFlagMaterial, 
  onDeleteMaterial 
}) => {
  const [viewMode, setViewMode] = useState("folder");
  const [expandedFolders, setExpandedFolders] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("All");
  const [filterTeacher, setFilterTeacher] = useState("All");

  const toggleFolder = (subjectName) => {
    setExpandedFolders(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }));
  };

  const handleDownloadSim = (fileName) => {
    alert(`Starting download for: ${fileName}`);
  };

  // Stats
  const flaggedCount = materials.filter(m => m.flagged).length;
  const verifiedCount = materials.length - flaggedCount;

  // Filter materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "All" || m.subject === filterSubject;
    const matchesTeacher = filterTeacher === "All" || m.teacher === filterTeacher;
    return matchesSearch && matchesSubject && matchesTeacher;
  });

  // Group materials by subject
  const materialsBySubject = subjects.reduce((acc, sub) => {
    acc[sub.name] = materials.filter(m => m.subject === sub.name && m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return acc;
  }, {});

  // Upload stats
  const uploadStats = teachers.map(t => {
    const count = materials.filter(m => m.teacher === t.name).length;
    return { name: t.name, count };
  });

  const maxUploads = Math.max(...uploadStats.map(s => s.count), 1);

  // Subject colors
  const subjectColors = ["#2D6BFF", "#37C871", "#8b5cf6", "#f97316", "#ef4444"];

  return (
    <div className="tab-wrapper animate-fade-in">
      <div className="section-header-bar">
        <h2>Study Material Oversight</h2>
        <div className="toggle-tabs-group">
          <button 
            className={`toggle-tab-btn ${viewMode === "folder" ? "active" : ""}`}
            onClick={() => setViewMode("folder")}
          >
            <Folder size={14} style={{ marginRight: "6px" }} />
            Folder View
          </button>
          <button 
            className={`toggle-tab-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <FileText size={14} style={{ marginRight: "6px" }} />
            All Files Table
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards-grid" style={{ marginBottom: "24px" }}>
        <div className="summary-card">
          <div className="card-icon-wrapper blue">
            <FolderOpen size={24} />
          </div>
          <div className="card-info">
            <h3>{materials.length}</h3>
            <p>Total Materials</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-wrapper green">
            <ShieldCheck size={24} />
          </div>
          <div className="card-info">
            <h3>{verifiedCount}</h3>
            <p>Verified Files</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon-wrapper orange">
            <AlertTriangle size={24} />
          </div>
          <div className="card-info">
            <h3>{flaggedCount}</h3>
            <p>Flagged Materials</p>
          </div>
        </div>
      </div>

      <div className="materials-split-layout">
        <div className="materials-main-area">
          {/* Filters panel */}
          <div className="filters-panel">
            <div className="search-bar-wrapper">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search study materials by file name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-dropdowns">
              <div className="filter-group">
                <Filter size={14} className="filter-icon" />
                <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                  <option value="All">All Subjects</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <select value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
                  <option value="All">All Teachers</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Folder View Mode */}
          {viewMode === "folder" && (
            <div className="folder-structure-grid">
              {subjects.map((sub, sIdx) => {
                const items = materialsBySubject[sub.name] || [];
                const isExpanded = !!expandedFolders[sub.name];
                const color = subjectColors[sIdx % subjectColors.length];

                return (
                  <div className={`subject-folder-card ${isExpanded ? "open" : ""}`} key={sub.id}
                    style={{ borderTop: `3px solid ${color}` }}
                  >
                    <div className="folder-header" onClick={() => toggleFolder(sub.name)} style={{ cursor: "pointer" }}>
                      <div className="folder-title">
                        {isExpanded 
                          ? <FolderOpen size={24} style={{ color }} /> 
                          : <Folder size={24} style={{ color }} />
                        }
                        <h4>{sub.name}</h4>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="file-count-pill">{items.length} files</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="folder-contents animate-fade-in">
                        {items.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                            <FolderCheck size={32} style={{ marginBottom: "8px", opacity: 0.5 }} />
                            <p style={{ fontSize: "13px", fontStyle: "italic" }}>No materials uploaded for this subject.</p>
                          </div>
                        ) : (
                          <ul className="folder-file-list">
                            {items.map(file => (
                              <li key={file.id} className={`file-list-item ${file.flagged ? "flagged-file" : ""}`}>
                                <div className="file-item-left">
                                  <FileText size={16} style={{ color: file.flagged ? "#ef4444" : "#64748b" }} />
                                  <span className="file-name font-semibold">{file.title}</span>
                                  {file.flagged && (
                                    <span className="flagged-badge">
                                      <AlertTriangle size={10} />
                                      <span>Flagged</span>
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span className="badge-tag count" style={{ fontSize: "10px" }}>by {file.teacher}</span>
                                  <div className="file-actions">
                                    <button className="file-act-btn" onClick={() => handleDownloadSim(file.title)} title="Download file">
                                      <Download size={14} />
                                    </button>
                                    <button 
                                      className={`file-act-btn flag ${file.flagged ? "active" : ""}`}
                                      onClick={() => onFlagMaterial(file.id)} 
                                      title={file.flagged ? "Unflag material" : "Flag inappropriate material"}
                                    >
                                      <AlertTriangle size={14} />
                                    </button>
                                    <button className="file-act-btn delete" onClick={() => onDeleteMaterial(file.id)} title="Remove material">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* List View Table Mode */}
          {viewMode === "list" && (
            <div className="table-responsive-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>S.No</th>
                    <th>File Name</th>
                    <th>Subject</th>
                    <th>Uploaded By</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "48px 20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FileText size={28} color="#94a3b8" />
                          </div>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>No files found matching filters</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((file, idx) => (
                      <tr key={file.id} className={`hover-row ${file.flagged ? "table-row-flagged" : ""}`}>
                        <td style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>{idx + 1}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: file.flagged ? "#fef2f2" : "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <FileText size={16} style={{ color: file.flagged ? "#ef4444" : "#2D6BFF" }} />
                            </div>
                            <span className="font-semibold">{file.title}</span>
                          </div>
                        </td>
                        <td><span className="badge-tag subject">{file.subject}</span></td>
                        <td>{file.teacher}</td>
                        <td><span className="badge-tag count">PDF</span></td>
                        <td>
                          {file.flagged ? (
                            <span className="status-badge-pill" style={{ background: "#fef2f2", color: "#ef4444", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <AlertTriangle size={12} />
                              Flagged
                            </span>
                          ) : (
                            <span className="status-badge-pill active" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <ShieldCheck size={12} />
                              Verified
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons-cell" style={{ justifyContent: "center" }}>
                            <button className="action-btn view" title="Download" onClick={() => handleDownloadSim(file.title)}>
                              <Download size={16} />
                            </button>
                            <button 
                              className={`action-btn edit`} 
                              title={file.flagged ? "Unflag" : "Flag"} 
                              onClick={() => onFlagMaterial(file.id)}
                              style={file.flagged ? { color: "#ef4444", borderColor: "#fecaca", background: "#fef2f2" } : {}}
                            >
                              <AlertTriangle size={16} />
                            </button>
                            <button className="action-btn delete" title="Delete" onClick={() => onDeleteMaterial(file.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload statistics sidebar */}
        <aside className="materials-stats-sidebar">
          {/* Storage Overview */}
          <div className="stats-sidebar-card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "12px" }}>
              <HardDrive size={18} style={{ color: "#2D6BFF" }} />
              <h4 style={{ fontFamily: '"Sora", sans-serif', fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Storage Overview</h4>
            </div>
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ position: "relative", width: "80px", height: "80px", margin: "0 auto 12px" }}>
                <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#2D6BFF" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(materials.length / 20, 1))}
                    style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                </svg>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{materials.length}</span>
                </div>
              </div>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Total Files Uploaded</span>
            </div>
          </div>

          {/* Teacher Upload Stats */}
          <div className="stats-sidebar-card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "12px" }}>
              <BarChart2 size={18} style={{ color: "#2D6BFF" }} />
              <h4 style={{ fontFamily: '"Sora", sans-serif', fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Teacher Contributions</h4>
            </div>
            <div className="stats-list">
              {uploadStats.map((stat, idx) => (
                <div className="stats-item-bar" key={stat.name}>
                  <div className="stats-item-labels">
                    <span style={{ fontWeight: 600, fontSize: "13px", color: "#334155" }}>{stat.name}</span>
                    <span className="font-mono" style={{ fontSize: "12px", fontWeight: 700, color: "#2D6BFF" }}>{stat.count} files</span>
                  </div>
                  <div className="stats-bar-track">
                    <div className="stats-bar-fill" style={{ 
                      width: `${(stat.count / maxUploads) * 100}%`,
                      background: subjectColors[idx % subjectColors.length],
                      transition: "width 0.5s ease"
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject distributions */}
          <div className="stats-sidebar-card">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", borderBottom: "1.5px solid #f1f5f9", paddingBottom: "12px" }}>
              <Folder size={18} style={{ color: "#8b5cf6" }} />
              <h4 style={{ fontFamily: '"Sora", sans-serif', fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>By Subject</h4>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {subjects.map((s, idx) => {
                const count = materials.filter(m => m.subject === s.name).length;
                const pct = materials.length > 0 ? Math.round((count / materials.length) * 100) : 0;
                return (
                  <div key={s.id} style={{ background: "#fff", border: "1.5px solid #f1f5f9", borderRadius: "10px", padding: "10px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#334155" }}>{s.name}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: subjectColors[idx % subjectColors.length] }}>{count} files ({pct}%)</span>
                    </div>
                    <div className="stats-bar-track" style={{ height: "4px" }}>
                      <div className="stats-bar-fill" style={{ 
                        width: `${pct}%`, 
                        background: subjectColors[idx % subjectColors.length],
                        height: "100%"
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MaterialsTab;
