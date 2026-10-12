const BACK_VOWELS = 'aıou'
const ALL_VOWELS = 'aıoueiöü'
const VOICELESS = 'fstkçşhp'

/** Locative suffix with vowel harmony and consonant assimilation: Bayrampaşa’da, Esenler’de, Tekstilkent’te. */
export function locative(name: string) {
  const lower = name.toLocaleLowerCase('tr-TR')
  const lastVowel = [...lower].reverse().find((ch) => ALL_VOWELS.includes(ch)) ?? 'e'
  const vowel = BACK_VOWELS.includes(lastVowel) ? 'a' : 'e'
  const consonant = VOICELESS.includes(lower.at(-1) ?? '') ? 't' : 'd'
  return `${name}’${consonant}${vowel}`
}
