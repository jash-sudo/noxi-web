export type GameCategory = 'Action' | 'Arcade' | 'Sports' | 'Strategy' | 'Racing' | 'Puzzle' | 'Multiplayer' | 'Classic' | 'Other'

export type Game = {
  id: string
  name: string
  description: string
  category: GameCategory
  path: string
  source: string
  license: string
  controls: string
  featured?: boolean
  tags: string[]
}

// Registry only: third-party game files are kept separate under games/third-party.
// Do not add a game without recording its upstream license and attribution.
export const games: Game[] = [
  { id: 'drift', name: 'Driftline', description: 'A focused arcade driving session.', category: 'Racing', path: '/games/driftline/', source: 'Noxi demo', license: 'Demo content', controls: 'Arrow keys', featured: true, tags: ['driving', 'arcade'] },
  { id: 'orbit', name: 'Orbit', description: 'Keep the signal alive through a changing field.', category: 'Arcade', path: '/games/orbit/', source: 'Noxi demo', license: 'Demo content', controls: 'Mouse / touch', featured: true, tags: ['reaction', 'arcade'] },
  { id: 'chess', name: 'Boardroom', description: 'A quiet classic for a short break.', category: 'Strategy', path: '/games/boardroom/', source: 'Noxi demo', license: 'Demo content', controls: 'Mouse / touch', tags: ['classic', 'strategy'] },
  { id: 'blocks', name: 'Blocks', description: 'Simple, quick, and familiar.', category: 'Puzzle', path: '/games/blocks/', source: 'Noxi demo', license: 'Demo content', controls: 'Arrow keys', tags: ['puzzle', 'classic'] },
]

export const categories: Array<GameCategory | 'All Games'> = ['All Games', 'Action', 'Arcade', 'Sports', 'Strategy', 'Racing', 'Puzzle', 'Multiplayer', 'Classic', 'Other']
