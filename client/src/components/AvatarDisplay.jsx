import { getAvatarById } from '../data/avatars'

/**
 * Renders a player's avatar. Falls back to initial letter when avatar_id is null.
 */
export default function AvatarDisplay({ player, size = 48, className = '' }) {
  const sizeNum = typeof size === 'number' ? size : 48
  const cx = sizeNum / 2
  const cy = sizeNum / 2

  if (!player.avatar_id) {
    const initial = (player.name || '?')[0].toUpperCase()
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-retro-cream/20 border-2 border-retro-cream/40 font-display text-retro-cream ${className}`}
        style={{ width: sizeNum, height: sizeNum, fontSize: sizeNum * 0.45 }}
        aria-hidden
      >
        {initial}
      </div>
    )
  }

  const avatar = getAvatarById(player.avatar_id)
  const { id, color } = avatar

  const paths = {
    avatar_01: <circle cx={cx} cy={cy} r={sizeNum * 0.375} fill={color} />,
    avatar_02: (
      <polygon
        points={`${cx},${cy - sizeNum * 0.375} ${cx + sizeNum * 0.375},${cy + sizeNum * 0.29} ${cx - sizeNum * 0.375},${cy + sizeNum * 0.29}`}
        fill={color}
      />
    ),
    avatar_03: (
      <polygon
        points={`${cx},${cy - sizeNum * 0.375} ${cx + sizeNum * 0.325},${cy - sizeNum * 0.19} ${cx + sizeNum * 0.325},${cy + sizeNum * 0.19} ${cx},${cy + sizeNum * 0.375} ${cx - sizeNum * 0.325},${cy + sizeNum * 0.19} ${cx - sizeNum * 0.325},${cy - sizeNum * 0.19}`}
        fill={color}
      />
    ),
    avatar_04: (
      <polygon
        points={`${cx},${cy - sizeNum * 0.375} ${cx + sizeNum * 0.375},${cy} ${cx},${cy + sizeNum * 0.375} ${cx - sizeNum * 0.375},${cy}`}
        fill={color}
      />
    ),
    avatar_05: (
      <rect
        x={cx - sizeNum * 0.29}
        y={cy - sizeNum * 0.29}
        width={sizeNum * 0.58}
        height={sizeNum * 0.58}
        fill={color}
      />
    ),
    avatar_06: (
      <polygon
        points={`${cx},${cy - sizeNum * 0.33} ${cx + sizeNum * 0.32},${cy - sizeNum * 0.1} ${cx + sizeNum * 0.2},${cy + sizeNum * 0.27} ${cx - sizeNum * 0.2},${cy + sizeNum * 0.27} ${cx - sizeNum * 0.32},${cy - sizeNum * 0.1}`}
        fill={color}
      />
    ),
    avatar_07: (
      <polygon
        points={`${cx},${cy - sizeNum * 0.375} ${cx + sizeNum * 0.12},${cy - sizeNum * 0.12} ${cx + sizeNum * 0.375},${cy} ${cx + sizeNum * 0.12},${cy + sizeNum * 0.12} ${cx},${cy + sizeNum * 0.375} ${cx - sizeNum * 0.12},${cy + sizeNum * 0.12} ${cx - sizeNum * 0.375},${cy} ${cx - sizeNum * 0.12},${cy - sizeNum * 0.12}`}
        fill={color}
      />
    ),
    avatar_08: (
      <polygon
        points={`${cx},${cy - sizeNum * 0.33} ${cx + sizeNum * 0.235},${cy - sizeNum * 0.235} ${cx + sizeNum * 0.33},${cy} ${cx + sizeNum * 0.235},${cy + sizeNum * 0.235} ${cx},${cy + sizeNum * 0.33} ${cx - sizeNum * 0.235},${cy + sizeNum * 0.235} ${cx - sizeNum * 0.33},${cy} ${cx - sizeNum * 0.235},${cy - sizeNum * 0.235}`}
        fill={color}
      />
    ),
  }

  return (
    <svg
      viewBox={`0 0 ${sizeNum} ${sizeNum}`}
      className={className}
      style={{ width: sizeNum, height: sizeNum }}
      aria-hidden
    >
      {paths[id] ?? paths.avatar_01}
    </svg>
  )
}
