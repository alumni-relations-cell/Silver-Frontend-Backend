import { FaLinkedin, FaGithub } from 'react-icons/fa';

export default function TeamMember({ name, position, photo, linkedin, github, size = 'small' }) {
  const sizeConfig = {
    large: {
      container: 'w-72',
      image: 'w-56 h-56',
      nameSize: 'text-2xl',
      positionSize: 'text-base',
      padding: 'p-8'
    },
    medium: {
      container: 'w-60',
      image: 'w-44 h-44',
      nameSize: 'text-xl',
      positionSize: 'text-sm',
      padding: 'p-7'
    },
    small: {
      container: 'w-48',
      image: 'w-32 h-32',
      nameSize: 'text-lg',
      positionSize: 'text-sm',
      padding: 'p-6'
    }
  };

  const config = sizeConfig[size];

  // Fallback if icons aren't available
  const LinkedInIcon = FaLinkedin || null;
  const GitHubIcon = FaGithub || null;

  return (
    <div className={`${config.container} group transition-all duration-300 hover:scale-105`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>

        <div className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl ${config.padding} border border-gray-700 hover:border-gray-400/70 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-gray-500/30 transform group-hover:-translate-y-2`}>
          <div className="flex flex-col items-center">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-600 rounded-full blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className={`relative ${config.image} rounded-full overflow-hidden border-4 border-gray-800 group-hover:border-gray-400/70 transition-all duration-300`}>
                <img
                  src={photo}
                  alt={name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            <h3 className={`text-white font-bold ${config.nameSize} text-center mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-200 group-hover:to-gray-400 transition-all duration-300`}>
              {name}
            </h3>
            <p className={`text-gray-400 ${config.positionSize} text-center leading-relaxed mb-4`}>
              {position}
            </p>
            <div className="flex gap-4">
              {linkedin && typeof linkedin === 'string' && (
                <a 
                  href={linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={`LinkedIn profile of ${name}`}
                  className="text-gray-400 hover:text-gray-200 transition-colors duration-300"
                >
                  {LinkedInIcon ? <LinkedInIcon size={20} /> : 'LI'}
                </a>
              )}
              {github && typeof github === 'string' && (
                <a 
                  href={github} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={`GitHub profile of ${name}`}
                  className="text-gray-400 hover:text-gray-200 transition-colors duration-300"
                >
                  {GitHubIcon ? <GitHubIcon size={20} /> : 'GH'}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}