// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { entityService } from "@/services/entityService";
import type { EntityType, TrackingUnit } from "@/types/models";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const ENTITY_TYPES = [
  { value: "PERSON" as EntityType, label: "Pessoa", trackable: false },
  { value: "PROJECT" as EntityType, label: "Projeto", trackable: false },
  { value: "HABIT" as EntityType, label: "Hábito", trackable: true },
  { value: "TOPIC" as EntityType, label: "Tópico", trackable: false },
  { value: "OTHER" as EntityType, label: "Outro", trackable: false },
];

const TRACKING_UNITS = [
  { value: "BOOLEAN" as TrackingUnit, label: "Sim/Não" },
  { value: "COUNT" as TrackingUnit, label: "Contagem" },
  { value: "DURATION" as TrackingUnit, label: "Duração" },
  { value: "NUMERIC" as TrackingUnit, label: "Numérico" },
];

export default function EntityCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = (searchParams.get("type") || "PERSON") as EntityType;

  const [form, setForm] = useState({
    name: "",
    description: "",
    entityType: defaultType,
    tags: [] as string[],
    trackingUnit: "BOOLEAN" as TrackingUnit,
    targetValue: "",
  });
  const [loading, setLoading] = useState(false);

  const typeInfo = ENTITY_TYPES.find((t) => t.value === form.entityType);
  const showTracking = typeInfo?.trackable || false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nome obrigatório");
      return;
    }
    setLoading(true);
    try {
      const entity = await entityService.create({
        name: form.name.trim(),
        description: form.description || undefined,
        type: form.entityType,
        tags: form.tags.length > 0 ? form.tags : undefined,
        tracking: showTracking ? {
          trackingUnit: form.trackingUnit,
          targetValue: form.targetValue ? Number(form.targetValue) : 0,
          enabled: true,
          frequency: "DAILY",
          allowDecimals: form.trackingUnit === "NUMERIC",
        } : undefined,
      });
      toast.success("Entidade criada!");
      navigate(form.entityType === "HABIT" ? "/habits" : `/entities/${entity.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao criar");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#111] border border-white/10 rounded-md px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/20 transition-colors";

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-[#666] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Nova entidade</h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs text-[#666] mb-2 font-medium">
            Tipo
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {ENTITY_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, entityType: t.value }))}
                className={`py-2 rounded-md text-xs font-medium transition-colors ${
                  form.entityType === t.value
                    ? "bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/30"
                    : "bg-[#111] text-[#666] border border-white/5 hover:border-white/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#666] mb-2 font-medium">
            Nome
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
            placeholder="Nome da entidade"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-[#666] mb-2 font-medium">
            Descrição (opcional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="Descrição opcional"
          />
        </div>

        <div>
          <label className="block text-xs text-[#666] mb-2 font-medium">
            Tags (opcional)
          </label>
          <input
            type="text"
            value={form.tags.join(", ")}
            onChange={(e) => setForm((f) => ({
              ...f,
              tags: e.target.value.split(",").map(s => s.trim()).filter(s => s)
            }))}
            className={inputClass}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        {showTracking && (
          <>
            <div>
              <label className="block text-xs text-[#666] mb-2 font-medium">
                Tipo de Rastreamento
              </label>
              <select
                value={form.trackingUnit}
                onChange={(e) => setForm((f) => ({
                  ...f,
                  trackingUnit: e.target.value as TrackingUnit
                }))}
                className={inputClass}
              >
                {TRACKING_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#666] mb-2 font-medium">
                Valor Alvo
              </label>
              <input
                type="number"
                value={form.targetValue}
                onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
                className={inputClass}
                placeholder="Ex: 7 para 7 dias por semana"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Criar Entidade
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
