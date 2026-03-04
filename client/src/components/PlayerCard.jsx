import { getAvatarById } from '../data/avatars'

/**
 * Card-style tile: image fills the container, name/label strip at bottom.
 * Used for SessionSetup player grid and AvatarPicker.
 */
export default function PlayerCard({ player, label, hideLabel = false, className = '' }) {
  const displayLabel = label ?? player?.name ?? ''
  const avatarId = player?.avatar_id
  const avatar = avatarId ? getAvatarById(avatarId) : null
  const hasImage = avatar?.src

  return (
    <div
      className={`flex flex-col w-full h-full min-h-0 overflow-hidden rounded ${className}`}
      aria-hidden
    >
      <div className="flex-1 min-h-0 relative bg-retro-cream/10">
        {hasImage ? (
          <img
            src={avatar.src}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-retro-cream/20 border-b border-retro-cream/20">
            <span className="font-display text-retro-cream text-4xl">
              {(player?.name || '?')[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>
      {!hideLabel && (
        <div className="px-2 py-1.5 bg-retro-dark/90 border-t border-retro-cream/20">
          <span className="font-mono text-xs text-retro-cream truncate block text-center">
            {displayLabel || '\u00A0'}
          </span>
        </div>
      )}
    </div>
  )
}
