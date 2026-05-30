'use client';

const skillGroups = [
  {
    category: "Diller & Temel",
    skills: ["C#", "Python", "JavaScript", "SQL", "LINQ"]
  },
  {
    category: "Otomasyon & RPA",
    skills: ["Selenium", "UiPath", "Custom RPA Engines", "Task Scheduling"]
  },
  {
    category: "Entegrasyon & API",
    skills: ["SOAP", "RESTful APIs", "Web Services", "JSON/XML Parsing"]
  },
  {
    category: "Araçlar & DevOps",
    skills: ["Git", "Docker", "Postman", "IIS Configuration"]
  }
];

export default function Ecosystem() {
  return (
    <section className="w-full max-w-5xl mx-auto mt-24">
      <div className="flex items-center space-x-3 mb-8 px-4 md:px-0">
        <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Teknoloji Ekosistemi</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-0">
        {skillGroups.map((group, idx) => (
          <div 
            key={idx} 
            className="bg-white/60 backdrop-blur-xl border border-white shadow-lg shadow-blue-900/5 p-6 rounded-2xl hover:bg-white/80 transition-all duration-300"
          >
            <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill, sIdx) => (
                <span 
                  key={sIdx} 
                  className="text-sm font-medium text-gray-700 bg-white/80 py-1.5 px-3 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}