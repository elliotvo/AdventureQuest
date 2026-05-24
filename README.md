# AdventureQuest

AdventureQuest er et lille browser-spil, hvor man vælger en helt, går rundt i
en grotte, finder skatte og kæmper mod monstre.

## Hvilken teknologi bruger spillet?

Første version bruger kun:

- **HTML** til spillets knapper og tekst.
- **CSS** til farver, kortet og layout på PC og iPad.
- **JavaScript** til reglerne: heltevalg, bevægelse, skatte, monstre og sejr.

Det betyder, at spillet kan åbnes direkte i en browser uden login, database
eller tung opsætning. Senere kan vi lægge jeres tegninger ind som billeder og
eventuelt bruge et lille spil-bibliotek, hvis spillet skal have animationer,
lyde og større baner.

## Sådan spiller du

1. Åbn `index.html` i en browser.
2. Vælg en helt.
3. Brug piletasterne på PC eller de store knapper på iPad.
4. Saml 3 skatte.
5. Find udgangen og vind spillet.

## Sådan kører man spillet lokalt

Den nemmeste måde er at dobbeltklikke på `index.html`.

Hvis browseren på et tidspunkt blokerer lokale filer, kan en voksen starte en
lille webserver fra mappen:

```bash
python3 -m http.server 8000
```

Åbn derefter:

```text
http://localhost:8000
```

## Plan for at bygge videre

### Trin 1: Spilbar prototype

- [x] Vælg mellem flere helte.
- [x] Gå rundt i et grottesystem.
- [x] Find skatte.
- [x] Kæmp mod monstre.
- [x] Vind ved at finde udgangen.

### Trin 2: Brug jeres tegninger

- Scan eller fotografer tegningerne.
- Gem dem som `.png` eller `.webp`.
- Lav mapper som `assets/heroes/` og `assets/monsters/`.
- Udskift de farvede felter i spillet med billederne.

Forslag til filnavne:

```text
assets/heroes/sword-hero.png
assets/heroes/shield-hero.png
assets/heroes/spark-hero.png
assets/monsters/cave-monster.png
assets/treasures/chest.png
```

### Trin 3: Gør spillet sjovere

- Flere baner.
- Flere monstre med forskellige styrker.
- Nøgler, døre og hemmelige rum.
- Lydeffekter.
- En startskærm med spillets historie.

### Trin 4: Del spillet

Når spillet er klart, kan det udgives med GitHub Pages, så man kan spille det
via et link på PC og iPad.
