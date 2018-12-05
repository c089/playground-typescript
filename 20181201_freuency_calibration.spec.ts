import { findFirst, scanLeft, tail } from 'fp-ts/lib/Array';
import { Option } from 'fp-ts/lib/Option';

const calibrateFrequency = (input: string): number => {
    const numbers = input.split(', ').map(x => parseInt(x, 10));
    if (input === '') return 0;
    return numbers.reduce((a, b) => a + b, 0);
}

describe('frequency calibration', () => {
    it('starts at 0', () => {
        expect(calibrateFrequency('')).toBe(0);
    });

    it('adds 1', () => {
        expect(calibrateFrequency('+1')).toBe(1);
    });

    it('adds 2', () => {
        expect(calibrateFrequency('+2')).toBe(2);
    });

    it('adds a large number', () => {
        expect(calibrateFrequency('+2000')).toBe(2000);
    });

    it('subtracts 1', () => {
        expect(calibrateFrequency('-1')).toBe(-1);
    });

    it('subtracts 2', () => {
        expect(calibrateFrequency('-2')).toBe(-2);
    });

    it('subtracts a large number', () => {
        expect(calibrateFrequency('-904')).toBe(-904);
    });

    it('adds two numbers', () => {
        expect(calibrateFrequency('+1, +1')).toBe(2);
    });

    it('adds two large numbers', () => {
        expect(calibrateFrequency('+204, +102')).toBe(306);
    });
});

describe('duplicate frequency finder', () => {
    const sum = (a, b) => a + b;
    const sums = (xs, initial) => scanLeft(xs, initial, sum);

    const findDuplicate = (xs: number[]): Option<number> => {
        let seen = new Set();
        const possibleDuplicate = findFirst(xs, x => {
            if (seen.has(x)) {
                return true;
            }
            seen.add(x);
            return false;
        });

        return possibleDuplicate;
    }

    const buildFrequencies = (frequencyChanges: number[], seen = [0]) => {
        const previousFrequency = seen[seen.length - 1];
        return tail(sums(frequencyChanges, previousFrequency))
            .map(xs => [...seen, ...xs]).getOrElse([]);
    }

    const calibrateFrequencyOnFirstDuplicate = (frequencyChanges, seen = [0]) => {
        const frequencies = buildFrequencies(frequencyChanges, seen);
        return findDuplicate(frequencies).getOrElseL(
            () => calibrateFrequencyOnFirstDuplicate(frequencyChanges, frequencies)
        );
    }

    const calibrateFrequency2 = (input: string) => {
        if (input === '') return 0;
        const frequencyChanges: number[] = input.split(', ').map(x => parseInt(x, 10));

        return calibrateFrequencyOnFirstDuplicate(frequencyChanges);
    };

    it('stops quickly when it finds a duplicate frequency', () => {
        expect(calibrateFrequency2('+1, -1')).toEqual(0);
        expect(calibrateFrequency2('+2, -2')).toEqual(0);
    });

    it('stops when it finds a duplicate frequency after 3 values', () => {
        expect(calibrateFrequency2('+1, +1, -1')).toEqual(1);
    });

    it('repeats when it cant find a duplicate in one go', () => {
        expect(calibrateFrequency2('+3, +3, +4, -2, -4')).toEqual(10);
    });

    it('solves the puzzle', () => {
        expect(calibrateFrequency2(puzzleInput)).toEqual(70357)
    })

});

