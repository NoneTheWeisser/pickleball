/**
 * Common first names — used to reward mashups that land on a real name.
 * Lowercase; matching is exact on the blended combo.
 */
export const REAL_FIRST_NAMES = new Set([
  'aaron', 'adam', 'alan', 'alice', 'alicia', 'allison', 'alyssa', 'amanda', 'amber',
  'amy', 'andrea', 'andrew', 'andy', 'angela', 'anna', 'anne', 'annie', 'anthony',
  'ashley', 'austin', 'barbara', 'ben', 'beth', 'betty', 'beverly', 'bill', 'billy',
  'bob', 'bobby', 'bonnie', 'brad', 'brandon', 'brenda', 'brian', 'brittany', 'bruce',
  'bryan', 'caitlin', 'carl', 'carol', 'caroline', 'carolyn', 'catherine', 'charles',
  'charlotte', 'cheryl', 'chris', 'christina', 'christine', 'cindy', 'claire', 'cody',
  'cole', 'colin', 'connie', 'crystal', 'cynthia', 'dale', 'dan', 'dana', 'daniel',
  'danielle', 'danny', 'darlene', 'david', 'dawn', 'dean', 'debbie', 'deborah', 'denise',
  'dennis', 'diana', 'diane', 'don', 'donald', 'donna', 'doris', 'dorothy', 'doug',
  'douglas', 'dylan', 'eddie', 'edith', 'edward', 'elizabeth', 'emily', 'emma', 'eric',
  'erica', 'erin', 'ernest', 'ethan', 'eugene', 'evelyn', 'frances', 'frank', 'fred',
  'gabriel', 'gary', 'george', 'gerald', 'gloria', 'grace', 'greg', 'hannah', 'harold',
  'harry', 'heather', 'helen', 'henry', 'holly', 'howard', 'jack', 'jackie', 'jacob',
  'jake', 'james', 'jamie', 'jan', 'jane', 'janet', 'janice', 'jason', 'jean', 'jeff',
  'jennifer', 'jenny', 'jeremy', 'jerry', 'jesse', 'jessica', 'jill', 'jim', 'joan',
  'jocelyn', 'jodi', 'joe', 'joel', 'john', 'johnny', 'jon', 'jonathan', 'jordan',
  'jose', 'joseph', 'josh', 'joshua', 'joyce', 'juan', 'judith', 'judy', 'julia',
  'julie', 'justin', 'karen', 'kate', 'katherine', 'kathleen', 'kathy', 'katie', 'kayla',
  'keith', 'kelly', 'ken', 'kenneth', 'kevin', 'kim', 'kimberly', 'kyle', 'larry',
  'laura', 'lauren', 'lawrence', 'linda', 'lisa', 'lori', 'lorraine', 'louis', 'louise',
  'lucas', 'luke', 'lynn', 'mandy', 'marc', 'margaret', 'maria', 'marie', 'marilyn',
  'mark', 'martha', 'martin', 'mary', 'matt', 'matthew', 'megan', 'melissa', 'michael',
  'michelle', 'mike', 'miley', 'nancy', 'natalie', 'nathan', 'nicholas', 'nick', 'nicole',
  'norma', 'pamela', 'patricia', 'patrick', 'paul', 'paula', 'peter', 'philip', 'rachel',
  'ralph', 'randy', 'raymond', 'rebecca', 'richard', 'rita', 'robert', 'robin', 'roger',
  'ronald', 'rose', 'roy', 'russell', 'ruth', 'ryan', 'samantha', 'samuel', 'sandra',
  'sara', 'sarah', 'scott', 'sean', 'sharon', 'shirley', 'sophia', 'stacey', 'stannie',
  'stephanie', 'stephen', 'steve', 'steven', 'sue', 'susan', 'tammy', 'taylor', 'teresa',
  'terry', 'theresa', 'thomas', 'tim', 'timothy', 'tina', 'toby', 'tom', 'tony',
  'tyler', 'victor', 'vincent', 'virginia', 'walter', 'wayne', 'wendy', 'william',
])

export function isRealFirstName(combo) {
  return REAL_FIRST_NAMES.has(combo)
}
