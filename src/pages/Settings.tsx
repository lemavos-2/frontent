// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { subscriptionService } from "@/services/subscriptionService";
import api from "@/lib/api";
import { noteService } from "@/services/noteService";
import { entityService } from "@/services/entityService";
import type { SubscriptionDTO } from "@/types/models";
import { toast } from "sonner";
import { LogOut, ChevronRight, Shield, CreditCard, User, Zap, Lock } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [sub, setSub] = useState<SubscriptionDTO | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [usage, setUsage] = useState({ notes: 0, entities: 0, habits: 0 });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: user?.username || "", email: user?.email || "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "" });

  useEffect(() => {
    subscriptionService.me().then(setSub).catch(() => {});
    // load accurate usage counts
    const loadUsage = async () => {
      try {
        const [notes, entities] = await Promise.all([
          noteService.list(),
          entityService.list(),
        ]);
        setUsage({
          notes: notes.length,
          entities: entities.length,
          habits: entities.filter((e) => e.type === "HABIT" && !e.archivedAt).length,
        });
      } catch {
        // ignore
      }
    };
    loadUsage();
  }, []);

  const handleCancel = async () => {
    if (!confirm("Cancelar assinatura ao final do período?")) return;
    setCanceling(true);
    try {
      const updated = await subscriptionService.cancel();
      setSub(updated);
      toast.success("Assinatura cancelada");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro");
    } finally {
      setCanceling(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4 md:space-y-6 w-full md:max-w-lg mx-auto">
      <h1 className="text-lg md:text-xl font-bold px-0 md:px-0">Configurações</h1>

      {/* Account */}
      <div className="bg-[#111] border border-white/5 rounded-lg md:rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[#555]" />
          <p className="text-xs font-medium text-[#555] uppercase tracking-wider">Conta</p>
        </div>
        {!editingProfile ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#555]">Username</p>
              <p className="text-sm text-[#ddd] mt-1">{user.username}</p>
            </div>
            <div>
              <p className="text-xs text-[#555]">Email</p>
              <p className="text-sm text-[#ddd] mt-1">{user.email}</p>
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="w-full md:w-auto text-xs text-[#3ecf8e] hover:underline font-medium"
            >
              Editar perfil
            </button>
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-[#555]">Plano atual</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded font-mono font-bold ${
                  user.plan === "FREE"   ? "bg-[#333] text-[#888]" :
                  user.plan === "PRO"    ? "bg-[#3ecf8e]/20 text-[#3ecf8e]" :
                  "bg-purple-500/20 text-purple-400"
                }`}>{user.plan}</span>
                {user.plan === "FREE" && (
                  <button
                    onClick={() => navigate("/upgrade")}
                    className="text-xs text-[#3ecf8e] hover:underline font-medium"
                  >
                    Fazer upgrade →
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.patch("/api/account/me", profileForm);
              toast.success("Perfil atualizado");
              updateUser({ username: profileForm.username, email: profileForm.email });
              setEditingProfile(false);
            } catch (err: any) {
              toast.error(err.response?.data?.message || "Erro");
            }
          }}>
            <div>
              <label className="text-xs text-[#555]">Username</label>
              <input
                value={profileForm.username}
                onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full h-11 bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#555] focus:border-[#3ecf8e]/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#555]">Email</label>
              <input
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full h-11 bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#555] focus:border-[#3ecf8e]/50 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setEditingProfile(false)} className="flex-1 md:flex-none px-4 py-2.5 text-xs text-[#888] hover:text-white hover:bg-white/5 rounded-md transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 md:flex-none px-4 py-2.5 text-xs text-[#3ecf8e] hover:underline font-medium">Salvar</button>
            </div>
          </form>
        )}
      </div>

      {/* Usage */}

      {/* Change password */}
      <div className="bg-[#111] border border-white/5 rounded-lg md:rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#555]" />
          <p className="text-xs font-medium text-[#555] uppercase tracking-wider">Senha</p>
        </div>
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          try {
            await api.post("/api/account/password/change", { currentPassword: passwordForm.current, newPassword: passwordForm.next });
            toast.success("Senha alterada");
            setPasswordForm({ current: "", next: "" });
          } catch (err: any) {
            toast.error(err.response?.data?.message || "Erro");
          }
        }}>
          <div>
            <label className="text-xs text-[#555]">Senha atual</label>
            <input type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
              className="w-full h-11 bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#555] focus:border-[#3ecf8e]/50 focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs text-[#555]">Nova senha</label>
            <input type="password"
              value={passwordForm.next}
              onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
              className="w-full h-11 bg-[#111] border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-[#555] focus:border-[#3ecf8e]/50 focus:outline-none transition-colors" />
          </div>
          <button type="submit" className="w-full md:w-auto text-xs text-[#3ecf8e] hover:underline font-medium">Alterar senha</button>
        </form>
      </div>
      <div className="bg-[#111] border border-white/5 rounded-lg md:rounded-xl p-4 md:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#555]" />
          <p className="text-xs font-medium text-[#555] uppercase tracking-wider">Uso</p>
        </div>
        <div className="space-y-3">
          {[
            { label: "Notas", used: usage.notes, max: sub?.maxNotes ?? user.maxNotes ?? Infinity },
            { label: "Entidades", used: usage.entities, max: sub?.maxEntities ?? user.maxEntities ?? Infinity },
            { label: "Hábitos", used: usage.habits, max: sub?.maxHabits ?? user.maxHabits ?? Infinity },
          ].map(({ label, used, max }) => {
            const pct = isFinite(max) && max > 0 ? used / max : 0;
            const displayMax = isFinite(max) ? String(max) : "∞";
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs text-[#666] font-medium">{label}</p>
                  <p className="text-xs font-mono text-[#555]">
                    {used}{isFinite(max) ? `/${displayMax}` : ""}
                  </p>
                </div>
                {isFinite(max) && max > 0 && (
                  <>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct > 0.95 ? "bg-red-400" :
                          pct > 0.8 ? "bg-orange-400" : "bg-[#3ecf8e]"
                        }`}
                        style={{ width: `${Math.min(100, pct * 100)}%` }}
                      />
                    </div>
                    {pct > 0.8 && (
                      <p className="text-xs text-orange-400 mt-1.5 leading-tight">Você está perto do limite ({Math.round(pct * 100)}%). Considere atualizar.</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription */}
      {sub && sub.status === "ACTIVE" && user.plan !== "FREE" && (
        <div className="bg-[#111] border border-white/5 rounded-lg md:rounded-xl p-4 md:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#555]" />
            <p className="text-xs font-medium text-[#555] uppercase tracking-wider">Assinatura</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#666]">Status</span>
              <span className="text-[#ddd] font-mono text-xs">{sub.status}</span>
            </div>
            {sub.currentPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-[#666]">Próxima renovação</span>
                <span className="text-[#ddd] font-mono text-xs">
                  {format(parseISO(sub.currentPeriodEnd), "dd/MM/yyyy")}
                </span>
              </div>
            )}
            {sub.cancelAtPeriodEnd && (
              <p className="text-xs text-orange-400 mt-2 leading-tight">
                Assinatura será cancelada ao final do período atual.
              </p>
            )}
          </div>
          {!sub.cancelAtPeriodEnd && (
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="w-full text-xs text-red-400 hover:underline disabled:opacity-50 font-medium py-2"
            >
              {canceling ? "Cancelando..." : "Cancelar assinatura"}
            </button>
          )}
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={() => { logout(); navigate("/login"); }}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#111] border border-white/5 rounded-lg md:rounded-xl hover:border-red-500/20 hover:bg-red-500/5 transition-all group"
      >
        <div className="flex items-center gap-2">
          <LogOut className="h-4 w-4 text-[#555] group-hover:text-red-400 transition-colors" />
          <span className="text-sm text-[#888] group-hover:text-red-400 transition-colors">Sair da conta</span>
        </div>
        <ChevronRight className="h-4 w-4 text-[#333]" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
