const cores: Record<string, string> = {
  ABERTA: "bg-amber-100 text-amber-800",
  EM_TRIAGEM: "bg-purple-100 text-purple-800",
  EM_ANDAMENTO: "bg-blue-100 text-blue-800",
  CONCLUIDA: "bg-green-100 text-green-800",
  CANCELADA: "bg-slate-200 text-slate-600",
  BAIXA: "bg-slate-100 text-slate-700",
  MEDIA: "bg-sky-100 text-sky-800",
  ALTA: "bg-orange-100 text-orange-800",
  URGENTE: "bg-red-100 text-red-800",
};

export default function Badge({ valor }: { valor: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cores[valor] ?? "bg-slate-100"}`}>
      {valor.replace("_", " ")}
    </span>
  );
}

