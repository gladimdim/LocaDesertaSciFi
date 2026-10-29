// Curated structure of the universe for the home page: factions, eras, artwork.
import { allNotes, type Note } from "./notes"
import type { Lang } from "./site"

const IMG = "/media/Images/Universe/Hetmanate-Federation/"
export const ART = {
  hero: IMG + "SpaceCossacks/Rider_Terminator_Lancer.png",
  heroAlt: IMG + "SpaceCossacks/Three_Riding_Terminators_Galoop.png",
  hetman: IMG + "SpaceCossacks/Three_Riders_Terminators.png",
  history: IMG + "After_Battle_Steppe.jpg",
  warp: IMG + "Ships/Ship_Darya_6.png",
  europa: IMG + "Ships/Hetmanate_Patrol_Dawn.png",
  game: "/media/Images/Games/Game_Preview.jpg",
  murids: IMG + "Murid_Metal_Smelting.jpg",
}

// a few pieces for the "archive" strip on the home page
export const GALLERY = [
  "SpaceCossacks/Terminator_On_Moon.png",
  "Ships/Lom_Gold_Rear.png",
  "Cossack_WarCamp.jpg",
  "Ships/Ship_Darya_4.png",
  "Dubolom_Fist.jpg",
  "Ships/Hetmanate_Patrol_Nightside.png",
  "Ivan_Sulima_Poltava.jpg",
  "Ships/Sokil_1.png",
  "Odin_Za_Vsih.jpg",
  "SpaceCossacks/Cossack_Baida.png",
].map((p) => IMG + p)

/** note in `lang` with this translationKey (falls back to Ukrainian, then English) */
export async function byKey(key: string, lang: Lang): Promise<Note | undefined> {
  const notes = (await allNotes()).filter((n) => n.data.translationKey === key)
  return notes.find((n) => n.data.lang === lang) ?? notes.find((n) => n.data.lang === "uk") ?? notes[0]
}

export const FACTIONS = [
  { key: "universe/empires/hetmanate-federation/hetmanate-federation", faction: "hetman", art: ART.hetman, motto: { uk: "Зоряна Січ · надскупчення Діви", en: "Star Sich · Virgo Supercluster", de: "Sternen-Sitsch · Virgo-Superhaufen" } },
  { key: "universe/empires/corporate-republic/corporate-republic", faction: "corp", art: undefined, motto: { uk: "Star Washington · надскупчення Кентавра", en: "Star Washington · Centaurus Supercluster", de: "Star Washington · Centaurus-Superhaufen" } },
  { key: "universe/empires/sun-empire/sun-empire", faction: "sun", art: undefined, motto: { uk: "Star Shanghai · надскупчення Риби-Кита", en: "Star Shanghai · Pisces–Cetus Supercluster", de: "Star Shanghai · Fische-Walfisch-Superhaufen" } },
] as const

export const CODEX_LINKS = [
  { key: "universe/history/main-history-of-the-universe", art: ART.history, faction: "deck" },
  { key: "universe/technologies/warp/warp", art: ART.warp, faction: "deck" },
  { key: "universe/europa-jovian/europa-jovian", art: ART.europa, faction: "europa" },
] as const

type L = Record<Lang, string>
export interface Era { year: L; key?: string; book?: string; title?: L; text?: L }
// chronological; `key` links to a history note, `book` to a book (uk id)
export const ERAS: Era[] = [
  { year: { uk: "1990 СЕ", en: "1990 OE", de: "1990 AE" }, key: "universe/history/destruction-of-africa" },
  { year: { uk: "0 ЗЕ · 2143", en: "0 SE · 2143", de: "0 SE · 2143" }, key: "universe/history/stellar-era", title: { uk: "Перший варп-стрибок", en: "The first warp jump", de: "Der erste Warpsprung" }, text: { uk: "Перший вдалий варп-перехід із людьми. Людство отримує доступ до будь-якої зірки — починається Зоряна Епоха.", en: "The first successful crewed warp transition. Humanity can reach any star — the Star Era begins.", de: "Der erste erfolgreiche bemannte Warpübergang. Jeder Stern wird erreichbar — die Sternenära beginnt." } },
  { year: { uk: "33 ЗЕ", en: "33 SE", de: "33 SE" }, key: "universe/history/martian-division-of-the-world" },
  { year: { uk: "87–96 ЗЕ", en: "87–96 SE", de: "87–96 SE" }, key: "universe/history/great-departure" },
  { year: { uk: "281 ЗЕ", en: "281 SE", de: "281 SE" }, title: { uk: "Засновано «Дике Поле 17»", en: "Wild Fields 17 is founded", de: "Gründung von „Wilde Felder 17“" }, text: { uk: "Гірничодобувна колонія в одній із найвіддаленіших систем галактики — чорній плямі на зоряних мапах.", en: "A mining colony in one of the most remote systems of the galaxy — a black spot on the star charts.", de: "Eine Bergbaukolonie in einem der entlegensten Systeme der Galaxis — ein schwarzer Fleck auf den Sternkarten." } },
  { year: { uk: "~485 ЗЕ", en: "~485 SE", de: "~485 SE" }, book: "Books/Повстання-Мюридів/Повстання-Мюридів", title: { uk: "Повстання Мюридів", en: "The Murid Uprising", de: "Der Muridenaufstand" }, text: { uk: "Система Мюрид виходить з-під влади Зоряного Коша. Три армії гайдуків придушують повстання за три роки.", en: "The Murid system breaks away from the Star Kish. Three haiduk armies crush the uprising in three years.", de: "Das Murid-System sagt sich vom Sternen-Kosch los. Drei Haiduken-Armeen schlagen den Aufstand in drei Jahren nieder." } },
  { year: { uk: "~495 ЗЕ", en: "~495 SE", de: "~495 SE" }, book: "Books/Зоряний-Гетьманат/Зоряний-Гетьманат", title: { uk: "Облога Дикого Поля 17", en: "The Siege of Wild Fields 17", de: "Die Belagerung von Wilde Felder 17" }, text: { uk: "Імперія Сонця атакує віддалену колонію. Облога стає початком Першої Великої Війни трьох імперій.", en: "The Empire of the Sun strikes the remote colony. The siege becomes the opening of the First Great War of the three empires.", de: "Das Sonnenimperium greift die ferne Kolonie an. Die Belagerung eröffnet den Ersten Großen Krieg der drei Imperien." } },
]

export const START_BOOK: Record<Lang, string> = {
  uk: "Books/Зоряний-Гетьманат/Зоряний-Гетьманат",
  en: "en/Books/Space-Hetmanate/Space-Hetmanate",
  de: "en/Books/Space-Hetmanate/Space-Hetmanate",
}
export const GAME: Record<Lang, string> = {
  uk: "Ігри/Loca-Deserta-Settlers",
  en: "en/Games/Loca-Deserta-Settlers",
  de: "de/Spiele/Loca-Deserta-Settlers",
}
export const CODEX_ROOT: Record<Lang, string> = { uk: "Всесвіт", en: "en/Universe", de: "en/Universe" }
