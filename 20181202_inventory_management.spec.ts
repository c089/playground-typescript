import { groupBy } from 'fp-ts/lib/NonEmptyArray';

const checksum = (boxIds => {
    const idsCountingForN = n => boxIds
        .filter(id => {
            const letters: Array<string> = id.split('');
            const groupedLettersByCount = groupBy(letters, letter =>
                    letters.filter(l => letter == l).length.toString());
            return groupedLettersByCount[n] !== undefined;
    });

    return idsCountingForN(2).length * idsCountingForN(3).length;
});

describe('Advent of Code 2018 Day 2: Inventory management', () => {
    const idWithNoStringAppearingExactlyTwoOrThreeTimes = 'abcdef';
    const idCountingForBoth = 'bababc';
    const idCountingFor2ButNot3 = 'abbcde';
    const idContaingTwoLettersTwiceButNoneThreeTimes = 'aabcdd';
    const idCountingFor3ButNot2 = 'abcccd';
    const idContainingThreeLettersTwiceButNoneTwoTimes = 'ababab';
    it('given no letter appears more than once, returns 0', () => {
        expect(checksum([idWithNoStringAppearingExactlyTwoOrThreeTimes])).toEqual(0);
    });

    it('given an id with two b, nut no letter appearing three times, counts 1*0', () => {
        expect(checksum([idCountingFor2ButNot3])).toEqual(0);
    });

    it('given an id with three c, but no letter appearing two times, counts 0*1', () => {
        expect(checksum([idCountingFor3ButNot2])).toEqual(0);
    })

    it('given two leters appear two times, it only counts for one', () => {
        expect(checksum([idContaingTwoLettersTwiceButNoneThreeTimes])).toEqual(0);
    });

    it('given an id where more than one letter appear three times, it only counts for one', () => {
        expect(checksum([idContainingThreeLettersTwiceButNoneTwoTimes])).toEqual(0);
    });

    it('given an id with two a and three b, it should count for both: 1*1=1', () => {
        expect(checksum([idCountingForBoth])).toEqual(1);
    });

    it('multiplies counts for two boxes', () => {
        expect(checksum([
            idWithNoStringAppearingExactlyTwoOrThreeTimes,
            idCountingFor2ButNot3,
            idCountingFor3ButNot2,
            idContaingTwoLettersTwiceButNoneThreeTimes,
            idContainingThreeLettersTwiceButNoneTwoTimes,
            idCountingForBoth,
            'abcdee'
        ])).toEqual(12);
    });
});
