import { groupBy } from 'fp-ts/lib/NonEmptyArray';
import { zipWith } from 'fp-ts/lib/Array';
import { left, right, isRight } from 'fp-ts/lib/Either';
import { some, none } from 'fp-ts/lib/Option';

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

    describe('part 2', () => {
        const commonCharacters = (id1, id2) => {
            return zipWith(id1, id2, (a: string, b: string) => a == b ? some(a) : none)
                .reduce((acc, maybeSame) => maybeSame.map(distinctPairs => acc + distinctPairs).getOrElse(acc), '');
        };

        const haveDifferenceOfOne = ([id1, id2]) => {
            return zipWith(id1, id2, (a, b) => a == b ? left(a) : right([a, b]))
                .filter(isRight).length === 1;
        };

        const distinctPairs = <A>(xs: Array<A>): Array<[A, A]> => {
            const result = [];
            for (let i = 0; i < xs.length; i++) {
                for (let j = i + 1; j < xs.length; j++) {
                    result.push([xs[i], xs[j]]);
                }
            }
            return result;
        }

        const filterByDifferenceOfOne = (input: Array<string>) => {
            return distinctPairs(input)
                .filter(haveDifferenceOfOne);
        }

        const puzzle = ids => {
            return filterByDifferenceOfOne(ids).map(([a, b]) => commonCharacters(a, b))
        };

        describe('puzzle', () => {
            it('solves the puzzle', () => {
                expect(puzzle([
                    'abcde',
                    'fghij',
                    'klmno',
                    'pqrst',
                    'fguij',
                    'axcye',
                    'wvxyz'
                ])).toEqual(['fgij']);
            });
        });

        describe('commonCharacters', () => {
            it('works for two boxes with a distance of 1', () => {
                expect(commonCharacters('fghij', 'fguij')).toEqual('fgij');
            });

            it('works for two boxes with a distance of 2', () => {
                expect(commonCharacters('fghij', 'fguix')).toEqual('fgi');
            });

            it('works for two boxes no shared charactesr', () => {
                expect(commonCharacters('abc', 'xyz')).toEqual('');
            });
        });

        describe('filterByDifferenceOfOne', () => {

            it('given two ids differing by one charater, returns both', () => {
                expect(filterByDifferenceOfOne(['fghij', 'fguij'])).toEqual([['fghij', 'fguij']]);
            });

            it('given two ids differing by two characters, return neither', () => {
                expect(filterByDifferenceOfOne(['fghij', 'fguix'])).toEqual([]);
            });

            it('distinctPairs shuold foo', () => {
                expect(distinctPairs([1, 2, 3])).toEqual([[1, 2], [1, 3], [2, 3]]);
            });

            it('given two ids differing by one charater and another one, returns both', () => {
                expect(filterByDifferenceOfOne(['fghij', 'vwxyz', 'fguij'])).toEqual([
                    ['fghij', 'fguij']
                ]);
            });
        });
    });

});
