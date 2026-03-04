import { AVATAR_GALLERY } from '../data/avatars'
import AvatarDisplay from './AvatarDisplay'

/**
 * Grid of avatars for selection. Used when creating or editing a player.
 */
export default function AvatarPicker({ selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {AVATAR_GALLERY.map((avatar) => {
        const isSelected = selectedId === avatar.id
        const fakePlayer = { name: '', avatar_id: avatar.id }
        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`p-2 rounded border-2 transition-all flex items-center justify-center
              ${isSelected
                ? 'border-retro-green bg-retro-green/10 shadow-retro-glow'
                : 'border-retro-cream/20 hover:border-retro-cyan/50 bg-retro-card'
              }`}
            aria-pressed={isSelected}
            aria-label={`Select ${avatar.label} avatar`}
          >
            <AvatarDisplay player={fakePlayer} size={40} />
          </button>
        )
      })}
    </div>
  )
}
