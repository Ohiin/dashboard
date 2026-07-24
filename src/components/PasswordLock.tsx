import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { hashPassword, verifyPassword } from "../utils/crypto";
import type { WidgetInstance } from "../types";
import { useWidgetStore } from "../store/widgetStore";
import Button from "./Button";

/**
 * Higher-order wrapper: renders the padlock icon in the widget header area
 * (via `icon`) and — when locked — replaces the widget body with a blurred
 * "enter password" overlay instead of the real content.
 */
export function useLockIcon(widget: WidgetInstance) {
  const [showPrompt, setShowPrompt] = useState(false);
  const setLock = useWidgetStore((s) => s.setLock);

  const icon = (
    <button
      onClick={() => setShowPrompt(true)}
      className="text-accent hover:text-white transition-colors duration-150 rounded-full p-1 hover:bg-white/10"
      title={widget.lock.locked ? "Locked" : "Add password lock"}
    >
      {widget.lock.locked ? <Lock size={14} /> : <Unlock size={14} />}
    </button>
  );

  const promptModal = showPrompt ? (
    <SetOrUnlockPrompt
      widget={widget}
      onClose={() => setShowPrompt(false)}
      onLockChanged={(lock) => setLock(widget.id, lock)}
    />
  ) : null;

  return { icon, promptModal };
}

function SetOrUnlockPrompt({
  widget,
  onClose,
  onLockChanged,
}: {
  widget: WidgetInstance;
  onClose: () => void;
  onLockChanged: (lock: WidgetInstance["lock"]) => void;
}) {
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const hasPassword = !!widget.lock.salt && !!widget.lock.hash;

  async function handleSetPassword() {
    if (pw.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    if (pw !== confirmPw) {
      setError("Passwords don't match.");
      return;
    }
    const { salt, hash } = await hashPassword(pw);
    onLockChanged({ locked: true, salt, hash });
    onClose();
  }

  async function handleRemoveLock() {
    if (!widget.lock.salt || !widget.lock.hash) return;
    const ok = await verifyPassword(pw, widget.lock.salt, widget.lock.hash);
    if (!ok) {
      setError("Incorrect password.");
      return;
    }
    onLockChanged({ locked: false });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xs rounded-2xl bg-card border border-border shadow-soft p-5">
        <h3 className="text-white font-semibold mb-3">
          {hasPassword ? "Remove password" : "Set a password"}
        </h3>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder={hasPassword ? "Enter current password" : "New password"}
          className="w-full mb-2 rounded-xl bg-bg border border-border px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
        {!hasPassword && (
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Confirm password"
            className="w-full mb-2 rounded-xl bg-bg border border-border px-3 py-2 text-sm text-white outline-none focus:border-accent"
          />
        )}
        {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
        <div className="flex gap-2 mt-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={hasPassword ? handleRemoveLock : handleSetPassword}
          >
            {hasPassword ? "Unlock & remove" : "Lock widget"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LockedOverlay({
  widget,
  onUnlock,
}: {
  widget: WidgetInstance;
  onUnlock: () => void;
}) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  async function handleUnlock() {
    if (!widget.lock.salt || !widget.lock.hash) return;
    const ok = await verifyPassword(pw, widget.lock.salt, widget.lock.hash);
    if (!ok) {
      setError("Incorrect password.");
      return;
    }
    onUnlock();
  }

  return (
    <div className="absolute inset-0 rounded-2xl backdrop-blur-md bg-black/40 flex flex-col items-center justify-center gap-3 p-4 z-10">
      <Lock className="text-accent" size={28} />
      <p className="text-white text-sm font-medium">This widget is locked</p>
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
        placeholder="Password"
        className="w-4/5 rounded-xl bg-bg border border-border px-3 py-2 text-sm text-white outline-none focus:border-accent text-center"
        autoFocus
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <Button size="sm" onClick={handleUnlock}>
        Unlock
      </Button>
    </div>
  );
}
