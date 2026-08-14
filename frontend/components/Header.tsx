'use client';

import React, { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  onCreateClick: () => void;
  formCount?: number;
}

export default function Header({ onCreateClick, formCount }: HeaderProps) {
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-[#e5e5e5] bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Icon + Workspace Dropdown & Nav Tabs */}
          <div className="flex items-center gap-6">
            <div className="relative" ref={workspaceRef}>
              <button
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="flex items-center gap-2 cursor-pointer group focus:outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-[#262627] text-white font-black text-xs flex items-center justify-center tracking-tighter shadow-xs">
                  T
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-[#262627]">My workspace</span>
                  <svg className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {workspaceMenuOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white border border-zinc-200 shadow-xl py-1.5 z-40 animate-fade-in text-xs">
                  <div className="px-3.5 py-1.5 font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                    Workspaces
                  </div>
                  <div className="px-3.5 py-2 font-semibold text-[#262627] bg-zinc-50 flex items-center justify-between">
                    <span>My workspace</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="my-1 border-t border-zinc-100" />
                  <div className="px-3.5 py-2 text-zinc-400 flex items-center justify-between opacity-75 cursor-not-allowed">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Team Collaboration</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                      Soon
                    </span>
                  </div>
                </div>
              )}
            </div>

            <nav className="hidden md:flex items-center gap-4 border-l border-zinc-200 pl-6 h-8">
              <button className="px-3 py-1.5 text-xs font-bold text-[#262627] bg-zinc-100 rounded-md">
                Forms {formCount !== undefined && <span className="ml-1 text-[11px] text-zinc-500 font-normal">({formCount})</span>}
              </button>

              {/* Integrations Coming Soon Badge Item */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 opacity-70 cursor-not-allowed select-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 002 2h1a2 2 0 110 4h-1a2 2 0 00-2 2v1a2 2 0 11-4 0v-1a2 2 0 00-2-2H7a2 2 0 110-4h1a2 2 0 002-2V4z" />
                </svg>
                <span>Integrations</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 px-1 py-0.2 rounded border border-zinc-200">
                  Soon
                </span>
              </div>
            </nav>
          </div>

          {/* Right: Actions & User Avatar Dropdown */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCreateClick}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#262627] text-white font-medium text-xs hover:bg-black active:scale-[0.98] transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create form</span>
            </button>

            {/* Creator Authentication Avatar */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                className="w-8 h-8 rounded-full bg-[#f3d0bc] text-[#78350f] font-bold text-xs flex items-center justify-center border border-amber-200 cursor-pointer focus:outline-none"
                title="Creator Account"
              >
                TN
              </button>

              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-zinc-200 shadow-xl py-2 z-40 animate-fade-in text-xs">
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <span className="font-bold text-[#262627] block">Creator (Default Account)</span>
                    <span className="text-[11px] text-zinc-500 block">creator@typeform-clone.local</span>
                  </div>

                  <div className="px-4 py-2.5 mt-1 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-zinc-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Authentication</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-200/70 px-1.5 py-0.5 rounded">
                      Coming Soon
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


