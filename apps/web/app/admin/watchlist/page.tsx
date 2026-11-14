'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
  EyeOff,
  Plus,
  Edit,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  getAdminWatchlist,
  toggleWatchlistListed,
  updateWatchlistProfile,
  createWatchlistProfile,
  recordEditorialMetric,
} from '@/lib/api/admin-client';
import { ConfirmDialog } from '@/components/chrome/confirm-dialog';
import { Avatar } from '@/components/rank/avatar';
import { FollowerCount } from '@/components/rank/follower-count';

export default function AdminWatchlistPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeScope, setActiveScope] = useState('');
  const [activeListedFilter, setActiveListedFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [pendingHide, setPendingHide] = useState<{
    id: string;
    username: string;
    next: boolean;
  } | null>(null);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // New profile form
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newCategory, setNewCategory] = useState('Creator');
  const [newCountry, setNewCountry] = useState('Global');
  const [newScope, setNewScope] = useState('global');

  // Edit profile form
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editEntityType, setEditEntityType] = useState('person');
  const [editScopes, setEditScopes] = useState<string[]>(['global']);
  const [editorialCount, setEditorialCount] = useState('');
  const [editorialNote, setEditorialNote] = useState('');

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const isListed = activeListedFilter === 'all' ? undefined : activeListedFilter === 'listed';

      const res = await getAdminWatchlist({
        limit: pageSize,
        offset: page * pageSize,
        q: searchQuery || undefined,
        scope: activeScope || undefined,
        isListed,
      });
      setProfiles(res.data);
      setTotal(res.meta.total);
    } catch {
      setProfiles([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on filters/page
  }, [activeScope, activeListedFilter, page, pageSize]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadProfiles();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 0;
  const canNext = (page + 1) * pageSize < total;

  const handleToggleListed = async (profile: any) => {
    const newStatus = !profile.isListed;
    if (profile.isListed && !newStatus) {
      setPendingHide({ id: profile.id, username: profile.igUsername, next: newStatus });
      return;
    }
    await applyListedToggle(profile.id, profile.igUsername, newStatus);
  };

  const applyListedToggle = async (id: string, username: string, newStatus: boolean) => {
    try {
      await toggleWatchlistListed(id, newStatus);
      setToastMessage(
        `Profile @${username} is now ${newStatus ? 'Listed on public leaderboards' : 'Hidden from public charts'}.`,
      );
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, isListed: newStatus } : p)));
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : 'Toggle action failed.');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWatchlistProfile({
        igUsername: newUsername,
        displayName: newDisplayName,
        category: newCategory,
        countryRegion: newCountry,
        scopes: [newScope],
      });
      setToastMessage(`Created and added @${newUsername} to watchlist.`);
      setIsAddOpen(false);
      setNewUsername('');
      setNewDisplayName('');
      loadProfiles();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : 'Add profile failed.');
    }
  };

  const handleOpenEdit = (profile: any) => {
    setSelectedProfile(profile);
    setEditDisplayName(profile.displayName);
    setEditCategory(profile.category || '');
    setEditCountry(profile.countryRegion || '');
    setEditEntityType(profile.entityType || 'person');
    setEditScopes(profile.scopes?.length ? profile.scopes : ['global']);
    setEditorialCount(
      profile.latestFollowerCount != null ? String(profile.latestFollowerCount) : '',
    );
    setEditorialNote('');
    setIsEditOpen(true);
  };

  const handleEditorialMetric = async () => {
    if (!selectedProfile) return;
    const followerCount = Number(editorialCount);
    if (!Number.isFinite(followerCount) || followerCount < 0) {
      setToastMessage('Enter a valid follower count for editorial metric.');
      return;
    }
    if (!editorialNote.trim()) {
      setToastMessage('Editorial metric requires a note.');
      return;
    }
    try {
      await recordEditorialMetric(selectedProfile.id, {
        followerCount,
        note: editorialNote.trim(),
      });
      setToastMessage(`Recorded editorial metric for @${selectedProfile.igUsername}.`);
      setEditorialNote('');
      loadProfiles();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : 'Editorial metric failed.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    try {
      await updateWatchlistProfile(selectedProfile.id, {
        displayName: editDisplayName,
        category: editCategory,
        countryRegion: editCountry,
        entityType: editEntityType,
        scopes: editScopes,
      });
      setToastMessage(`Updated profile @${selectedProfile.igUsername}.`);
      setIsEditOpen(false);
      loadProfiles();
    } catch (err: unknown) {
      setToastMessage(err instanceof Error ? err.message : 'Edit profile failed.');
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!pendingHide}
        title="Hide from public charts?"
        body={`@${pendingHide?.username} will stay in the watchlist but drop off Global/India people charts after the next rebuild.`}
        confirmLabel="Hide"
        onCancel={() => setPendingHide(null)}
        onConfirm={() => {
          if (pendingHide) {
            void applyListedToggle(pendingHide.id, pendingHide.username, pendingHide.next);
          }
          setPendingHide(null);
        }}
      />
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage('')}
            className="font-bold text-emerald-400 hover:text-emerald-200 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--brand-slate)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Watchlist Management
          </h1>
          <p className="text-xs text-[var(--neutral-400)] mt-1.5 leading-relaxed">
            Browse, categorize, hide/unhide, and add creators to the monitored discovery universe.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-display font-bold bg-[var(--brand-accent)] text-[var(--brand-deep)] hover:opacity-95 transition-all shadow-[0_2px_12px_rgba(212,168,67,0.2)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Creator</span>
          </button>

          <button
            onClick={loadProfiles}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 text-[var(--neutral-200)] border border-[var(--neutral-700)]/60 transition-all cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[var(--brand-accent)]' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] shadow-md">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[var(--neutral-500)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search handle or display name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[var(--brand-deep)] border border-[var(--brand-slate)] rounded-xl text-white placeholder:text-[var(--neutral-500)] font-mono focus:outline-none focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Scope Filter */}
          <div className="inline-flex rounded-xl bg-[var(--brand-deep)] p-1 border border-[var(--brand-slate)]">
            <button
              onClick={() => {
                setActiveScope('');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeScope === ''
                  ? 'bg-[var(--brand-slate)] text-[#00d26a] shadow-sm'
                  : 'text-[var(--neutral-400)] hover:text-white'
              }`}
            >
              All Scopes
            </button>
            <button
              onClick={() => {
                setActiveScope('global');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeScope === 'global'
                  ? 'bg-[var(--brand-slate)] text-[#00d26a] shadow-sm'
                  : 'text-[var(--neutral-400)] hover:text-white'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => {
                setActiveScope('india');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeScope === 'india'
                  ? 'bg-[var(--brand-slate)] text-[#00d26a] shadow-sm'
                  : 'text-[var(--neutral-400)] hover:text-white'
              }`}
            >
              India
            </button>
          </div>

          {/* Listed / Hidden Filter */}
          <div className="inline-flex rounded-xl bg-[var(--brand-deep)] p-1 border border-[var(--brand-slate)]">
            <button
              onClick={() => {
                setActiveListedFilter('all');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeListedFilter === 'all'
                  ? 'bg-[var(--brand-slate)] text-[#00d26a] shadow-sm'
                  : 'text-[var(--neutral-400)] hover:text-white'
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => {
                setActiveListedFilter('listed');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeListedFilter === 'listed'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm'
                  : 'text-[var(--neutral-400)] hover:text-white'
              }`}
            >
              Listed
            </button>
            <button
              onClick={() => {
                setActiveListedFilter('hidden');
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                activeListedFilter === 'hidden'
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60 shadow-sm'
                  : 'text-[var(--neutral-400)] hover:text-white'
              }`}
            >
              Hidden
            </button>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-[var(--neutral-400)] font-mono">
          {total === 0
            ? 'No profiles'
            : `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} of ${total}`}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 text-[var(--neutral-400)]">
            <span>Page size</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1.5 rounded-lg bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white cursor-pointer"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!canPrev || isLoading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1.5 rounded-lg bg-[var(--brand-slate)] text-white disabled:opacity-40 cursor-pointer"
          >
            Prev
          </button>
          <span className="font-mono text-[var(--neutral-300)] px-1">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            disabled={!canNext || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg bg-[var(--brand-slate)] text-white disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[var(--brand-navy)] border border-[var(--brand-slate)] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--brand-slate)] bg-[var(--brand-deep)] text-[var(--neutral-400)]">
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Creator Handle
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Category
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Country
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Entity Type
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Scopes
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Followers
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                  Status
                </th>
                <th className="py-3.5 px-4 font-semibold uppercase tracking-wider text-[10px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-slate)]/50">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-[var(--brand-slate)]/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={profile.avatarUrl} name={profile.displayName} size="sm" />
                      <div>
                        <span className="block font-bold text-white">{profile.displayName}</span>
                        <span className="block font-mono text-[11px] text-[var(--neutral-400)]">
                          @{profile.igUsername}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--neutral-300)]">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[var(--brand-deep)] border border-[var(--brand-slate)]">
                      {profile.category || '—'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--neutral-300)]">
                    {profile.countryRegion || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-[var(--neutral-300)]">
                      {profile.entityType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-1.5">
                      {profile.scopes?.map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-[var(--brand-slate)] text-[var(--neutral-300)] border border-[var(--brand-slate)]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {profile.latestFollowerCount !== null ? (
                      <FollowerCount count={profile.latestFollowerCount} />
                    ) : (
                      <span className="text-[var(--neutral-500)] italic text-[11px]">Unranked</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {profile.isListed ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
                        Listed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800/60 shadow-sm">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleListed(profile)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          profile.isListed
                            ? 'bg-[var(--brand-deep)] border-[var(--brand-slate)] text-[var(--neutral-400)] hover:text-rose-400 hover:border-rose-900'
                            : 'bg-emerald-950/80 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900'
                        }`}
                        title={profile.isListed ? 'Hide from public charts' : 'Unhide on charts'}
                      >
                        {profile.isListed ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(profile)}
                        className="p-1.5 rounded-lg bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-[var(--neutral-400)] hover:text-white hover:border-[var(--brand-accent)] transition-colors cursor-pointer"
                        title="Edit metadata"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Profile Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--brand-navy)] border border-[var(--brand-slate)] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h2 className="text-lg font-display font-bold text-white">Add Creator to Watchlist</h2>
            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. virat.kohli"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white font-mono focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virat Kohli"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1">
                  Scope
                </label>
                <select
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white focus:border-[var(--brand-accent)] focus:outline-none cursor-pointer"
                >
                  <option value="global">Global Only</option>
                  <option value="india">India Only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--brand-slate)]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 text-[var(--neutral-300)] text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--brand-accent)] hover:opacity-95 text-[var(--brand-deep)] font-display font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer transition-all"
                >
                  Add Creator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--brand-navy)] border border-[var(--brand-slate)] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
            <h2 className="text-lg font-display font-bold text-white">
              Edit @{selectedProfile?.igUsername}
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[var(--brand-accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1">
                  Entity Type
                </label>
                <select
                  value={editEntityType}
                  onChange={(e) => setEditEntityType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white font-mono focus:border-[var(--brand-accent)] focus:outline-none cursor-pointer"
                >
                  <option value="person">person (Default leaderboard)</option>
                  <option value="brand">brand (Excluded from people chart)</option>
                  <option value="team">team (Excluded from people chart)</option>
                  <option value="platform">platform (Excluded from people chart)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)] mb-1.5">
                  Chart Scopes
                </label>
                <div className="flex items-center gap-4 text-white">
                  {['global', 'india'].map((scope) => (
                    <label
                      key={scope}
                      className="inline-flex items-center gap-2 font-mono text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editScopes.includes(scope)}
                        onChange={() =>
                          setEditScopes((prev) =>
                            prev.includes(scope)
                              ? prev.filter((s) => s !== scope)
                              : [...prev, scope],
                          )
                        }
                        className="rounded border-[var(--brand-slate)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)]"
                      />
                      <span className="capitalize">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--brand-slate)] space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
                  Editorial metric override
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min={0}
                    placeholder="Follower count"
                    value={editorialCount}
                    onChange={(e) => setEditorialCount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white font-mono focus:border-[#00d26a] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Note (required)"
                    value={editorialNote}
                    onChange={(e) => setEditorialNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-white focus:border-[#00d26a] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleEditorialMetric()}
                  className="w-full py-2 rounded-xl border border-[#00d26a]/50 text-[#00d26a] text-xs font-bold uppercase tracking-wider hover:bg-[#00d26a]/10 cursor-pointer"
                >
                  Record editorial metric
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--brand-slate)]">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--brand-slate)] hover:bg-[var(--brand-slate)]/80 text-[var(--neutral-300)] text-xs font-semibold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00d26a] hover:opacity-95 text-black font-display font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
