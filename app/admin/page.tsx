"use client";

import { useAuth } from "@/app/auth-context";
import { getAllUsers, getAdminOverview, getUserDetail, impersonateUser, getUsageStats } from "@/managers/userManager";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────
interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  has_used_free_trial: boolean;
  has_used_free_credits: boolean;
  subscription_name: string | null;
  subscription_price: number | null;
  subscription_type: string | null;
  subscription_credits: number | null;
  subscription_active: boolean;
  credits_remaining: number;
  total_requests: number;
  total_api_cost: number;
  total_credits_used: number;
}

interface Bucket {
  requests: number;
  input_tokens: number;
  output_tokens: number;
  credits: number;
  api_cost: number;
}

interface AgentInfo {
  name: string;
  model: string;
  type: string;
}

interface UsageUserInfo {
  first_name: string;
  last_name: string;
  email: string;
  subscription_name: string | null;
  subscription_price: number | null;
  subscription_type: string | null;
  subscription_active: boolean;
}

interface UsageData {
  totals: { totalApiCost: number; totalCredits: number; totalRequests: number };
  byService: Record<string, Bucket>;
  byModel: Record<string, Bucket>;
  byUser: Record<string, Bucket>;
  byAgent: Record<string, Bucket>;
  byOperation: Record<string, Bucket>;
  agents: Record<string, AgentInfo>;
  users: Record<string, UsageUserInfo>;
}

interface UserDetailData {
  user: AdminUser & { subscription_name: string | null; subscription_price: number | null; subscription_type: string | null; utm_data?: Record<string, string>; created_at?: string };
  subscription: { is_active: boolean; credits: number; subscription_id: string; customer_id: string } | null;
  conversations: { id: string; name: string; agent_id: string; agent_name: string | null; last_activity: string; message_count: number }[];
  usage: { totals: { totalApiCost: number; totalCredits: number; totalRequests: number; totalInputTokens: number; totalOutputTokens: number }; byService: Record<string, Bucket>; byOperation: Record<string, Bucket>; byModel: Record<string, Bucket>; byAgent: Record<string, Bucket>; recentActivity: { service: string; model: string; operation_type: string; credits_deducted: number; api_cost_usd: number; created_at: string; agent_id: string | null }[] } | null;
  agents: Record<string, { name: string; model: string }>;
}

// ── Helpers ────────────────────────────────────────────
const REVENUE_PER_CREDIT = 0.74 / 1_000_000;

const fmt = {
  cost: (usd: number) => `$${usd.toFixed(4)}`,
  costShort: (usd: number) => usd >= 1 ? `$${usd.toFixed(2)}` : `$${usd.toFixed(4)}`,
  credits: (c: number) => {
    if (c >= 1_000_000) return `${(c / 1_000_000).toFixed(1)}M`;
    if (c >= 1_000) return `${(c / 1_000).toFixed(1)}K`;
    return c.toString();
  },
  tokens: (t: number) => {
    if (t >= 1_000_000) return `${(t / 1_000_000).toFixed(2)}M`;
    if (t >= 1_000) return `${(t / 1_000).toFixed(1)}K`;
    return t.toString();
  },
  price: (dollars: number | null, type: string | null) => {
    if (dollars == null) return "—";
    return `$${Number(dollars).toFixed(2)}/${type === "year" ? "yr" : "mo"}`;
  },
  pct: (n: number) => `${n.toFixed(1)}%`,
};

type UserStatus = "paying" | "trial" | "churned" | "free";

function getUserStatus(u: AdminUser): UserStatus {
  if (u.subscription_active) return "paying";
  if (u.subscription_name || u.subscription_price) return "churned";
  return "free";
}

const statusConfig: Record<UserStatus, { label: string; color: string }> = {
  paying: { label: "Paying", color: "bg-green-500/20 text-green-400" },
  trial: { label: "Trial", color: "bg-blue-500/20 text-blue-400" },
  churned: { label: "Churned", color: "bg-red-500/20 text-red-400" },
  free: { label: "Free", color: "bg-zinc-700/50 text-white/40" },
};

