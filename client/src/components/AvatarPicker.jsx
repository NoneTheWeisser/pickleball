import { AVATAR_GALLERY } from '../data/avatars'
import PlayerCard from './PlayerCard'

/**
 * Grid of avatar cards for selection. Used when creating or editing a player.
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
            className={`p-0 rounded border-2 transition-all overflow-hidden aspect-square
              ${isSelected
                ? 'border-retro-green shadow-retro-glow'
                : 'border-retro-cream/20 hover:border-retro-cyan/50 bg-retro-card'
              }`}
            aria-pressed={isSelected}
            aria-label={`Select ${avatar.label} avatar`}
          >
            <PlayerCard player={fakePlayer} hideLabel />
          </button>
        )
      })}
    </div>
  )
}
