import Footer from "@/components/Footer";
import HeaderMenu from "@/components/Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="z-50">
        <HeaderMenu />
      </div>
      <div className="flex flex-col min-h-screen">
        <main className="">{children}</main>
      </div>
      <div className="bg-black">
        <Footer />
      </div>
    </>
  );
};

export default Layout;
