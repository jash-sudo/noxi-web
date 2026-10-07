import { AnimatePresence, motion } from 'framer-motion'
import { Rnd } from 'react-rnd'
import {
  Bell, ChevronDown, Cloud, Compass, Download, Folder, Gamepad2, Globe,
  Heart, LayoutGrid, Maximize2, MessageCircle, Moon, PanelTop,
  Play, Search, Settings, ShoppingBag, Sun, UserRound, Wifi, X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { categories, games, type Game } from '../games/registry'
import './App.css'

type AppId = 'games' | 'chat' | 'browser' | 'files' | 'downloads' | 'store' | 'settings' | 'profile' | 'cloud' | 'community' | 'licenses'
type WindowState = { id: AppId; title: string; minimized?: boolean; maximized?: boolean; z: number }

const appMeta: Record<AppId, { title: string; icon: typeof Gamepad2; color: string }> = {
  games: { title: 'Games', icon: Gamepad2, color: '#ff9d70' }, chat: { title: 'Chat', icon: MessageCircle, color: '#5b9bff' },
  browser: { title: 'Browser', icon: Globe, color: '#8ad5a6' }, files: { title: 'Files', icon: Folder, color: '#ffd05f' },
  downloads: { title: 'Downloads', icon: Download, color: '#96a8ff' }, store: { title: 'Store', icon: ShoppingBag, color: '#ef8fcc' },
  settings: { title: 'Settings', icon: Settings, color: '#a5b1c2' }, profile: { title: 'Profile', icon: UserRound, color: '#c69aff' },
  cloud: { title: 'Cloud Gaming', icon: Cloud, color: '#68d8e1' }, community: { title: 'Community', icon: Compass, color: '#e6a878' }, licenses: { title: 'Licenses', icon: PanelTop, color: '#d0d2d8' },
}

const wallpapers = [
  { id: 'aurora', name: 'Aurora', value: 'radial-gradient(circle at 22% 15%, #567bd7 0, transparent 32%), radial-gradient(circle at 78% 25%, #d4759c 0, transparent 28%), linear-gradient(145deg, #111b39 0%, #1b1231 46%, #101820 100%)' },
  { id: 'midnight', name: 'Midnight', value: 'radial-gradient(circle at 48% 20%, #213450 0, transparent 33%), linear-gradient(145deg, #0c111c, #151927 50%, #080b12)' },
  { id: 'sand', name: 'Dune', value: 'radial-gradient(circle at 20% 20%, #bd9775 0, transparent 32%), linear-gradient(145deg, #6d5544, #1c1d25 70%)' },
]

function App() {
  const [signedIn, setSignedIn] = useState(() => localStorage.getItem('noxi-web-session') === 'true')
  const [windows, setWindows] = useState<WindowState[]>([])
  const [nextZ, setNextZ] = useState(10)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('noxi-web-theme') as 'dark' | 'light') || 'dark')
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('noxi-web-wallpaper') || 'aurora')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('noxi-web-favorites') || '[]'))
  const [recent, setRecent] = useState<string[]>(() => JSON.parse(localStorage.getItem('noxi-web-recent') || '[]'))
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [notice, setNotice] = useState('')

  useEffect(() => { localStorage.setItem('noxi-web-theme', theme) }, [theme])
  useEffect(() => { localStorage.setItem('noxi-web-wallpaper', wallpaper) }, [wallpaper])
  useEffect(() => { localStorage.setItem('noxi-web-favorites', JSON.stringify(favorites)) }, [favorites])
  useEffect(() => { localStorage.setItem('noxi-web-recent', JSON.stringify(recent)) }, [recent])

  const currentWallpaper = wallpapers.find((item) => item.id === wallpaper)?.value ?? wallpapers[0].value
  const open = (id: AppId) => {
    setWindows((current) => {
      const existing = current.find((item) => item.id === id)
      if (existing) return current.map((item) => item.id === id ? { ...item, minimized: false, z: nextZ } : item)
      return [...current, { id, title: appMeta[id].title, z: nextZ }]
    })
    setNextZ((value) => value + 1)
  }
  const focus = (id: AppId) => { setWindows((items) => items.map((item) => item.id === id ? { ...item, z: nextZ } : item)); setNextZ((value) => value + 1) }
  const close = (id: AppId) => setWindows((items) => items.filter((item) => item.id !== id))
  const toggleFavorite = (id: string) => setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  const play = (game: Game) => { setSelectedGame(game); setRecent((items) => [game.id, ...items.filter((id) => id !== game.id)].slice(0, 5)); open('games') }
  const filteredGames = useMemo(() => games.filter((game) => game.name.toLowerCase().includes(search.toLowerCase()) || game.category.toLowerCase().includes(search.toLowerCase())), [search])

  if (!signedIn) return <Login onLogin={() => { localStorage.setItem('noxi-web-session', 'true'); setSignedIn(true) }} />
  return (
    <main className={`noxi-shell ${theme}`} style={{ backgroundImage: currentWallpaper }}>
      <div className="wallpaper-grain" />
      <TopBar onOpen={open} onSignOut={() => { localStorage.removeItem('noxi-web-session'); setSignedIn(false) }} />
      <div className="desktop-icons">
        {(['games', 'chat', 'files', 'downloads'] as AppId[]).map((id) => <DesktopIcon key={id} id={id} open={open} />)}
      </div>
      <AnimatePresence>
        {windows.map((window) => !window.minimized && <Window key={window.id} item={window} onClose={close} onFocus={focus} onMinimize={(id) => setWindows((items) => items.map((item) => item.id === id ? { ...item, minimized: true } : item))} onMaximize={(id) => setWindows((items) => items.map((item) => item.id === id ? { ...item, maximized: !item.maximized } : item))}>
          <AppContent id={window.id} open={open} games={filteredGames} search={search} setSearch={setSearch} favorites={favorites} toggleFavorite={toggleFavorite} play={play} selectedGame={selectedGame} setSelectedGame={setSelectedGame} wallpaper={wallpaper} setWallpaper={setWallpaper} theme={theme} setTheme={setTheme} notice={notice} setNotice={setNotice} recent={recent} />
        </Window>)}
      </AnimatePresence>
      <Dock running={windows} open={open} onRestore={(id) => { focus(id); setWindows((items) => items.map((item) => item.id === id ? { ...item, minimized: false } : item)) }} />
      <AnimatePresence>{notice && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="toast">{notice}<button onClick={() => setNotice('')}><X size={15} /></button></motion.div>}</AnimatePresence>
    </main>
  )
}

