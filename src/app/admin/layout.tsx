import AdminSidebar from "@/components/admin/AdminSidebar";
import MobileAdminNav from "@/components/admin/MobileAdminNav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-[#00AE42] selection:text-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <MobileAdminNav />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
