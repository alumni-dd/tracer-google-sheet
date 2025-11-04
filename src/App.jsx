import { CssBaseline } from "@mui/material";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import TracerForm from "./components/TracerForm";

export default function App() {
  return (
    <>
      {/* Reset CSS bawaan browser */}
      <CssBaseline />
      
      {/* Layout Utama dengan Flexbox dan Tailwind */}
      <div className="min-h-screen flex flex-col bg-gray-100">
        
        {/* Navbar dari repo lama */}
        <Navbar />

        {/* Konten Utama */}
        <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-5">
          
          {/* Judul Statis dari index.html Anda, di-style ulang dengan Tailwind */}
          <div className="text-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              Form Tracer Study 2025 Alumni GREAT Edunesia Dompet Dhuafa
            </h1>
          </div>
          
          {/* Container Form (Paper/Card) */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-8">
            <TracerForm />
          </div>

        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}