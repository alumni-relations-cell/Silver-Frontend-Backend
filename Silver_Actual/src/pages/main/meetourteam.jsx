import { Users, Code, Palette, Camera, FileText } from 'lucide-react';
import TeamMember from '../../components/TeamMember';
import DepartmentSection from '../../components/DepartmentSection';

function App() {
  const facultyHeads = [
    {
      name: "Mansi Bhargava",
      position: "Head Of Alumni Relations",
      photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
      linkedin: "https://linkedin.com/in/mansibhargava",
      github: "https://github.com/mansibhargava",
    },
    {
      name: "Mrs. Deepika",
      position: "Senior Associate",
      photo: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
      linkedin: "https://linkedin.com/in/deepika",
      github: "https://github.com/deepika",
    },
  ];

  const studentLeads = [
    {
      name: "Kushal Preet Sallan",
      position: "President",
      photo: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
      linkedin: "https://linkedin.com/in/kushalpreetsallan",
      github: "https://github.com/kushalpreetsallan",
    },
    {
      name: "Madhav Mahajan",
      position: "Tech Head",
      photo: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400",
      linkedin: "https://linkedin.com/in/madhavmahajan",
      github: "https://github.com/madhavmahajan",
    },
    {
      name: "Jatin Sharma",
      position: "Cultural Head",
      photo: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400",
      linkedin: "https://linkedin.com/in/jatinsharma",
      github: "https://github.com/jatinsharma",
    },
  ];

  const departments = [
    {
      name: "Tech Department",
      icon: Code,
      members: [
        {
          name: "Rakshit Dhamija",
          position: "Tech POR",
          photo: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/rakshitdhamija",
          github: "https://github.com/rakshitdhamija",
        },
        {
          name: "Garv Noor Sandha",
          position: "Tech Lead",
          photo: "https://res.cloudinary.com/dbl2so7ff/image/upload/v1759900308/silverjubilee/home/kb87khtj4znekw5pbnss.jpg",
          linkedin: "https://linkedin.com/in/garvnoorsandha",
          github: "https://github.com/garvnoorsandha",
        },
      ],
    },
    {
      name: "Design Department",
      icon: Palette,
      members: [
        {
          name: "Riya Mehta",
          position: "UI/UX Lead",
          photo: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/riyamehta",
          github: "https://github.com/riyamehta",
        },
        {
          name: "Karan Malhotra",
          position: "Graphic Designer",
          photo: "https://images.pexels.com/photos/1516679/pexels-photo-1516679.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/karanmalhotra",
          github: "https://github.com/karanmalhotra",
        },
        {
          name: "Pooja Sharma",
          position: "Product Designer",
          photo: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/poojasharma",
          github: "https://github.com/poojasharma",
        },
        {
          name: "Siddharth Jain",
          position: "Visual Designer",
          photo: "https://images.pexels.com/photos/1222272/pexels-photo-1222272.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/siddharthjain",
          github: "https://github.com/siddharthjain",
        },
      ],
    },
    {
      name: "Media Department",
      icon: Camera,
      members: [
        {
          name: "Aditya Rao",
          position: "Photography Lead",
          photo: "https://images.pexels.com/photos/1516676/pexels-photo-1516676.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/adityarao",
          github: "https://github.com/adityarao",
        },
        {
          name: "Kavya Iyer",
          position: "Videographer",
          photo: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/kavyaiyer",
          github: "https://github.com/kavyaiyer",
        },
        {
          name: "Rohit Desai",
          position: "Video Editor",
          photo: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/rohitdesai",
          github: "https://github.com/rohitdesai",
        },
        {
          name: "Anjali Nair",
          position: "Social Media Manager",
          photo: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/anjalinair",
          github: "https://github.com/anjalinair",
        },
        {
          name: "Varun Khanna",
          position: "Content Creator",
          photo: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/varunkhanna",
          github: "https://github.com/varunkhanna",
        },
      ],
    },
    {
      name: "Content Department",
      icon: FileText,
      members: [
        {
          name: "Ishita Bansal",
          position: "Content Lead",
          photo: "https://images.pexels.com/photos/1181693/pexels-photo-1181693.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/ishitabansal",
          github: "https://github.com/ishitabansal",
        },
        {
          name: "Harsh Agarwal",
          position: "Content Writer",
          photo: "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/harshagarwal",
          github: "https://github.com/harshagarwal",
        },
        {
          name: "Simran Kaur",
          position: "Copy Editor",
          photo: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/simrankaur",
          github: "https://github.com/simrankaur",
        },
        {
          name: "Aryan Mittal",
          position: "Blog Manager",
          photo: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=400",
          linkedin: "https://linkedin.com/in/aryanmittal",
          github: "https://github.com/aryanmittal",
        },
      ],
    },
  ];

  return (
<div className="min-h-screen bg-gradient-to-br from-black via-black/90 to-black-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.15),transparent_50%)]"></div>

      <div className="relative">
        <header className="text-center py-16 px-4 group">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl shadow-2xl transform group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-300">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-violet-400 transition-all duration-300">
            Our Team
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto group-hover:text-gray-100 transition-colors duration-300">
            Alumni Relations Cell
          </p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto rounded-full group-hover:w-32 transition-all duration-300"></div>
        </header>

        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-16 group">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-violet-400 transition-all duration-300">
              Faculty Heads
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto rounded-full group-hover:w-20 transition-all duration-300"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center mb-20">
            {facultyHeads.map((member, index) => (
              <TeamMember key={index} {...member} size="large" />
            ))}
          </div>

          <div className="text-center mb-16 group">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-violet-400 transition-all duration-300">
              Student Leadership
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto rounded-full group-hover:w-20 transition-all duration-300"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center mb-20">
            {studentLeads.map((member, index) => (
              <TeamMember key={index} {...member} size="medium" />
            ))}
          </div>

          <div className="text-center mb-16 group">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-violet-400 transition-all duration-300">
              Departments
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-violet-600 mx-auto rounded-full group-hover:w-20 transition-all duration-300"></div>
          </div>
          <div className="space-y-16">
            {departments.map((dept, index) => (
              <DepartmentSection key={index} {...dept} />
            ))}
          </div>
        </section>

        <footer className="text-center py-12 px-4 mt-20 group">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-400 text-sm group-hover:text-gray-100 group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-violet-400 transition-all duration-300">
              Together we build connections that last a lifetime
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;