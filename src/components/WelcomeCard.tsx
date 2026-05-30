'use client';

export default function WelcomeCard() {
  return (
    <div className="w-full max-w-5xl mx-auto relative group">
      {/* Arkadaki dekoratif canlı renk dalgaları (Blur efektli) */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 via-indigo-100 to-teal-100 rounded-[2rem] blur-xl opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      
      {/* Ana Cam Kart (Glassmorphism) */}
      <div className="relative bg-white/60 backdrop-blur-2xl border border-white/80 shadow-2xl rounded-[2xl] p-8 md:p-12 overflow-hidden">
        
        {/* Üst Kısım: Rozetler ve Unvan */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-200/50 pb-8">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-4 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Sistemler Aktif</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 tracking-tight mb-2">
              Ömer Faruk Yıldız
            </h2>
            <p className="text-gray-500 font-medium text-lg">
              Software Developer Assistant Specialist
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg">
              Projeleri Gör
            </button>
            <button className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">
              İletişime Geç
            </button>
          </div>
        </div>

        {/* Alt Kısım: Detaylı İstatistikler & Odak */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/50 p-5 rounded-xl border border-white">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Ana Odak</h3>
            <p className="text-gray-800 font-semibold">Backend & Süreç Otomasyonu</p>
          </div>
          <div className="bg-white/50 p-5 rounded-xl border border-white">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Mimariler</h3>
            <p className="text-gray-800 font-semibold">SOAP, RESTful, Mikroservisler</p>
          </div>
          <div className="bg-white/50 p-5 rounded-xl border border-white">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Geliştirme Gücü</h3>
            <p className="text-gray-800 font-semibold">C#, Python, RPA Motorları</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}