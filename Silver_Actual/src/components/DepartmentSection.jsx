import TeamMember from './TeamMember';

export default function DepartmentSection({ name, icon: Icon, members }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-violet-600/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>

      <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-3xl p-8 md:p-12 border border-gray-700/50 hover:border-blue-500/70 backdrop-blur-sm shadow-xl group-hover:shadow-2xl group-hover:shadow-blue-500/30 transform group-hover:-translate-y-2 transition-all duration-300">
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-violet-400 transition-all duration-300">
            {name}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {members.map((member, index) => (
            <TeamMember key={index} {...member} size="small" />
          ))}
        </div>
      </div>
    </div>
  );
}