function Login({ onLogin }: { onLogin: () => void }) { const [name, setName] = useState('jash'); return <main className="login-screen"><motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="login-card"><div className="noxi-logo">N</div><h1>Noxi Web</h1><p>your web desktop</p><label>Username<input value={name} onChange={(e) => setName(e.target.value)} /></label><label>Password<input type="password" defaultValue="demo-pass" /></label><button onClick={onLogin}>Sign in</button><small>Demo mode — your workspace stays in this browser.</small></motion.section></main> }

function TopBar({ onOpen, onSignOut }: { onOpen: (id: AppId) => void; onSignOut: () => void }) { const [openMenu, setOpenMenu] = useState(false); const time = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()); return <header className="topbar"><button className="topbar-logo" onClick={() => setOpenMenu(!openMenu)}>Noxi <ChevronDown size={13} /></button>{openMenu && <div className="noxi-menu"><button onClick={() => onOpen('profile')}>Profile</button><button onClick={() => onOpen('settings')}>Settings</button><button onClick={onSignOut}>Sign out</button></div>}<span className="active-app">Desktop</span><div className="topbar-status"><Wifi size={15} /><button onClick={() => onOpen('chat')}><Bell size={15} /></button><span>{time}</span><button onClick={() => onOpen('profile')} className="avatar">J</button></div></header> }

