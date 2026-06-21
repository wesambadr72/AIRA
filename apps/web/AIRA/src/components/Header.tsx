import { Globe, Sun, Moon, Menu } from 'lucide-react'

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 475 444"
    className={`${className} fill-brand-logo`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(0,444) scale(0.1,-0.1)">
      <path d="M960 4068 c-86 -12 -217 -57 -286 -99 -129 -78 -257 -223 -314 -357 -66 -155 -63 -91 -62 -1342 1 -1092 2 -1138 20 -1210 41 -157 110 -270 233 -384 119 -110 258 -175 423 -196 55 -7 472 -10 1291 -8 1365 4 1253 -3 1432 85 153 74 281 209 359 378 66 143 64 93 64 1346 0 1102 -1 1138 -20 1214 -70 272 -274 480 -547 558 l-78 22 -1225 1 c-715 1 -1252 -2 -1290 -8z m1617 -868 c348 -643 938 -1742 1008 -1877 32 -61 55 -118 52 -126 -3 -8 -26 -17 -59 -20 -92 -11 -1037 -8 -1059 3 -18 10 -19 24 -19 325 0 227 3 316 12 321 6 4 68 6 139 5 86 -2 129 1 134 9 8 13 -393 687 -414 695 -20 8 -34 -7 -125 -134 -115 -161 -773 -1101 -825 -1181 -24 -36 -51 -71 -59 -77 -19 -15 -568 -18 -591 -4 -15 9 -7 21 336 526 206 303 714 1060 975 1450 135 204 252 376 258 383 7 7 25 12 42 10 28 -3 39 -20 195 -308z" />
    </g>
  </svg>
)

interface HeaderProps {
  lang: 'en' | 'ar'
  setLang: React.Dispatch<React.SetStateAction<'en' | 'ar'>>
  isDarkMode: boolean
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  onLogoClick?: () => void
}

export default function Header({
  lang,
  setLang,
  isDarkMode,
  setIsDarkMode,
  setIsSidebarOpen,
  onLogoClick
}: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-colors ${
        isDarkMode ? 'bg-brand-bg/75 border-raspberry-plum-950/20' : 'bg-white/75 border-raspberry-plum-200/50'
      }`}
    >
      <div 
        onClick={onLogoClick}
        className="flex items-center gap-3 cursor-pointer select-none hover:opacity-80 active:scale-98 transition-all duration-200"
        title="Go to Home / الصفحة الرئيسية"
      >
        <Logo className="w-9 h-9" />
        <span className="font-oxanium font-medium tracking-wider text-brand-logo text-2xl">
          AIRA
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Toggle */}
        <button
          onClick={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
            isDarkMode
              ? 'bg-raspberry-plum-950/30 border-raspberry-plum-800/20 text-raspberry-plum-100 hover:bg-raspberry-plum-900/40'
              : 'bg-white border-raspberry-plum-200 text-brand-logo hover:bg-raspberry-plum-50'
          }`}
          title="Switch Language / تغيير اللغة"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className={`p-2 rounded-lg border transition-all ${
            isDarkMode
              ? 'bg-raspberry-plum-950/30 border-raspberry-plum-800/20 text-yellow-400 hover:bg-raspberry-plum-900/40'
              : 'bg-white border-raspberry-plum-200 text-slate-700 hover:bg-raspberry-plum-50'
          }`}
          title="Toggle theme / تغيير المظهر"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`md:hidden p-2 rounded-lg border transition-all ${
            isDarkMode
              ? 'bg-raspberry-plum-950/30 border-raspberry-plum-800/20 text-raspberry-plum-100 hover:bg-raspberry-plum-900/40'
              : 'bg-white border-raspberry-plum-200 text-slate-700 hover:bg-raspberry-plum-50'
          }`}
          aria-label="Open documents drawer"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
