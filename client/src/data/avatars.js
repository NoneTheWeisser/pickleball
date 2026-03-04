/**
 * Avatar gallery — character images from client/img.
 * avatar_id in DB maps to id; AvatarDisplay renders img when src present.
 */

import avatar02 from '../../img/avatar_02.png'
import avatar03 from '../../img/avatar_03.png'
import avatar04 from '../../img/avatar_04.png'
import avatar05 from '../../img/avatar_05.png'
import aviators from '../../img/aviators.png'
import blondeFriendly from '../../img/blonde_friendly.png'
import braidsCap from '../../img/braids_cap.png'
import bunny from '../../img/bunny.png'
import eagle from '../../img/eagle.png'
import friendlyFemale from '../../img/friendly_female.png'
import friendlySweatband from '../../img/friendly_sweatband.png'
import friendlySweatband2 from '../../img/friendly_sweatband_2.png'
import frog from '../../img/frog.png'
import glassesBangs from '../../img/glasses_bangs.png'
import intenseFemale from '../../img/intense_female.png'
import intenseSweatband from '../../img/intense_sweatband.png'
import raccoon from '../../img/raccoon.png'
import squirrel from '../../img/squirrel.png'
import turtle from '../../img/turtle.png'
import animal from '../../img/animal.png'

export const AVATAR_GALLERY = [
  { id: 'avatar_02', label: 'Avatar 2', src: avatar02 },
  { id: 'avatar_03', label: 'Avatar 3', src: avatar03 },
  { id: 'avatar_04', label: 'Avatar 4', src: avatar04 },
  { id: 'avatar_05', label: 'Avatar 5', src: avatar05 },
  { id: 'aviators', label: 'Aviators', src: aviators },
  { id: 'blonde_friendly', label: 'Blonde', src: blondeFriendly },
  { id: 'braids_cap', label: 'Braids', src: braidsCap },
  { id: 'bunny', label: 'Bunny', src: bunny },
  { id: 'eagle', label: 'Eagle', src: eagle },
  { id: 'friendly_female', label: 'Friendly', src: friendlyFemale },
  { id: 'friendly_sweatband', label: 'Sweatband', src: friendlySweatband },
  { id: 'friendly_sweatband_2', label: 'Sweatband 2', src: friendlySweatband2 },
  { id: 'frog', label: 'Frog', src: frog },
  { id: 'glasses_bangs', label: 'Glasses', src: glassesBangs },
  { id: 'intense_female', label: 'Intense', src: intenseFemale },
  { id: 'intense_sweatband', label: 'Intense Sweatband', src: intenseSweatband },
  { id: 'raccoon', label: 'Raccoon', src: raccoon },
  { id: 'squirrel', label: 'Squirrel', src: squirrel },
  { id: 'turtle', label: 'Turtle', src: turtle },
  { id: 'animal', label: 'Animal', src: animal },
]

export function getAvatarById(avatarId) {
  const found = AVATAR_GALLERY.find((a) => a.id === avatarId)
  return found ?? AVATAR_GALLERY[0]
}