function DesktopIcon({ id, open }: { id: AppId; open: (id: AppId) => void }) { const meta = appMeta[id], Icon = meta.icon; return <button className="desktop-icon" onDoubleClick={() => open(id)} onClick={() => open(id)}><span style={{ background: meta.color }}><Icon size={22} /></span>{meta.title}</button> }

function Dock({ running, open, onRestore }: { running: WindowState[]; open: (id: AppId) => void; onRestore: (id: AppId) => void }) { const ids: AppId[] = ['files', 'games', 'chat', 'browser', 'cloud', 'store', 'community', 'settings']; return <nav className="dock" aria-label="Application dock">{ids.map((id) => { const Icon = appMeta[id].icon, item = running.find((window) => window.id === id); return <button key={id} onClick={() => item ? onRestore(id) : open(id)} title={appMeta[id].title}><span style={{ background: appMeta[id].color }}><Icon size={22} /></span>{item && <i />}</button> })}</nav> }

function Window({ item, onClose, onFocus, onMinimize, onMaximize, children }: { item: WindowState; onClose: (id: AppId) => void; onFocus: (id: AppId) => void; onMinimize: (id: AppId) => void; onMaximize: (id: AppId) => void; children: React.ReactNode }) { const meta = appMeta[item.id], Icon = meta.icon; return <Rnd className={`window ${item.maximized ? 'window-maximized' : ''}`} default={{ x: 160 + (item.z % 4) * 28, y: 86 + (item.z % 3) * 26, width: 820, height: 570 }} minWidth={390} minHeight={300} disableDragging={item.maximized} enableResizing={!item.maximized} bounds="parent" style={{ zIndex: item.z }} onMouseDown={() => onFocus(item.id)}><motion.section initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .98 }} className="window-frame"><header className="window-bar"><div className="traffic"><button className="close" onClick={() => onClose(item.id)} aria-label="Close" /><button className="minimize" onClick={() => onMinimize(item.id)} aria-label="Minimize" /><button className="maximize" onClick={() => onMaximize(item.id)} aria-label="Maximize" /></div><div className="window-title"><Icon size={15} />{item.title}</div><button className="window-expand" onClick={() => onMaximize(item.id)}><Maximize2 size={14} /></button></header>{children}</motion.section></Rnd> }

type ContentProps = { id: AppId; open: (id: AppId) => void; games: Game[]; search: string; setSearch: (value: string) => void; favorites: string[]; toggleFavorite: (id: string) => void; play: (game: Game) => void; selectedGame: Game | null; setSelectedGame: (game: Game | null) => void; wallpaper: string; setWallpaper: (id: string) => void; theme: 'dark' | 'light'; setTheme: (value: 'dark' | 'light') => void; notice: string; setNotice: (message: string) => void; recent: string[] }
function AppContent(props: ContentProps) { switch (props.id) { case 'games': return <Games {...props} />; case 'settings': return <SettingsApp {...props} />; case 'chat': return <Chat {...props} />; case 'files': return <Files />; case 'cloud': return <CloudApp setNotice={props.setNotice} />; case 'store': return <Store setNotice={props.setNotice} />; case 'community': return <Community setNotice={props.setNotice} />; case 'browser': return <BrowserApp />; case 'downloads': return <Downloads />; case 'profile': return <Profile />; case 'licenses': return <Licenses />; default: return null } }