// ── Sort helpers ───────────────────────────────────────
type SortDir = "asc" | "desc";
type UserSortKey = "name" | "email" | "status" | "plan" | "credits_remaining" | "role" | "price" | "api_cost" | "requests";

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => (
  <span className={`inline-block ml-1 text-[10px] ${active ? "text-purple-400" : "text-white/20"}`}>
    {active ? (dir === "asc" ? "\u25B2" : "\u25BC") : "\u25BC"}
  </span>
);

const SortTh = ({ label, sortKey: sk, currentKey, dir, onClick, align = "left" }: {
  label: string; sortKey: UserSortKey; currentKey: UserSortKey; dir: SortDir;
  onClick: (k: UserSortKey) => void; align?: "left" | "right";
}) => (
  <th
    className={`${align === "right" ? "text-right" : "text-left"} px-5 py-3 text-xs font-medium text-white/50 uppercase cursor-pointer select-none hover:text-white/70 whitespace-nowrap`}
    onClick={() => onClick(sk)}
  >
    {label}<SortIcon active={currentKey === sk} dir={dir} />
  </th>
);

// ── Stat Card ──────────────────────────────────────────
const Card = ({ label, value, sub, color = "text-white" }: { label: string; value: string; sub?: string; color?: string }) => (
  <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5">
    <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
  </div>
);

// ── Component ──────────────────────────────────────────
type Tab = "overview" | "users" | "agents" | "costs";

