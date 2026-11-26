import { Link } from 'react-router-dom';
import { Briefcase, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">SkillConnect</span>
            </div>
            <p className="text-sm">The professional freelance marketplace. Connect, collaborate, deliver.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/projects" className="hover:text-white transition">Browse Projects</Link></li>
              <li><Link to="/freelancers" className="hover:text-white transition">Find Freelancers</Link></li>
              <li><Link to="/categories" className="hover:text-white transition">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"><Linkedin className="h-4 w-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"><Github className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-center">
          © {new Date().getFullYear()} SkillConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
