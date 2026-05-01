import fs from "node:fs"
import path from "node:path"

const root = process.cwd()

const q = (value) => JSON.stringify(value)
const stripFrontmatter = (text) => text.replace(/^---\n[\s\S]*?\n---\n+/, "")
const slugUrl = (relPath) => {
  if (relPath === "index.md") return "/"
  let slug = relPath
    .replace(/\.md$/, "")
    .replace(/\s/g, "-")
    .replace(/\/index$/, "")
  if (slug === "en/index") slug = "en"
  return `/${slug}`
}

const frontmatter = ({ title, lang, translationKey, translations }) => {
  const lines = [
    "---",
    `title: ${q(title)}`,
    `lang: ${q(lang)}`,
    `translationKey: ${q(translationKey)}`,
    "translations:",
  ]
  for (const [langKey, href] of Object.entries(translations)) {
    lines.push(`  ${langKey}: ${q(href)}`)
  }
  lines.push("---", "")
  return lines.join("\n")
}

const entries = [
  {
    source: "content/index.md",
    titleUk: "Loca Deserta SciFi Universe",
    titleEn: "Loca Deserta SciFi Universe",
    en: "content/en/index.md",
    body: `Explore the universe:

- [[universe/history/main-history-of-the-universe|Main History of the Universe]]
- [[universe/empires/hetmanate-federation/hetmanate-federation|Hetmanate Federation]]
- [[universe/empires/corporate-republic/corporate-republic|Corporate Republic]]
- [[universe/empires/sun-empire/sun-empire|Empire of the Sun]]

## Books

The book texts are kept in Ukrainian only:

[[../Books/Вістря Кулаку/Вістря Кулаку|Blade of the Fist]] (second book, in progress)

[[../Books/Зустріч в степу/Зустріч в степу|Meeting in the Steppe]] (short story)

[[../Books/Зоряний Гетьманат/Зоряний Гетьманат|Star Hetmanate]] (first book in the universe)
`,
  },
  {
    source: "content/Всесвіт/Європа Юпітерна/Європа Юпітерна.md",
    titleUk: "Європа Юпітерна",
    titleEn: "Jovian Europa",
    en: "content/en/universe/europa-jovian/europa-jovian.md",
    body: `Jovian Europa was founded as a research station where scientists from different empires and planets worked together to create [[../technologies/warp/warp|warp]]. Over time it became the capital of the Solar System. It was established in ancient times, during the first era of solar spaceflight on gravity engines. Its name comes from Jupiter's moon Europa. As many different moons named "Europa" appeared over time, the moon in the Solar System became known as "Jovian Europa."

A jump requires a massive body with gravity, such as Jupiter, that can accelerate a reactor using lawrencium or nobelium and fold space into a corridor leading to another point in space. That is why scientists chose Jovian Europa as the laboratory for all their experiments. To keep politicians and imperial leaders from threatening scientific development, the zone was made demilitarized and any military presence was forbidden. It was funded equally by all three empires.

## Scientists

Everyone who went to work on Jovian Europa renounced their subjects' oaths and citizenships, swearing to serve only the advancement of humanity and science. Experiments on the station could not be used to invent military weapons.

## Science

The scientists at this research station developed the first [[../technologies/warp/warp|warp]] engine.

## Invention of the Warp Engine

The result of decades of work by the independent station and the combined efforts of all empires was the [[first-warp-jump|First Warp Jump]]. After the events of the [[uprising-of-science|Uprising of Science]], Jovian Europa gained full control over [[../technologies/warp/warp|warp]] crossings and warp-jump technology in general. Only Jovian Europa could create, design, maintain, and sell warp engines. For all users, the warp engine was a black box. Later, Jovian Europa also gained exclusive control over warp-jump permits once it began routing jumps for all three empires on request.

## Politics

At first, the station existed purely as a scientific institution for all three empires. Imperial leaders always knew that any invention made there, even one created by former subjects of a rival empire, would become available to the other two. Because of this spirit of liberty and free exchange of information, the station gradually pulled away from imperial influence and began acting as an independent political force. After the crisis during the [[uprising-of-science|Uprising of Science]], it legally secured full independence from outside influence and gained enormous leverage over everyone else: [[../technologies/warp/warp|warp crossings]]. This technology became the core around which the influence of Jovian Europa and the Council of Science over the other empires was built. Without Europa's permission and routing, no one could jump through warp or deploy [[../technologies/warp/warp-beacon|warp beacons]] for successors.

Several centuries after its founding, Jovian Europa adopted a completely agnostic position toward all empires. All of them recognized the supremacy of the Council of Science, and in any dispute the final word belonged to Jovian Europa. Europa could also "help" and "advise" in choosing the next emperor of any empire to advance its own interests. None of the empires liked this, but being cut off from warp crossings meant near-total death and collapse for a state.
`,
  },
  {
    source: "content/Всесвіт/Європа Юпітерна/Перший Варп Стрибок.md",
    titleUk: "Перший Варп Стрибок",
    titleEn: "First Warp Jump",
    en: "content/en/universe/europa-jovian/first-warp-jump.md",
    body: `The first three interstellar guests were the heads of the [[../technologies/warp/warp|warp]] engine development departments, each representing one of the earthly pre-stellar empires. Before humans were launched, there had been about forty successful launches of animals and plants. The journey was programmed so that after two days on the far side of warp, the ship would initiate a warp transition back to the Wastes of Jupiter. Once enough evidence had been gathered that warp travel was safe and that time stayed synchronized, with animals returning neither younger nor older, the first interstellar cosmonauts were approved. The transition was programmed for three days near Alpha Centauri with an automatic return, though if the human warp jump succeeded, the crew was to return after two Earth days.

The launch was broadcast to all five inhabited bodies of the Solar System: Earth, Mars, Europa, the Moon, and Earth's first artificial satellite. About twenty billion people from every empire watched the ship depart Europa and head toward the Wastes of Jupiter for the warp jump. In the Wastes themselves, the cosmonauts sent their final signal, "Hayda," and vanished from the radars of the Solar System. The gravitational wave of the transition shook the planets, though only instruments registered it.

Two Earth days later, another gravitational wave struck the sensors placed around the Wastes. Only a few hours after that, Europa received a video signal from the cosmonauts. The astronomical time of their return from warp became the start of a new [[../history/stellar-era|Stellar Era]], or SE. Humanity gained access to any star.
`,
  },
  {
    source: "content/Всесвіт/Європа Юпітерна/Повстання Науки.md",
    titleUk: "Повстання Науки",
    titleEn: "Uprising of Science",
    en: "content/en/universe/europa-jovian/uprising-of-science.md",
    body: "",
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Імперія Сонця.md",
    titleUk: "Імперія Сонця",
    titleEn: "Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/sun-empire.md",
    body: `# Empire of the Sun

The Empire of the Sun was founded in 1895, or 248 years before the Stellar Era, after all of Asia was united under China's leadership.

Nickname: sunflowers.

It is ruled by an emperor elected for life. It is not a monarchy.

## Political System

Empire.

# Genetic Technologies

[[genetic-technologies]]

# Social Structure

[[social-structure]]

# Strengths

[[strengths]]

# Military Affairs

[[military-affairs]]

# Weaknesses

[[weaknesses]]

# Governing Body

[[government]]

## Social Mobility

There is none. The Imperium itself determines citizens' abilities through genetic changes. The Commissariat of the Imperium has its own caste, and access to it is closed to other citizens.

## Civil Liberties

Almost nonexistent. Citizens cannot move freely through space, only with permission from imperial authority.

# Science

[[science]]

# Economy

[[economy]]

# Slogans

[[slogans]]
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Військова Справа Імперії Сонця.md",
    titleUk: "Військова Справа Імперії Сонця",
    titleEn: "Military Affairs of the Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/military-affairs.md",
    body: `# Military Affairs

All men are soldiers of the empire. The empire permanently maintains an enormous fleet. It can increase that fleet's size fairly quickly through genetic changes. It has strong recovery potential in both equipment and people.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Військова Справа/Саманаки.md",
    titleUk: "Саманаки",
    titleEn: "Samanaki",
    en: "content/en/universe/empires/sun-empire/military-affairs/samanaki.md",
    body: `Elite detachments of [[../../hetmanate-federation/military-affairs/terminator|Terminators]] in the [[../sun-empire|Empire of the Sun]].

They wield cold weapons and are used for assault operations against asteroid and lunar fortresses and spacecraft. Their outer protective armored spacesuits are usually blue. They carry genetic mutations implanted in adolescence.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Гені Технології Імперії Сонця.md",
    titleUk: "Гені Технології Імперії Сонця",
    titleEn: "Genetic Technologies of the Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/genetic-technologies.md",
    body: `# Genetic Technologies

Genetic alteration of any fetus or child to reach required traits.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Девізи Імперії Сонця.md",
    titleUk: "Девізи Імперії Сонця",
    titleEn: "Slogans of the Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/slogans.md",
    body: `# Slogans

The Emperor's word is law.  
We are the ants of the Imperium.  
Your opinion does not matter; only the Emperor's word matters.  
Serve the God-Emperor.

#slogans
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Економіка  Імперії Сонця.md",
    titleUk: "Економіка Імперії Сонця",
    titleEn: "Economy of the Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/economy.md",
    body: `# Economy

Synthetic food production, heavy industry, and the manufacture of cheap mass-produced weapons.

#economics
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Наука Імперії Сонця.md",
    titleUk: "Наука Імперії Сонця",
    titleEn: "Science of the Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/science.md",
    body: `# Science

Fundamental science is developed. The empire adapts very quickly to new knowledge created by others and can improve it independently. It also creates its own technologies.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Недоліки Імперії Сонця.md",
    titleUk: "Недоліки Імперії Сонця",
    titleEn: "Weaknesses of the Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/weaknesses.md",
    body: `# Weaknesses

Because individuality is absent and genetic alteration is imposed, extraordinary people are not valued. The Emperor's word is law, even when it is wrong.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Переваги Імперії Сонця.md",
    titleUk: "Переваги Імперії Сонця",
    titleEn: "Strengths of the Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/strengths.md",
    body: `# Strengths

Systemic order, discipline, and extremely rapid adaptation to new technologies and improvement of them.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Соціальна Структура Імперії Сонця.md",
    titleUk: "Соціальна Структура Імперії Сонця",
    titleEn: "Social Structure of the Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/social-structure.md",
    body: `# Social Structure

A strict vertical hierarchy of imperial authority, without personal opinion or desire.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Імперія Сонця/Управління Імперії Сонця.md",
    titleUk: "Управління Імперії Сонця",
    titleEn: "Government of the Empire of the Sun",
    en: "content/en/universe/empires/sun-empire/government.md",
    body: `# Governing Body

The Commissariat of the Imperium. The Emperor has absolute authority.

%% Create Waypoint %%
`,
  },
  {
    source: "content/Всесвіт/Імперії/Корпоративна Республіка/Корпоративна Республіка.md",
    titleUk: "Корпоративна Республіка",
    titleEn: "Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/corporate-republic.md",
    body: `# Corporate Republic

Founded in 1776, or 367 years before the Stellar Era. The United States seized North America and later South America, with Australia joining afterward.

Nicknames: corps, corporates, starmen (rare).

# Political System

Republic-Corporation.

# Genetic Technologies

[[genetic-technologies]]

# Social Structure

[[social-structure]]

# Strengths

[[strengths]]

# Military Affairs

[[military-affairs]]

# Weaknesses

[[weaknesses]]

# Governing Body

[[government]]

# Social Mobility

Advancement through the corporate hierarchy. The lowest social strata can join the army as a route upward. Society is segregated by income.

Only very wealthy clans have access to the Congress of Corporations; access is practically closed to everyone else.

Civil liberties are broad inside corporations. Anything that enriches a corporation is allowed. Going against the corporations is impossible.

# Science

[[science]]

# Economy

[[economy]]

# Slogans

[[slogans]]
`,
  },
  {
    source:
      "content/Всесвіт/Імперії/Корпоративна Республіка/Військова Справа Корпоративної Республіки.md",
    titleUk: "Військова Справа Корпоративної Республіки",
    titleEn: "Military Affairs of the Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/military-affairs.md",
    body: `# Military Affairs

Entirely mercenary.

Military service is used as a social elevator. The republic permanently maintains an enormous fleet. It can expand the fleet by hiring new soldiers through corporations and offering handouts to citizens. The fleet is technologically advanced, but expensive to maintain and slow to recover.
`,
  },
  {
    source:
      "content/Всесвіт/Імперії/Корпоративна Республіка/Гені Технології Корпоративної Республіки.md",
    titleUk: "Гені Технології Корпоративної Республіки",
    titleEn: "Genetic Technologies of the Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/genetic-technologies.md",
    body: `# Genetic Technologies

Genetic changes by personal choice.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Корпоративна Республіка/Девізи Корпоративної Республіки.md",
    titleUk: "Девізи Корпоративної Республіки",
    titleEn: "Slogans of the Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/slogans.md",
    body: `# Slogans

The corporation is your future.  
Science. Freedom. Corporation.  
Serve the corporation, and the corporation will serve you.  
Bring profit and be happy.

#slogans
`,
  },
  {
    source: "content/Всесвіт/Імперії/Корпоративна Республіка/Економіка Корпоративної Республіки.md",
    titleUk: "Економіка Корпоративної Республіки",
    titleEn: "Economy of the Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/economy.md",
    body: `# Economy

Synthetic food production, heavy industry, and the manufacture of advanced weapons and ships.

#economics
`,
  },
  {
    source: "content/Всесвіт/Імперії/Корпоративна Республіка/Наука Корпоративної Республіки.md",
    titleUk: "Наука Корпоративної Республіки",
    titleEn: "Science of the Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/science.md",
    body: `# Science

Fundamental science is extremely developed. Because of contempt for foreign technologies, the republic rarely adapts them. It creates its own technologies. At the time of the Loca Deserta incident, it is in stagnation.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Корпоративна Республіка/Недоліки Корпоративної Республіки.md",
    titleUk: "Недоліки Корпоративної Республіки",
    titleEn: "Weaknesses of the Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/weaknesses.md",
    body: `# Weaknesses

Everything is ruled by money. There is no ideological drive, only advancement inside the corporation. Corporations sometimes fight each other.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Корпоративна Республіка/Переваги Корпоративної Республіки.md",
    titleUk: "Переваги Корпоративної Республіки",
    titleEn: "Strengths of the Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/strengths.md",
    body: `# Strengths

Systemic order, extremely strong fundamental science, though already ossified, and a very powerful, developed fleet.
`,
  },
  {
    source:
      "content/Всесвіт/Імперії/Корпоративна Республіка/Соціальна Структура Корпоративної Республіки.md",
    titleUk: "Соціальна Структура Корпоративної Республіки",
    titleEn: "Social Structure of the Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/social-structure.md",
    body: `# Social Structure

A strict vertical corporate hierarchy. To rise, one must devour others. Extraordinary people can advance fairly quickly.
`,
  },
  {
    source:
      "content/Всесвіт/Імперії/Корпоративна Республіка/Управління Корпоративної Республіки.md",
    titleUk: "Управління Корпоративної Республіки",
    titleEn: "Government of the Corporate Republic",
    en: "content/en/universe/empires/corporate-republic/government.md",
    body: `# Governing Body

The Congress of Corporations.

The republic is governed by corporations. Elections are democratic in form, but under full corporate control.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Федерація Гетьманату.md",
    titleUk: "Федерація Гетьманату",
    titleEn: "Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/hetmanate-federation.md",
    body: `Founding date: 1659 old style, or 404 years [[../../history/stellar-era|before the Stellar Era]]. Some chroniclers consider 495 years [[../../history/stellar-era|before the Stellar Era]] to be the founding date: the year Zynovii-Bohdan Khmelnytskyi was elected hetman.

Founders and first rulers: Zynovii-Bohdan Khmelnytskyi and Ivan Ostapovych Vyhovskyi. They were the first hetmans who cemented the Cossack order as the main order across Eastern Europe on [[../../history/old-earth|Old Earth]].

Connection to [[../../history/old-earth|Old Earth]]: the core of the Hetmanate was Eastern Europe, specifically the territory from the Danube to the Don. Later, through expansion, it seized all of Central and Western Europe, North Africa, and Asia Minor.

History: [[history/history|History of the Hetmanate]]
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Історія/Історія.md",
    titleUk: "Історія Гетьманату",
    titleEn: "History of the Hetmanate",
    en: "content/en/universe/empires/hetmanate-federation/history/history.md",
    body: `In -495 [[../../../history/stellar-era|SE]] (1648 old style), the Zaporizhian Cossacks under Bohdan Zynovii Khmelnytskyi carried out a reconquest and retook the historic Rus lands on the right bank of the Borysfen, inflicting dozens of defeats on the armies of the Polish-Lithuanian Commonwealth. Cossack forces were reinforced by new units from liberated lands that had been occupied since the age of principalities. The Zaporizhian Cossacks themselves are direct descendants of the Kozar tribe, also called Khazars. As the Lithuanian principality expanded southward, the Kozars were pushed from their lands around Old Kyiv. In time, the Cossack-Kozars found a safe place beyond the Dnipro rapids, where Lithuanian and Polish troops feared to step. Instead, the Cossacks focused their wars against the Turks of [[../../../history/old-earth|Old Earth]], especially through frequent campaigns against Tsargrad. To protect their possessions from Cossack sea raids, the Turks resettled several Tatar clans from Astrakhan to Crimea, hoping to stop the Cossacks from freely entering the Black Sea.

In the -550s SE, Dmytro Konashevych Sahaidachnyi was elected kosh otaman. In two campaigns he forced the Tatars into peace, capturing and plundering Kerch and Bakhchysarai. This reopened the path to naval campaigns. Thanks to him, Ottoman expansion along the Don and Kuban rivers was stopped, giving the Zaporizhians a secure rear.

## The Beginning of the End of the Old World

Twenty years later, in the -570s SE, the Ottomans made their last successful attempt to destroy the Cossack center in the floodplains of the Borysfen: the Sich. The Cossacks asked the Commonwealth and Lithuania for help, but were refused. Within half a century, that refusal would play a fatal role in the survival of both states. For the previous century the Cossacks had not touched their old lands on the right bank of the Dnipro, honoring peace agreements with their neighbors, and they remembered this betrayal. A 120,000-strong Ottoman army crossed the Danube and invaded the Wild Field. The Cossacks did not dare fight a direct battle with all armies, so they waged partisan war: mobile mounted detachments constantly prowled around the logistics routes that connected the main Ottoman forces with Danubian Bulgaria. The spring was very dry, leaving little grass for horses and elephants. With great effort the Ottomans reached the Borysfen, and their engineers began building a ferry crossing at the ford near Nova Kakhovka, taking advantage of the low water level in the Dnipro.

The Tatars called by the Turks left Crimea, but kept the peace treaty signed by Sahaidachnyi and Giray III and did not enter Zaporizhian lands. The Cossacks' position became catastrophic when janissary assault detachments crossed to the left Cossack bank and began ravaging Cossack stanitsas and winter settlements. Suddenly news came from the north: two armies, Lithuanian and Commonwealth, were marching to help. This greatly encouraged the Cossacks to keep fighting. Ivan Sulyma's detachments managed to cross to the right bank, fight a large Ottoman-Bulgarian patrol, destroy it completely, and then burn the Turkish crossing.

Sahaidachnyi expected a strike by the combined Polish and Lithuanian forces, so he also ordered the Cossacks to gather at one place on the Donets River so that the three forces could defeat the enormous Ottoman onslaught together. To his surprise, both allied armies crossed at Cherkasy to the left Cossack bank and began ravaging Zaporizhian lands. The Poles and Lithuanians slaughtered whole villages regardless of age or sex. Bohdan Khmelnytskyi's father, Colonel Mykhailo Lavrynovych Khmil, together with his young but already centurion son Bohdan, received Sahaidachnyi's order to stand with several thousand Cossacks as a screen against the Commonwealth forces. Khmelnytskyi's regiment stopped the traitors' advance and bought time for tens of thousands of families to escape east to the Don, beyond Savur-Mohyla.

Seeing enemies pressing from every side and knowing that the Tatars might join the Turks any day, Sahaidachnyi ordered the whole Cossack host and Cossack families to withdraw toward the Don. People gathered belongings and livestock; some even dragged mills with them. The migration was forced, and many did not want to leave their lands, still thinking the enemy might spare them or that they might somehow slip through the disaster. But the situation worsened, as large Polish and Turkish patrols pushed deeper into the steppe and attacked defenseless people.

It seemed that all Zaporizhian Cossackdom was doomed, until help came from an unexpected direction: the troops of the Muscovite prince crossed the border and, taking advantage of Lithuania's lack of forces, captured Smolensk and Vitebsk. The threat to the capital forced the Lithuanians to turn back, greatly easing pressure from the north on the war-torn Zaporizhian lands. The Cossacks gained a brief respite and managed to regroup.

![After the Battle](../../../../Всесвіт/Імперії/Федерація Гетьманату/Images/After_Battle_Steppe.jpg)

Meanwhile, only a few hundred Cossacks remained in Mykhailo Lavrynovych Khmil's detachment. After confirming that all stanitsas and winter settlements had already been abandoned, they fought their way near Kremenchuk into the Wild Field but fell into an Ottoman trap while crossing the Samara River. In front of Ivan Sulyma, who was coming to help from the right bank, the Turks burst into the Cossack camp, tore apart the wagons and the chains that held them together, and defeated the Cossacks. Mykhailo Lavrynovych and his son Bohdan were captured. That evening Mykhailo was executed through terrible torture: a Turkish elephant stepped on his limbs, slowly crushing muscle and bone until Mykhailo released his spirit without a single cry. Bohdan-Zynovii was to be next; he had already been tied to the platform for execution by elephant. But Ivan Sulyma's artillery finally took position and began shelling the Turks from the right bank. To escape the fire, the Turks hurriedly broke camp and marched back to join their main forces, taking all captured Cossacks with them. That evening Bohdan Khmelnytskyi swore to avenge every wrong done to Zaporizhian land.

![Departure of the Zaporizhians](../../../../Всесвіт/Імперії/Федерація Гетьманату/Images/Steppe_Wagons.jpg)

Almost all Cossack forces retreated beyond Savur-Mohyla, leaving their homes, fields, and rivers behind. The Poles and Turks spent nearly until winter finishing off the remaining detachments that had failed to withdraw in time. Ivan Sulyma's large detachment fought as far as Perekopsk, where the Tatars treacherously seized them and sold them to the Turks along with all surviving Cossacks.

Having destroyed almost all of the western and central Wild Field, the Turks did not dare go beyond Savur-Mohyla and withdrew to the Danube with the first cold. The Poles built a small fortress on the Kodak River, where it flowed into the Borysfen. From that fortress the Cossack reconquest would begin, lasting two long centuries and ending with a triumphant entry into the lands of the French in the far west.

## From Captivity to the Wild Field

Sahaidachnyi was wounded by an arrow in the neck in one battle and slowly died of sepsis. Only his iron health let him live another year after the wound, holding all Cossackdom together and preventing complete collapse. After his death, other Cossacks were elected otamans, but all ruled for less than a year, trying somehow to gather the scattered Cossacks. Some began returning to ravaged stanitsas and winter settlements, but Tatars and Poles kept garrisons in the old towns and constantly made sure the Cossacks could not return to their lands. It seemed the paradise lands had fallen forever and would never again see their native Cossacks. Yet five years later, the bud of a future superpower space empire, the [[../hetmanate-federation|Hetmanate Federation]], would bloom here.

![Freeing Themselves from Captivity](../../../../Всесвіт/Імперії/Федерація Гетьманату/Images/Cossacks_Free_Themselves.jpg)

Ivan Sulyma, Bohdan-Zynovii Khmelnytskyi, and thousands of other captives were chained to galleys and spent five long years there. Eventually one galley, where Sulyma and Khmil rowed, moored at the estuary in Perekop. Using bad weather and rain, while the guards sat on shore hiding from the downpour, Sulyma knocked the rusted chains from his legs and freed the others. In complete silence, without any signal or flash of fire, three hundred rowers came onto the galley's deck: some Cossacks, some Venetians, some stray Christians from distant Spains. Their only weapons were iron nails and the shackles to which they had been chained for years. First they strangled three Turks sleeping near the strongbox. From there they grabbed whatever weapons they could. Then, one after another, some swimming and some in small dugouts, they reached shore and slaughtered the galley's crew and guards in their sleep. After taking food from a neighboring Tatar village and killing its inhabitants so no one could warn of the escape, they returned to the galley, pushed off, and headed west around half the peninsula, trying to reach the mouth of the Borysfen. Because of the great local holiday Bayram, when everyone was drinking, news of the missing crew and whole galley began to spread only after the Cossack galley struck an unsuspecting Turkish garrison at Zaliznyi Port, which was captured and plundered. Ships in the harbor were dismantled and remade into baidaky, since the large unwieldy galley could not handle the Dnipro. Two days later the Cossacks entered the Borysfen mouth with great spoils, dismantled their own galley, and rowed upstream in fifty baidaky. There they learned that the Poles had built a fortress on the Kodak River where it entered the Borysfen, using it to control all movement along the Dnipro and as a base for their troops. Meanwhile, rumors of the return of two otamans from captivity with several hundred Cossacks and foreigners spread through the rare hidden winter settlements and stanitsas on the left Cossack bank. Ivan Sulyma and Bohdan-Zynovii sent messengers from every place their band landed. Within days, several hundred more Cossacks joined them, having hidden all this time in deep ravines and dark places where Turk and Pole feared to go. It was decided to strike the fortress at once and destroy it, which they did.

## Capture of Kodak

![Attack on Kodak](../../../../Всесвіт/Імперії/Федерація Гетьманату/Images/Bogdan_Attacks_Kodak.jpg)

The fortress rarely set a night watch, since for dozens of kilometers around there was not a trace of Cossacks. Suddenly several dozen baidaky appeared on the Borysfen. A favorable wind and the rowers instantly brought hundreds of battle-starved Cossacks to shore, and they began climbing the fortress palisade. Larger baidaky opened fire with cannons and hook guns taken from Turkish galleys. The Germans and Poles quartered in the fort hurried for their weapons, but it was already too late. One Cossack after another climbed over the high fence. Bohdan Zynovii was the first across. With one saber stroke he cut off the hand of a German raising a horn to warn the fortress. With spears, sabers, and pernach maces, the Cossacks forced their way forward. In half an hour it was over. Kodak fell under the blow of Sulyma and young Khmil. The entire garrison of several hundred blades was destroyed to the last man; even the old German captain who commanded the fortress was not spared, though he fought to the end. From Kodak, Khmil kept sending messengers in every direction.

The rumor became prophecy. It captured people's minds and, faster than fire across the steppe during a storm, reached Savur-Mohyla and Kyiv. Cossackdom, which had lived miserably between the Don and Savur-Mohyla, at last heard that its former leaders had escaped captivity and come to free them too. Within a month, thousands of Cossacks and their families began returning to their old homes. Some stood burned; others had fared better, their huts waiting as if they knew no one but Cossacks needed them. Polish forces in the region had been left only to terrorize isolated Cossacks and prevent them from settling or joining into large bands. After Kodak fell, the main base disappeared, and now the Cossacks hunted every invader and foreigner. Because of their betrayal, Poles were shown no mercy. Captives were punished by water: a loop was hung from a long pole, the filthy Polish head was pushed through, and the captive was led like on a lasso to the nearest river. They were shoved into the water and held down with the pole to the bottom. When they stopped twitching, the loop was untied and the next one put in. When asked why not simply cut their throats, the answer was simple: the holy land of the Wild Field had to stay clean, without the taste of invader or Pole. The much fewer Turks were taken captive for ransom.

Other Ukrainian-Cossacks living under the Commonwealth during the five years after the Sich was driven from the southern lands suffered mercilessly under Polish domination, with no one left to protect them. Feeling complete impunity, the Poles inflicted every kind of extortion and misery on Ukrainians-Rusyns. News that the Cossacks had returned beyond the rapids rose like a fiery typhoon and lifted the whole people against the occupiers. Kaniv, Cherkasy, Poltava, Kyiv: all the people rose against the Poles and beat them without mercy. Some roads were piled with Polish bodies as they tried to flee, but popular wrath found them behind every dam and around every bend in the forest.

The news of Cossack return and the expulsion of Polish forces from Ukraine and the Wild Field caught the Commonwealth army unprepared. The Muscovite prince, after taking Smolensk and Vitebsk, continued expanding westward and began threatening Vilnius. The Poles gathered an army to help the Lithuanians, and that army became bogged down for a long time in swamps and dark forests. The Commonwealth had nothing to send against the Cossacks except the private military companies of local oligarchs to whom former Cossack and Ukrainian lands had once been granted.

## Campaign to Crimea
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Військова Справа Федерації Гетьманату.md",
    titleUk: "Військова Справа Федерації Гетьманату",
    titleEn: "Military Affairs of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/military-affairs.md",
    body: `# Military Affairs of the Hetmanate

The entire population is liable for military service. Permanent service is carried only by the Cossack class (Serdiuks, Haidamaks, Haiduks, Plastuns), as well as janissaries and mujahideen. During war, an appointed Hetman with absolute authority is chosen.

The armed forces are divided into several classes:

1. Haiduks. They serve on planets and defend them from attacks. They have a limited arsenal without heavy weapons, and use interplanetary aircraft for patrols.
2. Serdiuks. The Hetmanate's strike troops. They have the means to wage war within galaxies. They can assault foreign planets and systems. Their weapons are varied and include super-heavy plasma cannons for breaking planetary defenses and nuclear charges.
3. Plastuns. Scouts and harassers. Light space infantry. Their advantages are mobility and the ability to hide movement. They have no heavy weapons and take part in reconnaissance and space patrol.
4. Haidamaks. Unofficially, they are Federation Cossacks engaged in illegal activity approved by the Sich, such as raids on other colonies and theft of resources. They are used de facto to attack other empires without de jure consequences.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Військова Справа/Гайдуки.md",
    titleUk: "Гайдуки",
    titleEn: "Haiduks",
    en: "content/en/universe/empires/hetmanate-federation/military-affairs/haiduks.md",
    body: "",
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Військова Справа/Обшитований козак.md",
    titleUk: "Обшитований козак",
    titleEn: "Retired Cossack",
    en: "content/en/universe/empires/hetmanate-federation/military-affairs/retired-cossack.md",
    body: `After completing service, or after being wounded, Cossacks, whether Serdiuks or Haiduks, could enter the status of an obshytovanyi, or retired, Cossack. This status removed the obligation to march on campaigns except by personal choice. The empire also paid money for each retired Cossack and granted land on different planets.

Retired Cossacks also received a discount when sending their children to train with the Plastuns.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Військова Справа/Половинити.md",
    titleUk: "Половинити",
    titleEn: "Halving",
    en: "content/en/universe/empires/hetmanate-federation/military-affairs/halving.md",
    body: `Halving is a punishment applied to populations and military units for disobedience to the Space Sich. Every second person is executed by random lot. Those who are luckier are transferred to slave status together with their whole family and sent across all systems controlled by the [[../hetmanate-federation|Hetmanate Federation]].

It is usually applied to systems that were captured by [[khartsyzy|Khartsyzy]] and supported them.

In extreme cases, it can be applied to [[serdiuks|Serdiuk]] or [[haiduks|Haiduk]] units that refuse to obey orders. Because of this, many of them flee to the [[khartsyzy|Khartsyzy]] in such cases to avoid punishment or enslavement.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Військова Справа/Сердюки.md",
    titleUk: "Сердюки",
    titleEn: "Serdiuks",
    en: "content/en/universe/empires/hetmanate-federation/military-affairs/serdiuks.md",
    body: `Serdiuks are the main military forces of the [[../hetmanate-federation|Hetmanate Federation]]. They take part in all active combat operations and, unlike [[haiduks|Haiduks]], conduct offensive operations.

## Tasks

### Fighting the [[khartsyzy|Khartsyzy]]

Every space palanka has several regiments of Serdiuks at its disposal. This allows each palanka to conduct offensive operations. For example, if [[khartsyzy|Khartsyzy]] appear in a system, the Serdiuks are ordered to destroy their main forces or reduce them to a level at which the [[khartsyzy|Khartsyzy]] again recognize imperial authority.

## External Threats

Although open conflicts between empires are fairly rare, Serdiuks are still the troops that take the most active part in them.

## Armament

All new weapon types go first to the Serdiuks. Because they often participate in space and planetary battles, new inventions can be field-tested and improved quickly through them. Serdiuks were the first to test [[terminator|Terminator armor]], copied from trophies after an encounter with the space marines of the [[../../corporate-republic/corporate-republic|Corporate Republic]].

## Training

## Types of Serdiuks

#### Space Infantry

#### Flyers

#### Cavalry

#### Plastuns

Light scouts. There are both space Plastuns and ordinary planetary ones. Their main tasks are reconnaissance of planetary surfaces and regions of space. They rarely enter combat, only when victory is guaranteed. Otherwise they gather needed information and pass it to the main forces. Their main advantages are speed and mobility. They are also used to cut enemy logistics during planetary sieges or space raids.

#### Planetary Troops

They have only light spacesuits for fighting on planets that have not been fully terraformed to the minimum life-support level without respirators or inhalation gear. They have access to all types of weapons: artillery, cavalry, tanks, and flyers. Serdiuks from such units rarely take part in space battles on moons or artificial satellites.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Військова Справа/Термінатор.md",
    titleUk: "Термінатор",
    titleEn: "Terminator",
    en: "content/en/universe/empires/hetmanate-federation/military-affairs/terminator.md",
    body: `A Terminator is a super-heavy space assault trooper. The name comes from the equivalent infantry type in the [[../../corporate-republic/corporate-republic|Corporate Republic]] and means "one who destroys, one who kills."

Every Terminator has a heavy outer armored spacesuit that allows combat in open space, on airless bodies, and during boarding actions against other spacecraft.

Controlling a Terminator suit requires great strength, skill, and long training. Inside it, every Cossack sits in a personal spacesuit that protects him from depressurization, extreme temperatures, and vacuum if the main outer suit is breached.

## Terminator Specializations

There are several Terminator specializations.

### Bohatyrs

The bravest are trained for assault operations with "cold" weapons: their own sabers, spears, shields, and short plasma muskets. They lead groups of less armored Serdiuks or Haiduks. They also take part in boardings of spacecraft and assaults on space, lunar, and asteroid fortresses. They are often used to protect their brothers-in-arms, the Rifleman-Terminators, so they are not surprised in hand-to-hand combat.

The name comes from the mythical warriors of the pre-Cossack age on [[../../../history/old-earth|Old Earth]].

Analogues elsewhere: [[../../sun-empire/military-affairs/samanaki|Samanaki]] in the [[../../sun-empire/sun-empire|Empire of the Sun]].

### Riflemen

The most common type of Terminator. They mainly use long-range personal laser firearms. Their only cold weapon is a power or plasma saber. They fight by covering the desperate attacks of the Bohatyrs. Such Terminator detachments can also operate heavy infantry systems such as machine guns, mortars, and plasma cannons.

![Terminator](../../../../../../Images/Hetmanat_Terminator.png)
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Військова Справа/Харцизи.md",
    titleUk: "Харцизи",
    titleEn: "Khartsyzy",
    en: "content/en/universe/empires/hetmanate-federation/military-affairs/khartsyzy.md",
    body: `Khartsyzy are space pirates, or anyone who does not submit to the Space Sich. Their ranks can be very mixed: deserters, [[retired-cossack|retired Cossacks]], bandits. They usually gather in groups of several thousand people and attack trade routes between systems, or wait for victims at the entry and exit points of [[../../../technologies/warp/warp|warp]].

Sometimes they occupy asteroids or moons with very small populations and begin conducting their own policy independent of the [[../hetmanate-federation|Hetmanate Federation]].

Sometimes agreements with Khartsyzy are possible and they recognize the authority of the Space Sich. In that case, they are required only to supply food and recruits for the Hetmanate's forces. If Khartsyzy raid colonies of the [[../hetmanate-federation|Hetmanate Federation]], [[serdiuks|Serdiuk]] forces enter the system to destroy their military and space bases. After the main Khartsyzy combat units are destroyed, they are [[halving|halved]].
`,
  },
  {
    source:
      "content/Всесвіт/Імперії/Федерація Гетьманату/Генетичні Технології Федерації Гетьманату.md",
    titleUk: "Генетичні Технології Федерації Гетьманату",
    titleEn: "Genetic Technologies of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/genetic-technologies.md",
    body: `# Genetic Technologies

[[hetmanate-federation]]

Support of natural abilities.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Девізи Федерації Гетьманату.md",
    titleUk: "Девізи Федерації Гетьманату",
    titleEn: "Slogans of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/slogans.md",
    body: `# Slogans

![One for All](../../../../Всесвіт/Імперії/Федерація Гетьманату/Images/Odin_Za_Vsih.jpg)

One for all and all for the Kish.  
Be independent; work together with others.  
My planet is on the frontier; I meet the enemy first.  
Space and Freedom.

#slogans
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Економіка Федерації Гетьманату.md",
    titleUk: "Економіка Федерації Гетьманату",
    titleEn: "Economy of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/economy.md",
    body: `# Economy

Organic food production, heavy industry, and the manufacture of various weapons.

#economics
`,
  },
  {
    source:
      "content/Всесвіт/Імперії/Федерація Гетьманату/Зоряна Справа/Кораблі/Кораблі класу ДАРЬЯ.md",
    titleUk: "Кораблі класу ДАРЬЯ",
    titleEn: "DARYA-Class Ships",
    en: "content/en/universe/empires/hetmanate-federation/star-affairs/ships/darya-class-ships.md",
    body: `The largest ships of the Hetmanate Federation are DARYA-class ships. They are more than forty kilometers long. They can carry up to ten thousand Haiduks or Serdiuks, up to twenty starships, several thousand orbital ships, and several thousand [[../../../../technologies/star-affairs/atmospheric-flyers|atmospheric flyers]].

They perform [[../../../../technologies/warp/warp|warp]] transitions.

They are used to move large military groupings between different parts of space. Around ten ships of this class can carry one invasion or defense corps.

The largest ship for warp crossings is named Volyn and is sixty-one kilometers long.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Колонізація Федерації Гетьманату.md",
    titleUk: "Колонізація Федерації Гетьманату",
    titleEn: "Colonization in the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/colonization.md",
    body: `# Planet Colonization

Planetary colonization begins when a Hetmanate scout probe informs the Colonization Council that a system or planets suitable for life or terraforming have been found.

More details here: [[Settlement Technology of the Hetmanate Federation]]

A colonizer wagon-train performs all necessary actions to terraform the planet. Afterward it informs the Colonization Council about the available planet and its characteristics.

Planetary characteristics include:

1. Composition of useful minerals
2. Ability to extract energy from the planet's core
3. Possibility of food-industry development
4. Possibility of creating a military base
5. Creation of heavy-industry centers
6. And so on, including recreation potential

The Colonization Council offers the discovered and terraformed planet at auction, where any Hetmanate citizen can acquire it as property.

The price of auction participation is very high, so the Hetmanate people unite into bands, pooling their capital into one whole and thus reaching the auction.

The Colonization Council conducts the auction under these rules:

1. A large deposit is required to participate.
2. Any citizen may participate if the deposit has been assembled.
3. The planet is granted to whoever pays the most.
4. The band or citizen must begin colonizing the planet within one year of winning.
5. If they refuse to colonize the planet, the money is not returned.
6. The band must search for settlers for the new planet.
7. The planet must pay a 3% tax to the Sich treasury after twenty years from the start of settlement.
8. For the first twenty years the planet pays no taxes, but must provide recruits for the Hetmanate army.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Кіш.md",
    titleUk: "Кіш",
    titleEn: "Kish",
    en: "content/en/universe/empires/hetmanate-federation/kish.md",
    body: `A Kish is a combat-command formation created during danger or major wars. There is a Central Star Kish: the entire military leadership of the Hetmanate Federation. It dissolves itself after hostilities end.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Наука Федерації Гетьманату.md",
    titleUk: "Наука Федерації Гетьманату",
    titleEn: "Science of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/science.md",
    body: `# Science

Fundamental science is not very developed. The federation often hires representatives of other empires to work in its scientific centers. It adapts very quickly to new knowledge developed by others and can improve it independently.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Недоліки Федерації Гетьманату.md",
    titleUk: "Недоліки Федерації Гетьманату",
    titleEn: "Weaknesses of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/weaknesses.md",
    body: `# Weaknesses

Extraordinary people are not valued. Because of general equality, no one can rise above everyone else. This weakens fundamental science. Collegial decisions by the starshyna and the Sich Council often block action. The system works effectively only during full-scale wars.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Переваги Федерації Гетьманату.md",
    titleUk: "Переваги Федерації Гетьманату",
    titleEn: "Strengths of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/strengths.md",
    body: `# Strengths

[[hetmanate-federation]]

Autonomy of the palankas, a strong drive toward startups and semi-independent existence for elders and settlements, and extremely high population mobility.
`,
  },
  {
    source:
      "content/Всесвіт/Імперії/Федерація Гетьманату/Планетарні Технології Федерації Гетьманату.md",
    titleUk: "Планетарні Технології Федерації Гетьманату",
    titleEn: "Planetary Technologies of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/planetary-technologies.md",
    body: `# Space Technologies

The Hetmanate Federation can terraform planets by seeding them with fungi and bacteria that digest local organisms into hydrogen, oxygen, and carbon. Within ten years, native fauna is already developing; with genetic influence, it is adjusted to the conditions of the star.

# How Planets Are Settled
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Різне/Піндос.md",
    titleUk: "Піндос",
    titleEn: "Pindos",
    en: "content/en/universe/empires/hetmanate-federation/miscellany/pindos.md",
    body: `Pindos is an insulting name for inhabitants of the Corporate Republic. Translated from the Central European language, it means penguin. It is not used officially.
`,
  },
  {
    source: "content/Всесвіт/Імперії/Федерація Гетьманату/Різне/Сонячник.md",
    titleUk: "Сонячник",
    titleEn: "Sonyachnyk",
    en: "content/en/universe/empires/hetmanate-federation/miscellany/sonyachnyk.md",
    body: `Sonyachnyk or Sonyachnyky is a mild name for inhabitants of the [[../../sun-empire/sun-empire|Empire of the Sun]]. It is not used officially. It comes from the name "Empire of the Sun." In distant times before the [[../../../history/great-departure|Great Departure]], it was believed that the sun rose first over their empire. A sonyachnyk is a sunflower, a plant that always tries to orient itself toward the sun and follows its path across the sky. That is the origin of the name.
`,
  },
  {
    source:
      "content/Всесвіт/Імперії/Федерація Гетьманату/Соціальна Структура Федерації Гетьманату.md",
    titleUk: "Соціальна Структура Федерації Гетьманату",
    titleEn: "Social Structure of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/social-structure.md",
    body: `# Social Structure

Segregation by ability.
`,
  },
  {
    source:
      "content/Всесвіт/Імперії/Федерація Гетьманату/Територіальний Устрій Федерації Гетьманату.md",
    titleUk: "Територіальний Устрій Федерації Гетьманату",
    titleEn: "Territorial Structure of the Hetmanate Federation",
    en: "content/en/universe/empires/hetmanate-federation/territorial-structure.md",
    body: `# Territorial Division

The capital of the Hetmanate Federation is located in the Great Meadow system. The artificial asteroid Zoryana Sich is surrounded by satellites and other planets. The Great Meadow is identical to the Solar System in size and age.

The Great Meadow is protected by Haiduks.

The space sector received by the Hetmanate is called the Hetmanate Sector, or HetSec.

HetSec is divided into palankas; one palanka usually contains one galaxy. Since habitable planets and systems are extremely rare, the population is concentrated in habitable systems scattered across the palankas.
`,
  },
  {
    source: "content/Всесвіт/Історія/Головна Історія Всесвіту.md",
    titleUk: "Головна Історія Всесвіту",
    titleEn: "Main History of the Universe",
    en: "content/en/universe/history/main-history-of-the-universe.md",
    body: `# Main Events in History

## Interstellar Transitions

In year 0 of the [[stellar-era|Stellar Era]], the first successful transition through [[../technologies/warp/warp|warp]] was made using a warp engine.

The warp engine was invented jointly on Jupiter's moon Europa. Jovian Europa was a research station where scientists from different empires and planets worked together to create warp. A jump requires a massive body with gravity, such as Jupiter, that can accelerate a reactor using lawrencium or nobelium and fold space into a corridor leading to another point in space.

The first three interstellar guests were the heads of the warp-engine development departments, each representing one of the earthly pre-stellar empires. Before humans were launched, there had been about forty successful launches of animals and plants. The journey was programmed so that after two days on the far side of warp, the ship would initiate a warp transition back to the Wastes of Jupiter. Once enough evidence had been gathered that warp travel was safe and that time stayed synchronized, with animals returning neither younger nor older, the first interstellar cosmonauts were approved. The transition was programmed for three days near Alpha Centauri with an automatic return, though if the human warp jump succeeded, the crew was to return after two Earth days.

The launch was broadcast to all four inhabited bodies of the Solar System: Earth, Mars, Europa, and Earth's first artificial satellite. About twenty billion people from all empires watched the ship depart Europa and head toward the Wastes of Jupiter for the warp jump. In the Wastes themselves, the cosmonauts sent their final signal, "Hayda," and vanished from Solar System radar. The gravitational wave of the transition shook the planets, though only instruments registered it.

Two Earth days later, another gravitational wave struck the sensors placed around the Wastes. A few hours after that, Europa received a video signal from the cosmonauts. The astronomical time of their return from warp became the beginning of the new Stellar Era, or SE. Humanity gained access to any star.

## The Martian Division of the Universe and the Teegarden Incident

Every member of the European (Jovian) International Research Station received access to all developments of the laboratory. In year 23 SE, each empire had already founded one colony in the nearest star system, Alpha Centauri. The search for further systems able to host humans showed that there were fairly few of them, and even fewer systems rich in useful minerals. Warp jumps were also expensive, because lawrencium and nobelium are unstable and must be held calm only under micronuclear explosions. The empires began debating who had the right to mine asteroids, comets, and planets and to create colonies there.

In year 31 SE, the first armed clash occurred during the exploration of Teegarden's Star, specifically on the human-habitable planets Teegarden b and c. The Corporate Republic informed Europa that it had occupied Teegarden b. At the same time, the Empire of the Sun informed Europa that the Corporates had attacked its ships in the system and taken the warp-control point, effectively driving out the Sunflowers.

This incident entered stellar history as the Teegarden Incident. It triggered unrest in the Solar System, and all three empires entered an undeclared war. The forces of the Hetmanate, the Corporates, and the Sunflowers headed toward Jovian Europa to seize control and development of warp crossings. Entering Europa's gravity zone would have meant the first solar world war, because the Jovian Europa zone was demilitarized.

The heads of warp-transition development on Jovian Europa, Mykhailo Sahaidak, Jack Mo (马云), and Richard Stalman, announced that any further movement by any empire to seize the warp laboratory and warp-engine production would cause the collapse of civilizations. Therefore, the research station's staff would start a warp engine directly on Jovian Europa, causing a gravitational rupture that would destroy the moon and the entire station.

Because any military presence on Jovian Europa was forbidden, and the emperors of all three empires were military men, a conference was convened on Mars to resolve the division of the universe and clarify access to warp engines.

On July 24, year 33 SE, the [[martian-division-of-the-world|Martian Division of the Universe]] took place. The entire universe was divided into three sectors. Each sector was one third of the sphere that represented the Universe. The division was conducted by lottery: each emperor drew a ticket with a sector name. As soon as an emperor drew the third ticket for a sector, that sector was automatically granted to that empire for eternal use.

Dan Rios, emperor of the Corporate Republic, was the first to draw three tickets. The Corporates received the upper-right sector. Between the Sunflowers and the Hetmanates, a heated struggle arose: each wanted the "left" sector, because the "lower" one contained the enormous Canis Major Void, where there is almost nothing. Emperor-Koshovyi Taras Velychko and the Sunflower emperor Wang Mang (王莽) could not draw the third "left" ticket. Five times in a row each drew an already occupied sector. Finally, Wang Mang drew the "left" sector, granting his empire rule there, while the Hetmanates automatically received the "lower" sector. Though the Hets were in despair, an agreement was an agreement.

## Results of the Martian Division of the Universe in Year 33

- Each sector was granted to an empire in eternal possession.
- The Solar System was to become demilitarized, with no troops of any empire present by year 100 SE.
- Each empire was obliged to pay a science tax to Jovian Europa to continue research.
- The empires had to leave the Solar System for their own sectors.
- The empires were forbidden to develop their own warp engines.
- All warp technology belonged to Jovian Europa.
- In case of violation of the rules, laws, or the Martian Division, Jovian Europa would disconnect the offender from warp crossings.
- The Solar System became demilitarized, with a population of about 15-20 billion.
- Order was maintained by Peace Troops directly subordinate only to the three heads of the laboratory on Jovian Europa.
- Each empire had a group of representatives on Jovian Europa.
- The laws of the empires did not apply in the Solar System.
- Jovian Europa was forbidden to research or develop any military technology.
- Jovian Europa was forbidden to favor any empire.

A 200-year period of continuous expansion of warp stations and space settlement by the three empires began. Humanity conquered the Universe. The resettlement of the empires became known as the [[great-departure|Great Departure]].

The Hetmanate finally departed in year 91 SE. Zoryana Sich, or Star Sich, was founded in the Virgo Supercluster.

The Corporates departed in year 96 SE. Star Washington was founded in the Centaurus Supercluster.

The Sunflowers departed in year 87 SE. They founded Star Shanghai in the Pisces-Cetus Supercluster.
`,
  },
  {
    source: "content/Всесвіт/Історія/Великий Уход.md",
    titleUk: "Великий Уход",
    titleEn: "Great Departure",
    en: "content/en/universe/history/great-departure.md",
    body: `The name of the long process begun by all three empires according to the [[martian-division-of-the-world|Martian Division of the World]].

The Hetmanate finally departed in year 91 SE. Zoryana Sich, or Star Sich, was founded in the Virgo Supercluster.

The Corporates departed in year 96 SE. Star Washington was founded in the Centaurus Supercluster.

The Sunflowers departed in year 87 SE. They founded Star Shanghai in the Pisces-Cetus Supercluster.
`,
  },
  {
    source: "content/Всесвіт/Історія/Знищення Африки.md",
    titleUk: "Знищення Африки",
    titleEn: "Destruction of Africa",
    en: "content/en/universe/history/destruction-of-africa.md",
    body: `Around year 213 [[stellar-era|SE]], the empires began a war for control of Africa. This led to mutual nuclear strikes against formations on the continent, ultimately destroying it completely and making it unfit for life. The Hetmanate Federation expanded its influence into Central Africa from its holdings in the north of the continent. The other two empires, the [[../empires/sun-empire/sun-empire|Empire of the Sun]] and the [[../empires/corporate-republic/corporate-republic|Corporate Republic]], disliked this and also entered the continent. As a result of small military clashes, a hidden war became open, with three armies fighting each other with mixed success for three years. Eventually, to move the war from deadlock, the [[../empires/corporate-republic/corporate-republic|Corporate Republic]] used nuclear weapons against Hetmanate positions. This caused a mutual exchange of nuclear strikes by all three empires, limited to Africa. The use of the strongest weapon brought no one any benefit and only destroyed an entire continent with a billion victims. Africa itself became a radioactive wasteland over which even aircraft were permitted to fly. After a hundred years, radiation levels began to fall, but the entire territory remained completely unfit for life.

To salvage the situation and de-escalate the conflict, the empires signed the **Peaceful Nuclear Treaty**, which made the use of nuclear weapons on Earth's territory impossible.
`,
  },
  {
    source: "content/Всесвіт/Історія/Зоряна Ера.md",
    titleUk: "Зоряна Ера",
    titleEn: "Stellar Era",
    en: "content/en/universe/history/stellar-era.md",
    body: `The Stellar Era is the basic count of time. It replaced the "common era."

Year 0 of the Stellar Era was year 2143 in the old style.

In year 0 of the Stellar Era, the first successful warp transition was made using a warp engine. This event later became the basis for humanity's transition to the new calendar.
`,
  },
  {
    source: "content/Всесвіт/Історія/Марсіанський Поділ Світу.md",
    titleUk: "Марсіанський Поділ Світу",
    titleEn: "Martian Division of the World",
    en: "content/en/universe/history/martian-division-of-the-world.md",
    body: `On July 24, year 33 SE, the Martian Division of the Universe took place. The entire universe was divided into three sectors. Each sector was one third of the sphere that represented the Universe. The division was conducted by lottery: each emperor drew a ticket with a sector name. As soon as an emperor drew the third ticket for a sector, that sector was automatically granted to that empire for eternal use.

Dan Rios, emperor of the Corporate Republic, was the first to draw three tickets. The Corporates received the upper-right sector. Between the Sunflowers and the Hetmanates, a heated struggle arose: each wanted the "left" sector, because the "lower" one contained the enormous Canis Major Void, where there is almost nothing. Emperor-Koshovyi Taras Velychko and the Sunflower emperor Wang Mang (王莽) could not draw the third "left" ticket. Five times in a row each drew an already occupied sector. Finally, Wang Mang drew the "left" sector, granting his empire rule there, while the Hetmanates automatically received the "lower" sector. Though the Hets were in despair, an agreement was an agreement.

## Results of the Martian Division of the Universe in Year 33

- Each sector was granted to an empire in eternal possession.
- The Solar System was to become demilitarized, with no troops of any empire present by year 100 SE.
- Each empire was obliged to pay a science tax to Jovian Europa to continue research.
- The empires had to leave the Solar System for their own sectors.
- The empires were forbidden to develop their own warp engines.
- All warp technology belonged to Jovian Europa.
- In case of violation of the rules, laws, or the Martian Division, Jovian Europa would disconnect the offender from warp crossings.
- The Solar System became demilitarized, with a population of about 15-20 billion.
- Order was maintained by Peace Troops directly subordinate only to the three heads of the laboratory on Jovian Europa.
- Each empire had a group of representatives on Jovian Europa.
- The laws of the empires did not apply in the Solar System.
- Jovian Europa was forbidden to research or develop any military technology.
- Jovian Europa was forbidden to favor any empire.
`,
  },
  {
    source: "content/Всесвіт/Історія/Стара Земля.md",
    titleUk: "Стара Земля",
    titleEn: "Old Earth",
    en: "content/en/universe/history/old-earth.md",
    body: `After the [[great-departure|Great Departure]] of all three empires from the Solar System, planet Earth became known as "Old Earth." After the [[martian-division-of-the-world|Martian Division of the World]], it passed under Jovian Europa's authority. It is a demilitarized zone.
`,
  },
  {
    source: "content/Всесвіт/Технології/Варп/Варп.md",
    titleUk: "Варп",
    titleEn: "Warp",
    en: "content/en/universe/technologies/warp/warp.md",
    body: `Warp is a technology for crossing enormous distances through so-called "warp jumps." Warp engines are required to make a warp transition.

The warp engine was invented jointly on Jupiter's moon Europa. [[../../europa-jovian/europa-jovian|Jovian Europa]] is a research station where scientists from different empires and planets worked together to create warp.

A jump requires a massive body with gravity, such as Jupiter, that can accelerate a reactor using lawrencium or nobelium and fold space into a corridor leading to another point in space.

Warp engines are installed only on the largest class of starships.
`,
  },
  {
    source: "content/Всесвіт/Технології/Варп/Варп-маяк.md",
    titleUk: "Варп-маяк",
    titleEn: "Warp Beacon",
    en: "content/en/universe/technologies/warp/warp-beacon.md",
    body: `A space buoy drifting in the Lagrange zone of each star system. It serves as a beacon that makes warp jumps possible. Without it, a warp transition is not as precise and can throw a ship many billions of kilometers in different directions.
`,
  },
  {
    source: "content/Всесвіт/Технології/Зоряна Справа/Атмосферні літуни.md",
    titleUk: "Атмосферні літуни",
    titleEn: "Atmospheric Flyers",
    en: "content/en/universe/technologies/star-affairs/atmospheric-flyers.md",
    body: `Among the oldest aircraft known to humanity. They can fly only within an atmosphere at different altitudes, depending on the density and composition of a planet's air. They are used for short flights of 1,000-2,000 kilometers. There are both civilian and military flyers. They are widely used to support the actions of ground invasion or defense forces.

![Atmospheric aviation](../../../../Images/Hetmanat_Atmosphere_Aviation.png)
`,
  },
  {
    source: "content/Всесвіт/Технології/Зоряна Справа/Орбітальна авіація.md",
    titleUk: "Орбітальна авіація",
    titleEn: "Orbital Aviation",
    en: "content/en/universe/technologies/star-affairs/orbital-aviation.md",
    body: `Unlike [[atmospheric-flyers|atmospheric aviation]], orbital aviation can launch from a planet's surface and reach that same planet's orbit. It is used to guard planetary surroundings and to move weapons and troops quickly from one side of a planet to another. It cannot make interplanetary transitions.

![Orbital aviation](../../../../Images/Hetmanat_Orbital_Aviation.png)
`,
  },
]

for (const entry of entries) {
  const sourceAbs = path.join(root, entry.source)
  const enAbs = path.join(root, entry.en)
  const sourceRel = entry.source.replace(/^content\//, "")
  const enRel = entry.en.replace(/^content\//, "")
  const key = enRel
    .replace(/^en\//, "")
    .replace(/\.md$/, "")
    .replace(/\/index$/, "index")
  const ukUrl = slugUrl(sourceRel)
  const enUrl = slugUrl(enRel)

  const original = stripFrontmatter(fs.readFileSync(sourceAbs, "utf8"))
  fs.writeFileSync(
    sourceAbs,
    frontmatter({
      title: entry.titleUk,
      lang: "uk",
      translationKey: key,
      translations: { en: enUrl },
    }) + original,
  )

  fs.mkdirSync(path.dirname(enAbs), { recursive: true })
  fs.writeFileSync(
    enAbs,
    frontmatter({
      title: entry.titleEn,
      lang: "en",
      translationKey: key,
      translations: { uk: ukUrl },
    }) + entry.body,
  )
}

console.log(`Updated ${entries.length} Ukrainian pages and wrote ${entries.length} English pages.`)
await import("./localize-english-paths.mjs")
