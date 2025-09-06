import { makeBattle } from '../src/factory';
import { simulate } from '../src/engine';
import { teamPresets } from '../src/data/teams';

function toInstances(preset, team) {
    return preset.members.map(m => ({
        uid: '',
        team,
        defId: m.defId,
        level: m.level,
        pos: { row: m.row, col: m.col },
        itemIds: m.itemIds ?? []
    }));
}
test('deterministic with same seed', () => {
    const seed = 'same-seed-test';
    const A = toInstances(teamPresets[0], 'A');
    const B = toInstances(teamPresets[1], 'B');
    const s1 = simulate(makeBattle(seed, A, B));
    const s2 = simulate(makeBattle(seed, A, B));
    expect(JSON.stringify(s1.log)).toEqual(JSON.stringify(s2.log));
});
