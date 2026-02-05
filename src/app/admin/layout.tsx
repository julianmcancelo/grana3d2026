import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-[#00AE42] selection:text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto h-screen bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
}