export default function AdminPage() {
  const { user, impersonate } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageLoading, setUsageLoading] = useState(true);
  const [error, setError] = useState("");
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [overview, setOverview] = useState<{ total: number; paying: number; churned: number; free: number; mrr: number } | null>(null);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [sortKey, setSortKey] = useState<UserSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const PAGE_SIZE = 50;
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // User detail panel
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "owner") { router.push("/chat"); return; }
    if (user) { fetchOverview(); fetchUsers(1); fetchUsageStats(); }
  }, [user]);

  // Re-fetch when filters or sort change
  useEffect(() => {
    if (user) fetchUsers(1);
  }, [filterRole, filterStatus, sortKey, sortDir]);

  const fetchUsers = async (page: number, search?: string) => {
    try {
      setLoading(true);
      const result = await getAllUsers({
        page,
        limit: PAGE_SIZE,
        search: search ?? searchQuery,
        role: filterRole,
        status: filterStatus,
        sortBy: sortKey,
        sortDir,
      });
      if (result) {
        setUsers(result.response || []);
        if (result.pagination) {
          setCurrentPage(result.pagination.page);
          setTotalPages(result.pagination.totalPages);
          setTotalUsers(result.pagination.total);
        }
      }
    } catch { setError("Failed to load users"); }
    finally { setLoading(false); }
  };

  const openUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setDetailLoading(true);
    try {
      const data = await getUserDetail(userId);
      if (data) setUserDetail(data);
    } catch (err) { console.error("Failed to load user detail", err); }
    finally { setDetailLoading(false); }
  };

  const closeUserDetail = () => {
    setSelectedUserId(null);
    setUserDetail(null);
  };

  const fetchOverview = async () => {
    try {
      const data = await getAdminOverview();
      if (data) setOverview(data);
    } catch (err) { console.error("Failed to load overview", err); }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchUsers(1, value);
    }, 300);
  };

  const fetchUsageStats = async (from?: string, to?: string) => {
    try { setUsageLoading(true); setUsageData((await getUsageStats(from, to)) || null); }
    catch (err) { console.error("Failed to load usage stats", err); }
    finally { setUsageLoading(false); }
  };

  const handleSort = (key: UserSortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "name" || key === "email" ? "asc" : "desc"); }
  };

  const handleImpersonate = async (targetUserId: string) => {
    try {
      setImpersonating(targetUserId);
      const token = await impersonateUser(targetUserId);
      if (token) { await impersonate(token); router.push("/chat"); }
    } catch { setError("Failed to impersonate user"); setImpersonating(null); }
  };

  // ── Derived data ─────────────────────────────────────
  const planNames = useMemo(() => Array.from(new Set(users.map(u => u.subscription_name).filter(Boolean))) as string[], [users]);

  // Overview stats come from dedicated endpoint (all users, not paginated)

  // Users come pre-sorted from the backend

  // Agent rows
  const agentRows = useMemo(() => {
    if (!usageData) return [];
    return Object.entries(usageData.byAgent)
      .map(([agentId, stats]) => {
        const info = usageData.agents[agentId];
        return { agentId, name: info?.name || agentId.slice(0, 8), model: info?.model || "gpt-5.1 (default)", type: info?.type || "—", ...stats };
      })
      .sort((a, b) => b.requests - a.requests);
  }, [usageData]);

  // Operation rows
  const operationRows = useMemo(() => {
    if (!usageData) return [];
    return Object.entries(usageData.byOperation)
      .map(([op, stats]) => ({ operation: op, ...stats }))
      .sort((a, b) => b.requests - a.requests);
  }, [usageData]);

  if (!user || user.role !== "owner") return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "agents", label: "Agents" },
    { key: "costs", label: "Costs & Models" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-zinc-900/50 p-1 rounded-xl w-fit border border-white/10">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/5"}`}
          >{t.label}</button>
        ))}
      </div>

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {activeTab === "overview" && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            <Card label="Total Users" value={overview ? overview.total.toLocaleString() : "—"} color="text-white" />
            <Card label="Paying" value={overview ? overview.paying.toLocaleString() : "—"} color="text-green-400" />
            <Card label="Churned" value={overview ? overview.churned.toLocaleString() : "—"} color="text-red-400" />
            <Card label="Free" value={overview ? overview.free.toLocaleString() : "—"} color="text-white/60" />
            <Card label="MRR" value={overview ? `$${overview.mrr.toFixed(2)}` : "—"} color="text-green-400" sub="Monthly recurring" />
            <Card label="API Cost" value={usageData ? fmt.costShort(usageData.totals.totalApiCost) : "—"} color="text-red-400" sub={usageData ? `${usageData.totals.totalRequests.toLocaleString()} requests` : ""} />
          </div>

          {/* Date filter for usage data */}
          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div>
              <label className="block text-xs text-white/40 mb-1">From</label>
              <input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))}
                className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">To</label>
              <input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))}
                className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
            </div>
            <button onClick={() => fetchUsageStats(dateRange.from || undefined, dateRange.to || undefined)}
              className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 text-sm font-medium">Filter</button>
            <button onClick={() => { setDateRange({ from: "", to: "" }); fetchUsageStats(); }}
              className="px-4 py-2 rounded-lg text-white/40 hover:text-white/60 text-sm">Clear</button>
          </div>

          {/* Feature breakdown */}
          {usageData && operationRows.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-white mb-3">Feature Breakdown</h2>
              <div className="grid gap-3 mb-8" style={{ gridTemplateColumns: `repeat(${Math.min(operationRows.length, 6)}, 1fr)` }}>
                {operationRows.map(op => (
                  <div key={op.operation} className="bg-zinc-900/50 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-white/40 capitalize mb-1">{op.operation.replace(/_/g, " ")}</p>
                    <p className="text-xl font-bold text-white">{op.requests.toLocaleString()}</p>
                    <p className="text-xs text-white/30">{fmt.credits(op.credits)} credits</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Top agents */}
          {agentRows.length > 0 && (
            <>
              <h2 className="text-lg font-semibold text-white mb-3">Top Agents</h2>
              <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">Agent</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">Model</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Requests</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">API Cost</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentRows.slice(0, 10).map(a => (
                        <tr key={a.agentId} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-5 py-3 text-sm text-white font-medium">{a.name}</td>
                          <td className="px-5 py-3 text-sm text-white/50 font-mono text-xs">{a.model}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{a.requests.toLocaleString()}</td>
                          <td className="px-5 py-3 text-sm text-red-400 text-right">{fmt.cost(a.api_cost)}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.credits(a.credits)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {usageLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
          )}
        </>
      )}

      {/* ══════════ USERS TAB ══════════ */}
      {activeTab === "users" && (
        <>
          {/* Filters — server-side */}
          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div className="flex-1 min-w-[200px] max-w-md">
              <label className="block text-xs text-white/40 mb-1">Search</label>
              <input type="text" placeholder="Name or email..." value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Status</label>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-white text-sm focus:outline-none">
                <option value="all">All</option>
                <option value="paying">Paying</option>
                <option value="churned">Churned</option>
                <option value="free">Free</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Role</label>
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-white text-sm focus:outline-none">
                <option value="all">All</option>
                <option value="user">User</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <SortTh label="Name" sortKey="name" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                      <SortTh label="Email" sortKey="email" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                      <SortTh label="Status" sortKey="status" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                      <SortTh label="Plan" sortKey="plan" currentKey={sortKey} dir={sortDir} onClick={handleSort} />
                      <SortTh label="Credits Left" sortKey="credits_remaining" currentKey={sortKey} dir={sortDir} onClick={handleSort} align="right" />
                      <SortTh label="Requests" sortKey="requests" currentKey={sortKey} dir={sortDir} onClick={handleSort} align="right" />
                      <SortTh label="API Cost" sortKey="api_cost" currentKey={sortKey} dir={sortDir} onClick={handleSort} align="right" />
                      <th className="text-right px-5 py-3 text-xs font-medium text-white/50 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const status = getUserStatus(u);
                      const sc = statusConfig[status];
                      return (
                        <tr key={u.id} onClick={() => openUserDetail(u.id)} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-medium text-xs shrink-0">
                                {(u.first_name || "?").charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-white font-medium whitespace-nowrap">{u.first_name} {u.last_name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-white/60">{u.email}</td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${sc.color}`}>{sc.label}</span>
                          </td>
                          <td className="px-5 py-3 text-sm">
                            {u.subscription_name ? (
                              <div>
                                <span className="text-white/70 text-xs">{u.subscription_name}</span>
                                <div className="text-[11px] text-white/30">{fmt.price(u.subscription_price, u.subscription_type)}</div>
                              </div>
                            ) : <span className="text-white/20 text-xs">—</span>}
                          </td>
                          <td className="px-5 py-3 text-sm text-white/60 text-right">{fmt.credits(u.credits_remaining || 0)}</td>
                          <td className="px-5 py-3 text-sm text-white/60 text-right">{(u.total_requests || 0).toLocaleString()}</td>
                          <td className="px-5 py-3 text-sm text-right">
                            {u.total_api_cost > 0 ? <span className="text-red-400">{fmt.cost(u.total_api_cost)}</span> : <span className="text-white/20">$0</span>}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => handleImpersonate(u.id)}
                              disabled={u.id === user.id || impersonating === u.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                u.id === user.id ? "bg-zinc-700/30 text-white/30 cursor-not-allowed"
                                : impersonating === u.id ? "bg-purple-500/20 text-purple-400 cursor-wait"
                                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                              }`}
                            >{impersonating === u.id ? "..." : "Login as"}</button>
                          </td>
                        </tr>
                      );
                    })}
                    {users.length === 0 && (
                      <tr><td colSpan={8} className="px-5 py-12 text-center text-white/40 text-sm">{searchQuery ? "No users match" : "No users"}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-white/30">
                  {users.length > 0
                    ? `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, totalUsers)} of ${totalUsers.toLocaleString()} users`
                    : "0 users"}
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button disabled={currentPage <= 1} onClick={() => fetchUsers(currentPage - 1)}
                      className="px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 7) {
                        page = i + 1;
                      } else if (currentPage <= 4) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        page = totalPages - 6 + i;
                      } else {
                        page = currentPage - 3 + i;
                      }
                      return (
                        <button key={page} onClick={() => fetchUsers(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                            page === currentPage
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "text-white/50 hover:text-white hover:bg-white/5"
                          }`}
                        >{page}</button>
                      );
                    })}
                    <button disabled={currentPage >= totalPages} onClick={() => fetchUsers(currentPage + 1)}
                      className="px-3 py-1 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════ AGENTS TAB ══════════ */}
      {activeTab === "agents" && (
        <>
          {usageLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
          ) : agentRows.length > 0 ? (
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">Agent</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">Type</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">Model</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Requests</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Input Tokens</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Output Tokens</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Credits</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">API Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentRows.map(a => (
                      <tr key={a.agentId} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-5 py-3 text-sm text-white font-medium">{a.name}</td>
                        <td className="px-5 py-3 text-sm text-white/50 capitalize">{a.type}</td>
                        <td className="px-5 py-3 text-xs text-white/50 font-mono">{a.model}</td>
                        <td className="px-5 py-3 text-sm text-white/70 text-right">{a.requests.toLocaleString()}</td>
                        <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.tokens(a.input_tokens)}</td>
                        <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.tokens(a.output_tokens)}</td>
                        <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.credits(a.credits)}</td>
                        <td className="px-5 py-3 text-sm text-red-400 text-right">{fmt.cost(a.api_cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-white/40">No agent usage data yet</div>
          )}
        </>
      )}

      {/* ══════════ COSTS & MODELS TAB ══════════ */}
      {activeTab === "costs" && (
        <>
          {/* Date filter */}
          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div>
              <label className="block text-xs text-white/40 mb-1">From</label>
              <input type="date" value={dateRange.from} onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))}
                className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">To</label>
              <input type="date" value={dateRange.to} onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))}
                className="px-3 py-2 rounded-lg bg-zinc-800/50 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
            </div>
            <button onClick={() => fetchUsageStats(dateRange.from || undefined, dateRange.to || undefined)}
              className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 text-sm font-medium">Filter</button>
            <button onClick={() => { setDateRange({ from: "", to: "" }); fetchUsageStats(); }}
              className="px-4 py-2 rounded-lg text-white/40 hover:text-white/60 text-sm">Clear</button>
          </div>

          {usageLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
          ) : usageData ? (
            <>
              {/* Overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <Card label="Total API Cost" value={fmt.costShort(usageData.totals.totalApiCost)} color="text-red-400" />
                <Card label="Credits Revenue" value={fmt.costShort(usageData.totals.totalCredits * REVENUE_PER_CREDIT)} color="text-green-400" />
                <Card label="Margin" color="text-white"
                  value={usageData.totals.totalApiCost > 0 && usageData.totals.totalCredits > 0
                    ? fmt.pct(((usageData.totals.totalCredits * REVENUE_PER_CREDIT - usageData.totals.totalApiCost) / (usageData.totals.totalCredits * REVENUE_PER_CREDIT)) * 100)
                    : "N/A"} />
                <Card label="Total Requests" value={usageData.totals.totalRequests.toLocaleString()} color="text-purple-400" />
              </div>

              {/* By Service */}
              <h2 className="text-lg font-semibold text-white mb-3">By Service</h2>
              <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">Service</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Requests</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Input</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Output</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Credits</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">API Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(usageData.byService).sort(([,a],[,b]) => b.api_cost - a.api_cost).map(([svc, s]) => (
                        <tr key={svc} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-5 py-3 text-sm text-white font-medium capitalize">{svc}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{s.requests.toLocaleString()}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.tokens(s.input_tokens)}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.tokens(s.output_tokens)}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.credits(s.credits)}</td>
                          <td className="px-5 py-3 text-sm text-red-400 text-right">{fmt.cost(s.api_cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* By Model */}
              <h2 className="text-lg font-semibold text-white mb-3">By Model</h2>
              <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">Model</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Requests</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Input</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Output</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Credits</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">API Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(usageData.byModel).sort(([,a],[,b]) => b.api_cost - a.api_cost).map(([model, s]) => (
                        <tr key={model} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-5 py-3 text-sm text-white font-medium font-mono">{model}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{s.requests.toLocaleString()}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.tokens(s.input_tokens)}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.tokens(s.output_tokens)}</td>
                          <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.credits(s.credits)}</td>
                          <td className="px-5 py-3 text-sm text-red-400 text-right">{fmt.cost(s.api_cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Per-user profit */}
              <h2 className="text-lg font-semibold text-white mb-3">Profit by User</h2>
              <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">User</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">Email</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-white/40 uppercase">Plan</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Sub Price</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">API Cost</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-white/40 uppercase">Net Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(usageData.byUser)
                        .map(([uid, stats]) => {
                          const u = usageData.users?.[uid];
                          const subPrice = u?.subscription_price ?? null;
                          const subType = u?.subscription_type ?? null;
                          const monthlyRev = subPrice != null ? Number(subPrice) / (subType === "year" ? 12 : 1) : 0;
                          return { uid, name: u ? `${u.first_name} ${u.last_name}` : uid.slice(0,8), email: u?.email || "", subName: u?.subscription_name, subPrice, subType, monthlyRev, apiCost: stats.api_cost, netProfit: monthlyRev - stats.api_cost };
                        })
                        .sort((a, b) => b.apiCost - a.apiCost)
                        .map(r => (
                          <tr key={r.uid} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-5 py-3">
                              <div className="text-sm text-white font-medium">{r.name}</div>
                            </td>
                            <td className="px-5 py-3 text-sm text-white/50">{r.email}</td>
                            <td className="px-5 py-3 text-xs text-white/50">{r.subName || "—"}</td>
                            <td className="px-5 py-3 text-sm text-white/70 text-right">{fmt.price(r.subPrice, r.subType)}</td>
                            <td className="px-5 py-3 text-sm text-red-400 text-right">{fmt.cost(r.apiCost)}</td>
                            <td className="px-5 py-3 text-sm text-right font-medium">
                              <span className={r.netProfit >= 0 ? "text-green-400" : "text-red-400"}>
                                {r.monthlyRev > 0 || r.apiCost > 0 ? `${r.netProfit >= 0 ? "+" : ""}$${r.netProfit.toFixed(4)}` : "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-white/40">No usage data available</div>
          )}
        </>
      )}
      {/* ══════════ USER DETAIL PANEL ══════════ */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeUserDetail} />
          <div className="relative w-full max-w-2xl bg-zinc-900 border-l border-white/10 overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-zinc-900/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">User Profile</h2>
              <button onClick={closeUserDetail} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
              </div>
            ) : userDetail ? (
              <div className="p-6 space-y-5">
                {/* ── Profile header ── */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                    {(userDetail.user.first_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{userDetail.user.first_name} {userDetail.user.last_name}</h3>
                    <p className="text-sm text-white/50">{userDetail.user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusConfig[getUserStatus(userDetail.user as AdminUser)].color}`}>
                        {statusConfig[getUserStatus(userDetail.user as AdminUser)].label}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${userDetail.user.role === "owner" ? "bg-purple-500/20 text-purple-400" : "bg-zinc-700/50 text-white/40"}`}>
                        {userDetail.user.role}
                      </span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleImpersonate(userDetail.user.id); }}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-all">
                    Login as
                  </button>
                </div>

                {/* ── Subscription ── */}
                <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                  <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Subscription</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-[11px] text-white/30">Plan</p><p className="text-sm text-white font-medium">{userDetail.user.subscription_name || "None"}</p></div>
                    <div><p className="text-[11px] text-white/30">Price</p><p className="text-sm text-white font-medium">{fmt.price(userDetail.user.subscription_price, userDetail.user.subscription_type)}</p></div>
                    <div><p className="text-[11px] text-white/30">Status</p><p className={`text-sm font-medium ${userDetail.subscription?.is_active ? "text-green-400" : "text-red-400"}`}>{userDetail.subscription?.is_active ? "Active" : "Inactive"}</p></div>
                    <div><p className="text-[11px] text-white/30">Credits Left</p><p className="text-sm text-white font-medium">{fmt.credits(userDetail.subscription?.credits || 0)}</p></div>
                  </div>
                </div>

                {/* ── Usage totals ── */}
                {userDetail.usage && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Usage Overview</h4>
                    <div className="grid grid-cols-3 gap-3 mb-1">
                      <div><p className="text-[11px] text-white/30">Requests</p><p className="text-lg font-bold text-white">{userDetail.usage.totals.totalRequests.toLocaleString()}</p></div>
                      <div><p className="text-[11px] text-white/30">Credits Used</p><p className="text-lg font-bold text-white">{fmt.credits(userDetail.usage.totals.totalCredits)}</p></div>
                      <div><p className="text-[11px] text-white/30">API Cost</p><p className="text-lg font-bold text-red-400">{fmt.cost(userDetail.usage.totals.totalApiCost)}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/5">
                      <div><p className="text-[11px] text-white/30">Input Tokens</p><p className="text-sm text-white/70">{fmt.tokens(userDetail.usage.totals.totalInputTokens || 0)}</p></div>
                      <div><p className="text-[11px] text-white/30">Output Tokens</p><p className="text-sm text-white/70">{fmt.tokens(userDetail.usage.totals.totalOutputTokens || 0)}</p></div>
                    </div>
                  </div>
                )}

                {/* ── By Service ── */}
                {userDetail.usage && Object.keys(userDetail.usage.byService).length > 0 && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">By Service</h4>
                    <div className="space-y-2">
                      {Object.entries(userDetail.usage.byService).sort(([,a],[,b]) => b.requests - a.requests).map(([svc, s]) => (
                        <div key={svc} className="flex items-center justify-between">
                          <span className="text-sm text-white/70 capitalize">{svc}</span>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-white/40">{s.requests} req</span>
                            <span className="text-white/40">{fmt.credits(s.credits)} cr</span>
                            <span className="text-red-400">{fmt.cost(s.api_cost)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── By Operation (feature) ── */}
                {userDetail.usage && Object.keys(userDetail.usage.byOperation).length > 0 && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">By Feature</h4>
                    <div className="space-y-2">
                      {Object.entries(userDetail.usage.byOperation).sort(([,a],[,b]) => b.requests - a.requests).map(([op, s]) => (
                        <div key={op} className="flex items-center justify-between">
                          <span className="text-sm text-white/70 capitalize">{op.replace(/_/g, " ")}</span>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-white/40">{s.requests} req</span>
                            <span className="text-white/40">{fmt.credits(s.credits)} cr</span>
                            <span className="text-red-400">{fmt.cost(s.api_cost)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── By Model ── */}
                {userDetail.usage && Object.keys(userDetail.usage.byModel).length > 0 && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">By Model</h4>
                    <div className="space-y-2">
                      {Object.entries(userDetail.usage.byModel).sort(([,a],[,b]) => b.api_cost - a.api_cost).map(([model, s]) => (
                        <div key={model} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/70 font-mono">{model}</p>
                            <p className="text-[11px] text-white/25">{fmt.tokens(s.input_tokens)} in / {fmt.tokens(s.output_tokens)} out</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/40">{s.requests} req &middot; {fmt.credits(s.credits)} cr</p>
                            <p className="text-xs text-red-400">{fmt.cost(s.api_cost)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Agents Used ── */}
                {userDetail.usage && Object.keys(userDetail.usage.byAgent).length > 0 && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Agents Used</h4>
                    <div className="space-y-2">
                      {Object.entries(userDetail.usage.byAgent).sort(([,a],[,b]) => b.requests - a.requests).map(([agentId, s]) => {
                        const info = userDetail.agents[agentId];
                        return (
                          <div key={agentId} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white font-medium">{info?.name || agentId.slice(0,8)}</p>
                              <p className="text-[11px] text-white/25">{info?.model || "—"} &middot; {fmt.tokens(s.input_tokens)} in / {fmt.tokens(s.output_tokens)} out</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-white/40">{s.requests} req &middot; {fmt.credits(s.credits)} cr</p>
                              <p className="text-xs text-red-400">{fmt.cost(s.api_cost)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Recent Conversations ── */}
                {userDetail.conversations.length > 0 && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Conversations ({userDetail.conversations.length})</h4>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {userDetail.conversations.map(c => (
                        <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{c.name || "Untitled"}</p>
                            <p className="text-[11px] text-white/25">{c.agent_name || "—"} &middot; {c.message_count} msgs</p>
                          </div>
                          <span className="text-[11px] text-white/20 ml-3 shrink-0">{c.last_activity ? new Date(c.last_activity).toLocaleDateString() : "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Activity Log ── */}
                {userDetail.usage && userDetail.usage.recentActivity.length > 0 && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Recent Activity</h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {userDetail.usage.recentActivity.map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white/50 capitalize">{r.operation_type.replace(/_/g, " ")}</span>
                            <span className="text-white/20 font-mono">{r.model}</span>
                            {r.agent_id && userDetail.agents[r.agent_id] && (
                              <span className="text-purple-400/50">{userDetail.agents[r.agent_id].name}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {r.credits_deducted > 0 && <span className="text-white/30">{fmt.credits(r.credits_deducted)} cr</span>}
                            {r.api_cost_usd > 0 && <span className="text-red-400/60">{fmt.cost(r.api_cost_usd)}</span>}
                            <span className="text-white/15">{new Date(r.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── UTM ── */}
                {userDetail.user.utm_data && Object.keys(userDetail.user.utm_data).length > 0 && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 border border-white/5">
                    <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">Attribution (UTM)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(userDetail.user.utm_data).map(([k, v]) => (
                        <div key={k}><p className="text-[11px] text-white/30">{k}</p><p className="text-sm text-white/60">{v || "—"}</p></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-white/40">Failed to load user details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
