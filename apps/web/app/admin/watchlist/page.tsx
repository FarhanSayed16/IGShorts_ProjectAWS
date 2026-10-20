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

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const isListed = activeListedFilter === 'all' ? undefined : activeListedFilter === 'listed';

      const res = await getAdminWatchlist({
        limit: 100,
        offset: 0,
        q: searchQuery || undefined,
        scope: activeScope || undefined,
        isListed,
      });
      setProfiles(res.data);
      setTotal(res.meta.total);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [activeScope, activeListedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProfiles();
  };

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
    setIsEditOpen(true);
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
        <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="font-bold text-emerald-400">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Watchlist Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, categorize, hide/unhide, and add creators to the monitored discovery universe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gold text-navy hover:bg-gold/90 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Creator</span>
          </button>

          <button
            onClick={loadProfiles}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search handle or display name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-gold"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Scope Filter */}
          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveScope('')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeScope === '' ? 'bg-navy text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Scopes
            </button>
            <button
              onClick={() => setActiveScope('global')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeScope === 'global' ? 'bg-navy text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Global
            </button>
            <button
              onClick={() => setActiveScope('india')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeScope === 'india' ? 'bg-navy text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              India
            </button>
          </div>

          {/* Listed / Hidden Filter */}
          <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveListedFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeListedFilter === 'all'
                  ? 'bg-navy text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setActiveListedFilter('listed')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeListedFilter === 'listed'
                  ? 'bg-emerald-950 text-emerald-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Listed
            </button>
            <button
              onClick={() => setActiveListedFilter('hidden')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeListedFilter === 'hidden'
                  ? 'bg-rose-950 text-rose-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hidden
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Creator Handle</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Country</th>
                <th className="py-3 px-4 font-semibold">Entity Type</th>
                <th className="py-3 px-4 font-semibold">Scopes</th>
                <th className="py-3 px-4 font-semibold">Followers</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={profile.avatarUrl} name={profile.displayName} size="sm" />
                      <div>
                        <span className="block font-bold text-slate-100">
                          {profile.displayName}
                        </span>
                        <span className="block font-mono text-[11px] text-slate-400">
                          @{profile.igUsername}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{profile.category || '—'}</td>
                  <td className="py-3 px-4 text-slate-300">{profile.countryRegion || '—'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                      {profile.entityType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {profile.scopes?.map((s: string) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-slate-850 text-slate-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">
                    {profile.latestFollowerCount !== null ? (
                      <FollowerCount count={profile.latestFollowerCount} />
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Unranked</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {profile.isListed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Listed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleListed(profile)}
                        className={`p-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
                          profile.isListed
                            ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900'
                            : 'bg-emerald-950 border-emerald-800 text-emerald-400 hover:bg-emerald-900'
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
                        className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Add Creator to Watchlist</h2>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Instagram Handle</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. virat.kohli"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virat Kohli"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Country</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Scope</label>
                <select
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="global">Global Only</option>
                  <option value="india">India Only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded bg-gold text-navy font-bold">
                  Add Creator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Edit @{selectedProfile?.igUsername}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Entity Type</label>
                <select
                  value={editEntityType}
                  onChange={(e) => setEditEntityType(e.target.value)}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-white font-mono"
                >
                  <option value="person">person (Default leaderboard)</option>
                  <option value="brand">brand (Excluded from people chart)</option>
                  <option value="team">team (Excluded from people chart)</option>
                  <option value="platform">platform (Excluded from people chart)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Chart scopes</label>
                <div className="flex items-center gap-4 text-slate-200">
                  {['global', 'india'].map((scope) => (
                    <label key={scope} className="inline-flex items-center gap-1.5 font-mono">
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
                      />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
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
