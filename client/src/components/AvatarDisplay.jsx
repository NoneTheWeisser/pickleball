import { getAvatarById } from '../data/avatars'

/**
 * Renders a player's avatar. Uses image when avatar has src; falls back to initial letter when avatar_id is null.
 */
export default function AvatarDisplay({ player, size = 48, className = '' }) {
  const sizeNum = typeof size === 'number' ? size : 48

  if (!player.avatar_id) {
    const initial = (player.name || '?')[0].toUpperCase()
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-retro-cream/20 border-2 border-retro-cream/40 font-display text-retro-cream overflow-hidden ${className}`}
        style={{ width: sizeNum, height: sizeNum, fontSize: sizeNum * 0.45 }}
        aria-hidden
      >
        {initial}
      </div>
    )
  }

  const avatar = getAvatarById(player.avatar_id)
  if (avatar.src) {
    return (
      <img
        src={avatar.src}
        alt=""
        className={`object-cover rounded-full ${className}`}
        style={{ width: sizeNum, height: sizeNum }}
        aria-hidden
      />
    )
  }

  // Fallback for any legacy avatar_ids without src (e.g. old avatar_01, avatar_06-08)
  const initial = (player.name || '?')[0].toUpperCase()
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-retro-cream/20 border-2 border-retro-cream/40 font-display text-retro-cream overflow-hidden ${className}`}
      style={{ width: sizeNum, height: sizeNum, fontSize: sizeNum * 0.45 }}
      aria-hidden
    >
      {initial}
    </div>
  )
}
