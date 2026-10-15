'use client';

import React, { useState, useEffect } from 'react';
import { X, Coins, Send, CheckCircle2, AlertCircle, ShieldAlert, Clock } from 'lucide-react';
import { useGameStore } from '@/lib/shared/useGameStore';

export function RequestCoinsModal() {
  const isOpen = useGameStore((s) => s.requestCoinsModalOpen);
  const toggleModal = useGameStore((s) => s.toggleRequestCoinsModal);
  const balance = useGameStore((s) => s.balance);

  const [userId, setUserId] = useState<string>('vip_player');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('1000');
  const [reason, setReason] = useState<string>('Game bankroll refill');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('playin_user_id');
      if (stored) setUserId(stored);
    } catch {}
  }, []);

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2500, 5000];

  const handleSelectQuick = (val: number) => {
    setAmount(val);
    setCustomAmount(String(val));
    setStatusMessage(null);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setCustomAmount(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
    setStatusMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid coin amount.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/casino/user/request-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          requestedAmount: amount,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          type: 'success',
          text: `Request for ${amount.toLocaleString()} Coins has been sent to Admin! Coins will be allotted once approved.`,
        });
        setTimeout(() => {
          toggleModal(false);
          setStatusMessage(null);
        }, 2500);
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Unable to submit request. Please try again.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleModal(false);
      }}
    >
      <div className="relative w-full max-w-md bg-[#0c0c0e] border border-[#d4af37]/50 rounded-3xl p-5 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#d4af37] to-[#f5d27a] text-black flex items-center justify-center shadow-lg font-black">
              <Coins className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">
                Request Coins
              </h2>
              <span className="text-[11px] text-[#f5d27a] font-semibold">
                Admin Allotment Portal
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleModal(false)}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="space-y-4 py-4 pr-1">
          {/* Important Admin Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200 leading-snug">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Admin Approval Required:</strong> Coins cannot be directly added to your balance. Submitting a request notifies the Admin, who will review and allot coins to your account.
            </span>
          </div>

          {/* Current Balance */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-black/60 border border-white/10 text-xs">
            <span className="text-neutral-400">Current Balance:</span>
            <span className="text-white font-black text-sm flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-[#d4af37]" />
              {balance.toLocaleString()} Coins
            </span>
          </div>

          {/* Quick Select Amount */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
              Select Request Amount:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSelectQuick(q)}
                  className={`py-2 rounded-xl text-xs font-black transition-all border ${
                    amount === q
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#f5d27a] text-black border-[#f5d27a] shadow-md shadow-amber-500/20'
                      : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  +{q}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
              Or Custom Coin Amount:
            </label>
            <input
              type="number"
              min="100"
              step="50"
              value={customAmount}
              onChange={handleCustomChange}
              className="w-full px-4 py-2.5 rounded-2xl bg-black/70 border border-white/15 text-white font-bold text-sm focus:outline-hidden focus:border-[#d4af37] transition-all"
              placeholder="e.g. 1000"
            />
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
              Reason for Request:
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-black/70 border border-white/15 text-white text-xs focus:outline-hidden focus:border-[#d4af37] transition-all"
              placeholder="e.g. In-game bankroll refill"
            />
          </div>

          {/* Status Feedback Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl border flex items-center gap-2 text-xs font-bold animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/70 border-red-500/50 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || amount <= 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffd269] to-[#b3821a] hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Clock className="w-4 h-4 animate-spin text-black" />
                <span>Sending to Admin...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-black" />
                <span>Submit Request to Admin</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RequestCoinsModal;