function Games({ games: list, search, setSearch, favorites, toggleFavorite, play, selectedGame, setSelectedGame }: ContentProps) { const [category, setCategory] = useState('All Games'); const visible = list.filter((game) => category === 'All Games' || game.category === category); if (selectedGame) return <div className="app-body player"><header><button onClick={() => setSelectedGame(null)}>← Library</button><span>{selectedGame.name}</span><div><button onClick={() => toggleFavorite(selectedGame.id)}><Heart size={16} fill={favorites.includes(selectedGame.id) ? 'currentColor' : 'none'} /></button><button onClick={() => setSelectedGame(null)}><X size={16} /></button></div></header><div className="game-stage"><Gamepad2 size={56} /><h2>{selectedGame.name}</h2><p>This demo launcher is ready for a licensed game build at <code>{selectedGame.path}</code>.</p><button className="primary" onClick={() => window.open(selectedGame.path, '_blank', 'noopener')}>Open game</button></div></div>; return <div className="app-body games-app"><aside><h2>Library</h2><button className={category === 'All Games' ? 'selected' : ''} onClick={() => setCategory('All Games')}>All Games</button>{categories.slice(1).map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}</aside><section><header className="app-header"><div><h1>Games</h1><p>{visible.length} games available</p></div><label className="search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search games" /></label></header><div className="game-grid">{visible.map((game) => <article key={game.id} className="game-card"><div className={`game-art art-${game.id}`}><button onClick={() => toggleFavorite(game.id)}><Heart size={17} fill={favorites.includes(game.id) ? 'currentColor' : 'none'} /></button><span>{game.category}</span></div><h3>{game.name}</h3><p>{game.description}</p><footer><button onClick={() => play(game)}><Play size={15} fill="currentColor" /> Play</button><small>{game.controls}</small></footer></article>)}</div></section></div> }

function SettingsApp({ wallpaper, setWallpaper, theme, setTheme, open }: ContentProps) { return <div className="app-body settings-app"><aside><h2>Settings</h2>{['General', 'Appearance', 'Wallpaper', 'Account', 'Privacy', 'Notifications', 'Games', 'Downloads', 'Chat', 'About', 'Licenses'].map((item) => <button key={item} onClick={() => item === 'Licenses' && open('licenses')}>{item}</button>)}</aside><section><h1>Appearance</h1><p className="muted">Personalize your Noxi Web desktop.</p><div className="settings-row"><div><strong>Theme</strong><span>Use light or dark window surfaces.</span></div><div className="segmented"><button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}><Moon size={15} /> Dark</button><button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}><Sun size={15} /> Light</button></div></div><div className="wallpapers"><h3>Wallpaper</h3><div>{wallpapers.map((item) => <button className={wallpaper === item.id ? 'selected' : ''} key={item.id} onClick={() => setWallpaper(item.id)}><span style={{ backgroundImage: item.value }} /><small>{item.name}</small></button>)}</div></div></section></div> }

