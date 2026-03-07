// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação não encontrado");
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Email verificado com sucesso!");
        toast.success("Email verificado! Você pode fazer login agora.");
        setTimeout(() => navigate("/login"), 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Erro ao verificar email");
        toast.error("Erro ao verificar email");
      }
    };

    verify();
  }, [searchParams, verifyEmail, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <span className="font-mono text-sm font-bold tracking-widest text-[#3ecf8e]">CONTINUUM</span>
          <h1 className="mt-3 text-2xl font-bold text-white">Verificação de Email</h1>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-lg p-6">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-[#3ecf8e] animate-spin mb-4" />
              <p className="text-white font-medium">Verificando seu email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-white font-medium mb-2">{message}</p>
              <p className="text-sm text-[#666]">Redirecionando para o login...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-white font-medium mb-4">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 text-black font-semibold py-2.5 rounded-md text-sm transition-colors"
              >
                Voltar ao login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────