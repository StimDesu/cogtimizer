
# Cogtimizer
Cogtimizer is an automatic cog board optimization suggestor for Legends of Idleon | The Free IDle MMO.
It is an open-source project that uses a self-written algorithem similar to a diffusion model, to find solutions that use the existing cogs as effective as possible.
All calculations are done on client side to minimize server load.

## About this fork
This is a fork of a fork:
[Monoblos/cogtimizer](https://github.com/Monoblos/cogtimizer) (original)
→ [tkprocat/cogtimizer](https://github.com/tkprocat/cogtimizer) (World 7 support)
→ this repository.

Changes in this fork:
- Board totals are calculated the same way as the game's Construction menu
  (boost shapes, build rate, flaggy rate, player construct EXP, flag speed).
- "Optimize for" setting: balanced, build rate, player EXP, flaggy rate, flag speed or custom weights.
- Improved solver and fewer useless moves.
- Construction checklist read from the save: Redox Rates / Sharper Saws talent levels,
  characters off the board or in cog makers, construction levels, Carpenter / Call Me Bob bubbles,
  construction vials, Seesaw statue, Sawsaw Salala star sign, post office box, gem shop and achievement bonuses.
- Star signs: where the Telescope is, its quest, and the path to Chronus Cosmos / Hydron Cosmos / Sawsaw Salala.
- "Step by step" button: shows one swap at a time with both slots highlighted and numbered, so the in-game drags are easy to follow.
- Layout fixes: the board no longer breaks apart and the settings panel no longer covers it.
- English and Russian interface (language switch in the top menu).

Questions and bug reports: [GitHub issues](https://github.com/StimDesu/cogtimizer/issues).

# Credits
- [Monoblos](https://github.com/Monoblos) for creating Cogtimizer
- [tkprocat](https://github.com/tkprocat) for the World 7 update (tiny cogs, class table, save handling)
- [Bolero-fk](https://github.com/Bolero-fk) for the jewel cog support and the corners fix
- [Xythium](https://github.com/Xythium) for the new classes and large number display

For the nice "Press Start" Font
- codeman38 | cody@zone38.net | http://www.zone38.net/
