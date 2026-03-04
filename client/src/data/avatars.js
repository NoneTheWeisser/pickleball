/**
 * Placeholder avatar gallery — geometric shapes in retro palette.
 * Swap for custom graphics later; avatar_id and data flow stay the same.
 */

export const AVATAR_GALLERY = [
  { id: 'avatar_01', label: 'Circle', color: '#00ff88' },
  { id: 'avatar_02', label: 'Triangle', color: '#00d4ff' },
  { id: 'avatar_03', label: 'Hexagon', color: '#ff1493' },
  { id: 'avatar_04', label: 'Diamond', color: '#ffd700' },
  { id: 'avatar_05', label: 'Square', color: '#fffef0' },
  { id: 'avatar_06', label: 'Pentagon', color: '#00ff88' },
  { id: 'avatar_07', label: 'Star', color: '#00d4ff' },
  { id: 'avatar_08', label: 'Octagon', color: '#ff1493' },
]

export function getAvatarById(avatarId) {
  return AVATAR_GALLERY.find((a) => a.id === avatarId) ?? AVATAR_GALLERY[0]
}
