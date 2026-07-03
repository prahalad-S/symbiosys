import { Link } from 'react-router-dom';

export function Footer() {
  const footerLinks = {
    services: ['Animation & VFX', 'Testing Services', 'Publishing', 'IT Solutions', 'Engineering'],
    company: ['About Us', 'Careers', 'Blog', 'Press', 'Partners'],
    resources: ['Documentation', 'Case Studies', 'Whitepapers', 'Webinars', 'Support'],
    legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'],
  };

  return (
    <footer className="relative py-20 border-t border-slate-800/50 mt-auto">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-40 h-auto flex items-center justify-center">
                <img src="/assets/symbiosys-logo.png" alt="Symbiosys Logo" className='w-full' />
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Delivering world-class technology solutions across IT, engineering,
              and creative services for global enterprises since 2008.
            </p>
            <div className="flex gap-4">
              {['LinkedIn', 'Twitter', 'YouTube', 'GitHub'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <span className="text-xs font-bold">{social.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold mb-4 capitalize">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Symbiosys Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