function Chat({ setNotice }: ContentProps) { const [message, setMessage] = useState(''); const [messages, setMessages] = useState([{ name: 'Luna', text: 'Anyone trying Orbit today?', time: '9:41 PM' }, { name: 'Mika', text: 'Just added it to my favorites.', time: '9:43 PM' }]); const send = () => { if (!message.trim()) return; setMessages((items) => [...items, { name: 'jash', text: message, time: 'now' }]); setMessage(''); setNotice('Message sent') }; return <div className="app-body chat-app"><aside><h2>Chat</h2><button className="selected"># global</button><button>Friends <span>2</span></button><button>Direct messages</button><hr /><div className="online"><i />Luna</div><div className="online"><i />Mika</div></aside><section><header><div><h2># global</h2><span>2 online</span></div><button onClick={() => setNotice('Notifications muted for this channel')}>•••</button></header><div className="messages">{messages.map((item, index) => <article key={index}><div className="avatar small">{item.name[0]}</div><div><b>{item.name}</b><small>{item.time}</small><p>{item.text}</p></div></article>)}</div><form onSubmit={(e) => { e.preventDefault(); send() }}><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message #global" /><button>Send</button></form></section></div> }

function Files() { return <div className="app-body files-app"><aside><h2>Files</h2>{['Home', 'Downloads', 'Games', 'Wallpapers', 'Themes', 'Documents'].map((item) => <button key={item}><Folder size={16} />{item}</button>)}</aside><section><header><span>Home</span><button><LayoutGrid size={16} /></button></header><div className="file-grid">{['Downloads', 'Games', 'Wallpapers', 'Themes', 'Documents'].map((item) => <article key={item}><Folder size={34} fill="#ffd05f" color="#ffd05f" /><span>{item}</span></article>)}</div><p className="virtual-note">These are virtual Noxi Web files. They do not access your device’s folders.</p></section></div> }

function CloudApp({ setNotice }: Pick<ContentProps, 'setNotice'>) { return <div className="app-body centered-app"><Cloud size={42} /><h1>Cloud Gaming</h1><p>Use your own legitimate cloud-gaming account.</p><button className="primary" onClick={() => { window.open('https://play.geforcenow.com/', '_blank', 'noopener'); setNotice('Opening GeForce NOW') }}>Open GeForce NOW</button><small>Noxi Web does not collect or store third-party credentials.</small></div> }
function Store({ setNotice }: Pick<ContentProps, 'setNotice'>) { return <div className="app-body store-app"><header className="app-header"><div><h1>Store</h1><p>Free items for your desktop</p></div></header><div className="store-list">{['Midnight wallpaper', 'Focus theme', 'Orbit game skin'].map((item) => <article key={item}><div /><span><b>{item}</b><small>Free</small></span><button onClick={() => setNotice(`${item} added to your collection`)}>Add</button></article>)}</div></div> }
function Community({ setNotice }: Pick<ContentProps, 'setNotice'>) { return <div className="app-body community-app"><header className="app-header"><div><h1>Community</h1><p>Wallpapers, setups, and recommendations</p></div><button className="primary" onClick={() => setNotice('Publishing opens when a connected account service is configured')}>Publish</button></header><article className="community-post"><div className="post-art" /><div><span>from Luna</span><h2>soft violet workspace</h2><p>A quiet setup for long evenings.</p><button onClick={() => setNotice('Added to favorites')}><Heart size={16} /> Favorite</button></div></article></div> }
function BrowserApp() { const [address, setAddress] = useState('https://noxi.lol'); return <div className="app-body browser-app"><form onSubmit={(e) => { e.preventDefault(); window.open(address.startsWith('http') ? address : `https://${address}`, '_blank', 'noopener') }}><Globe size={16} /><input value={address} onChange={(e) => setAddress(e.target.value)} /><button>Open</button></form><section><Compass size={34} /><h2>Browser</h2><p>Open a link in your normal browser.</p><div><a href="https://noxi.lol" target="_blank">Noxi</a><a href="https://play.geforcenow.com" target="_blank">GeForce NOW</a></div></section></div> }
function Downloads() { return <div className="app-body downloads-app"><h1>Downloads</h1><p className="muted">Downloads appear here when a permitted game package is available.</p><div className="empty-state"><Download size={32} /><span>No downloads yet</span></div></div> }
function Profile() { return <div className="app-body profile-app"><div className="profile-hero"><div className="avatar big">J</div><div><h1>jash</h1><p>online</p></div></div><div className="profile-row"><span>Joined</span><strong>October 2026</strong></div><div className="profile-row"><span>Favorite games</span><strong>Orbit, Driftline</strong></div></div> }
function Licenses() { return <div className="app-body licenses-app"><h1>Credits & licenses</h1><p>Noxi Web code is kept separate from third-party game content.</p><article><h2>Selenite Old</h2><p>Upstream project: selenite-cc/selenite-old</p><p>License: GNU GPL v3. Game content is not bundled in this demo build. Review <code>/licenses/SELENITE-OLD.md</code> before adding or redistributing upstream content.</p><a href="https://github.com/selenite-cc/selenite-old" target="_blank">View upstream project ↗</a></article></div> }

export default App
