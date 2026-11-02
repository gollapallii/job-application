import { useEffect, useMemo, useState } from "react";

import { BriefcaseBusiness, Plus, Search, Sparkles, Trash2, Pencil, ExternalLink, RefreshCw } from "lucide-react";

const API = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const STATUSES = ["Applied", "Assessment", "Interview", "Offer", "Rejected"];
const today = new Date().toISOString().slice(0, 10);
const blankForm = () => ({ company: "", role: "", job_url: "", status: "Applied", applied_date: today, notes: "" });

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || JSON.stringify(body) || `Request failed (${response.status})`);
  return body;
}

function App() {
  const [message, setMessage] = useState("Connecting...");
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(blankForm());
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [aiRole, setAiRole] = useState("");
  const [aiDraft, setAiDraft] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  

  async function loadApplications() {
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (filter !== "All") params.set("status", filter);
      const query = params.toString();
      const data = await api(`/api/applications/${query ? `?${query}` : ""}`);
      setApplications(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(`Could not connect to the backend. Start Django and check VITE_API_BASE_URL. Details: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { loadApplications(); }, [search, filter]);
   useEffect(() => {
    fetch("http://127.0.0.1:8000/api/health/")
      .then((response) => {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
      })
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Connection failed"));
  }, []);

  const counts = useMemo(() => {
    const all = applications;
    return {
      total: all.length,
      applied: all.filter(x => x.status === "Applied").length,
      interview: all.filter(x => x.status === "Interview" || x.status === "Assessment").length,
      offers: all.filter(x => x.status === "Offer").length,
    };
  }, [applications]);

  function updateField(event) {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function submitApplication(event) {
    event.preventDefault();
    setError(""); setNotice("");
    try {
      const payload = { ...form };
      if (editingId) {
        await api(`/api/applications/${editingId}/`, { method: "PUT", body: JSON.stringify(payload) });
        setNotice("Application updated.");
      } else {
        await api("/api/applications/", { method: "POST", body: JSON.stringify(payload) });
        setNotice("Application added.");
      }
      setForm(blankForm()); setEditingId(null);
      await loadApplications();
    } catch (err) { setError(err.message); }
  }

  function editApplication(item) {
    setForm({ company: item.company, role: item.role, job_url: item.job_url || "", status: item.status, applied_date: item.applied_date, notes: item.notes || "" });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteApplication(id) {
    if (!window.confirm("Delete this application?")) return;
    try {
      await api(`/api/applications/${id}/`, { method: "DELETE" });
      setNotice("Application deleted.");
      await loadApplications();
    } catch (err) { setError(err.message); }
  }

  async function generateDraft(event) {
    event.preventDefault(); setAiBusy(true); setAiDraft(""); setError(""); setNotice("");
    try {
      const data = await api("/api/ai/cover-letter/", {
        method: "POST",
        body: JSON.stringify({ role: aiRole, job_description: jobDescription }),
      });
      setAiDraft(data.draft);
    } catch (err) { setError(err.message); }
    finally { setAiBusy(false); }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-icon"><BriefcaseBusiness size={20}/></span> ApplyTrack</a>
        <span className="topbar-label">YOUR CAREER, ORGANIZED</span>
      </header>

      <main className="main-content">
        <h1>Job Application Tracker</h1>
      <p>{message}</p>
        <section className="hero">
          <div>
            <p className="eyebrow">CAREER DASHBOARD</p>
            <h1>Keep your next move <span>in motion.</span></h1>
            <p className="hero-copy">One clear place to track applications, prepare for interviews, and follow up with confidence.</p>
          </div>
          <div className="hero-mark"><BriefcaseBusiness size={48}/></div>
        </section>

        <section className="stats-grid">
          <Stat label="Applications shown" value={counts.total} detail="Matching your current filters"/>
          <Stat label="Applied" value={counts.applied} detail="Waiting for a response"/>
          <Stat label="Interview / assessment" value={counts.interview} detail="Next steps in progress"/>
          <Stat label="Offers" value={counts.offers} detail="Celebrate the progress"/>
        </section>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success">{notice}</div>}

        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading">
              <div><p className="eyebrow">APPLICATION DETAILS</p><h2>{editingId ? "Edit application" : "Add an application"}</h2></div>
              {editingId && <button className="button ghost" onClick={() => { setEditingId(null); setForm(blankForm()); }}>Cancel edit</button>}
            </div>
            <form className="application-form" onSubmit={submitApplication}>
              <label>Company name *<input name="company" value={form.company} onChange={updateField} placeholder="e.g. Acme Technologies" required maxLength="120"/></label>
              <label>Job title *<input name="role" value={form.role} onChange={updateField} placeholder="e.g. Python Developer" required maxLength="120"/></label>
              <div className="form-row">
                <label>Status<select name="status" value={form.status} onChange={updateField}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
                <label>Applied date<input name="applied_date" type="date" value={form.applied_date} onChange={updateField} required/></label>
              </div>
              <label>Job posting URL<input name="job_url" type="url" value={form.job_url} onChange={updateField} placeholder="https://..."/></label>
              <label>Notes<textarea name="notes" value={form.notes} onChange={updateField} rows="3" placeholder="Recruiter name, follow-up date, interview notes…"/></label>
              <button className="button primary" type="submit"><Plus size={17}/>{editingId ? "Save changes" : "Add application"}</button>
            </form>
          </section>

          <section className="panel ai-panel">
            <div className="ai-heading"><span className="ai-icon"><Sparkles size={20}/></span><div><p className="eyebrow">AI CAREER ASSISTANT</p><h2>Cover-letter starter</h2></div></div>
            <p className="muted">Paste a job description to draft a short, tailored paragraph. Review it carefully and personalize it before using.</p>
            <form className="application-form" onSubmit={generateDraft}>
              <label>Target role<input value={aiRole} onChange={e => setAiRole(e.target.value)} placeholder="e.g. Junior Full Stack Developer"/></label>
              <label>Job description *<textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows="6" required placeholder="Paste the key responsibilities and skills…"/></label>
              <button className="button dark" type="submit" disabled={aiBusy || !jobDescription.trim()}><Sparkles size={16}/>{aiBusy ? "Generating…" : "Generate with Gemini"}</button>
            </form>
            {aiDraft && <div className="ai-result"><h3>Draft to review</h3><p>{aiDraft}</p><button className="button ghost" onClick={() => navigator.clipboard?.writeText(aiDraft)}>Copy draft</button></div>}
            <p className="tiny-note">Requires a Gemini API key configured on the backend. Do not enter private or sensitive information.</p>
          </section>
        </div>

        <section className="panel applications-panel">
          <div className="panel-heading list-heading">
            <div><p className="eyebrow">YOUR PIPELINE</p><h2>Job applications</h2></div>
            <button className="button ghost" onClick={loadApplications}><RefreshCw size={15}/> Refresh</button>
          </div>
          <div className="toolbar">
            <div className="searchbox"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company, role, notes…"/></div>
            <select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter by status"><option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
          </div>
          {busy ? <div className="empty-state">Loading applications…</div> : applications.length === 0 ? (
            <div className="empty-state"><span className="empty-icon"><BriefcaseBusiness size={24}/></span><h3>No applications found</h3><p>Add your first job application using the form above.</p></div>
          ) : (
            <div className="application-list">
              {applications.map(item => <article className="application-card" key={item.id}>
                <div className="company-avatar">{(item.company || "?").slice(0,1).toUpperCase()}</div>
                <div className="application-info"><h3>{item.role}</h3><p>{item.company} <span>·</span> Applied {item.applied_date}</p>{item.notes && <p className="notes">{item.notes}</p>}</div>
                <span className={`status status-${item.status.toLowerCase()}`}>{item.status}</span>
                <div className="card-actions">
                  {item.job_url && <a className="icon-button" href={item.job_url} target="_blank" rel="noreferrer" aria-label="Open job link"><ExternalLink size={16}/></a>}
                  <button className="icon-button" onClick={() => editApplication(item)} aria-label="Edit application"><Pencil size={16}/></button>
                  <button className="icon-button danger" onClick={() => deleteApplication(item.id)} aria-label="Delete application"><Trash2 size={16}/></button>
                </div>
              </article>)}
            </div>
          )}
        </section>
        <footer>Built to make the job search a little more organized. <span>ApplyTrack · Portfolio Project</span></footer>
      </main>
    </div>
  );
}

function Stat({ label, value, detail }) {
  return <div className="stat-card"><p>{label}</p><strong>{value}</strong><span>{detail}</span></div>;
}

export default App;
