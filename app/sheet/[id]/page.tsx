import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import SharedSheetViewer from "@/components/SharedSheetViewer";

export default async function SharedSheetPage({ params }: { params: { id: string } }) {
  const sheet = await prisma.sheet.findUnique({ where: { id: params.id } });
  if (!sheet) notFound();

  const data = JSON.parse(sheet.data);

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a3a] bg-[rgba(10,10,15,0.85)]">
        <div className="flex items-center gap-2.5">
          <img src="/logo.jpeg" alt="Velixa" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display font-bold text-lg text-white">Velixa</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#7a7a9a] font-mono">Shared sheet — view only</span>
          <a href="/" className="btn btn-primary text-[13px] py-2 px-4">Create your own →</a>
        </div>
      </nav>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#111118] border-b border-[#2a2a3a]">
          <span className="w-2 h-2 rounded-full bg-[#00d4aa]" />
          <span className="font-display font-bold text-white">{sheet.name}</span>
          <span className="badge badge-green">Shared</span>
        </div>
        <div className="flex-1 overflow-hidden bg-[#0d0d14]">
          <SharedSheetViewer data={data} />
        </div>
      </div>
    </div>
  );
}