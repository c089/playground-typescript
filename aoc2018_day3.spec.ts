import { Map as MapI, Set as SetI, ValueObject, Range } from 'immutable';
import { readFileSync } from 'fs';

const parseClaim = (claim: string): Claim => {
    let current, rest;

    [current, rest] = claim.split(' @ ');
    const id = current.slice(1);

    [current, rest] = rest.split(',');
    const topLeftX = parseInt(current, 10);

    [current, rest] = rest.split(': ');
    const topLeftY = parseInt(current, 10);

    [current, rest] = rest.split('x');
    const width = parseInt(current, 10);

    [current, rest] = rest.split('\n');
    const height = parseInt(current, 10);

    return claimOf({ id, topLeft: [topLeftX, topLeftY], width, height });
}
const parseInput = (input: string): Array<Claim> => {
    return input
        .split('\n')
        .filter(x => x.length > 0)
        .map(parseClaim);
}

class Claim implements ValueObject {
    id: number;
    topLeft: [number, number];
    width: number;
    height: number;

    constructor({ id, topLeft, width, height }) {
        this.id = id;
        this.topLeft = topLeft;
        this.width = width;
        this.height = height;
    }

    coordinates(): CoordinateValue[] {
        const topLeftX = this.topLeft[0];
        const topLeftY = this.topLeft[1];

        const xs = Range(topLeftX, topLeftX + this.width);
        const ys = Range(topLeftY, topLeftY + this.height);

        return xs.flatMap((x) => (ys.map(y => coordinateOf(x,y)))).toJS();
    }

    equals(other: any) {
        return this.id === other.id;
    }

    hashCode() {
        return this.id;
    }
};

type CoordinateValue = { x: number; y: number; } & ValueObject;

const coordinateOf = (x: number, y: number): CoordinateValue => ({
    x,
    y,
    equals: (other) => {
        return other !== undefined && x === other.x && y === other.y;
    },
    hashCode: () => {
        return x+y;
    }
});

type CoordinateToClaims = MapI<CoordinateValue, SetI<Claim>>;

class Fabric {

    private map: CoordinateToClaims;

    constructor(map: CoordinateToClaims = MapI()) {
        this.map = map;
    }

    claimArea(claim: Claim): Fabric {
        return claim.coordinates().reduce(
            (fabric, coordinate) => fabric.claimSquare(coordinate, claim),
            this);
    }

    claimAll(claims: Claim[]): Fabric {
        return claims.reduce(
            (fabric, claim) => fabric.claimArea(claim),
            this
        );

    }

    claimsForSquare(coordinate: CoordinateValue): Array<Claim> {
        return this.claimsForSquare_(coordinate).toJS();
    }

    overlappingSquares(): number {
        return this.squaresWithConflicts().count();
    }

    intactClaims(): Array<Claim> {
        const uniqueValues = s => s.reduce((a, b) => a.union(b));
        const allClaims: SetI<Claim> = uniqueValues(this.map);
        const conflicitingClaims: SetI<Claim> = uniqueValues(this.squaresWithConflicts());
        return allClaims.subtract(conflicitingClaims).toJS();
    }

    private squaresWithConflicts(): CoordinateToClaims {
        return this.map.filter(x => x.size >= 2);
    }

    private claimsForSquare_(x: CoordinateValue): SetI<Claim> {
        return this.map.get(x, SetI());
    }


    private claimSquare(coordinate: CoordinateValue, claim): Fabric {
        const claims = this.claimsForSquare_(coordinate);
        const newMap = this.map.set(coordinate, claims.add(claim));
        return new Fabric(newMap);
    }
}

const claimOf = function ({ id, topLeft, width, height}) {
    return new Claim({ id, topLeft, width, height });
};

describe('AoC 2018 Day 3: No Matter How You Slice It', () => {
    describe('part1: number of overlapping squares', () => {
        const solvePuzzle = (input) => {
            return (new Fabric().claimAll((parseInput(input)))).overlappingSquares();
        };

        it('given a single claim, there is no overlap', () => {
            expect(solvePuzzle('#123 @ 3,2: 5x4')).toEqual(0);
        });

        it('given two identical claims, all squares overlap', () => {
            expect(solvePuzzle('#1 @ 3,2: 5x4\n2 @ 3,2: 5x4')).toEqual(20);
        });
    });

    describe('part2: finding the only non overlapping claim', () => {
        const solvePuzzle = input => {
            const intactClaims = new Fabric().claimAll(parseInput(input)).intactClaims();
            expect(intactClaims.length).toBe(1);
            return intactClaims[0];
        }

        it('works for the example', () => {
            const input = '#1 @ 1,3: 4x4\n#2 @ 3,1: 4x4\n#3 @ 5,5: 2x2';
            expect(solvePuzzle(input).id).toEqual('3');
        });

        it.skip('solves the puzzle', () => {
            const puzzleInput = readFileSync('./input_day3.txt').toString();
            expect(solvePuzzle(puzzleInput).id).toBe('632');
        });

    });

    describe('CoordinateValue', () => {
        describe('implements Immutable.ValueObject', () => {
            it('treats two as equal', () => {
                expect(coordinateOf(0, 0).equals(coordinateOf(0, 0))).toBe(true);
            });

            it('treats two as different for different x', () => {
                expect(coordinateOf(0, 0).equals(coordinateOf(1, 0))).toBe(false);
            });

            it('treats two as different for different y', () => {
                expect(coordinateOf(0, 0).equals(coordinateOf(0, 1))).toBe(false);
            });

            it('treats undefined as different', () => {
                expect(coordinateOf(0, 0).equals(undefined)).toBe(false);
            });
        });
    })

    describe('parseInput', () => {
        it('parses a single claim', () => {
            expect(parseInput('#1 @ 1,3: 4x4')).toEqual([
                { id: '1', topLeft: [1, 3], width: 4, height: 4 }
            ]);
        });

        it('parses the id', () => {
            expect(parseInput('#foo @ 1,3: 4x4')).toEqual([
                { id: 'foo', topLeft: [1, 3], width: 4, height: 4 }
            ]);
        });

        it('parses the top X value', () => {
            expect(parseInput('#1 @ 1024,3: 4x4')).toEqual([
                { id: '1', topLeft: [1024, 3], width: 4, height: 4 }
            ]);
        });

        it('parses the top Y value', () => {
            expect(parseInput('#1 @ 1,2048: 4x4')).toEqual([
                { id: '1', topLeft: [1, 2048], width: 4, height: 4 }
            ]);
        });

        it('parses the width', () => {
            expect(parseInput('#1 @ 1,3: 42x4')).toEqual([
                { id: '1', topLeft: [1, 3], width: 42, height: 4 }
            ]);
        });

        it('parses the height', () => {
            expect(parseInput('#1 @ 1,3: 4x90')).toEqual([
                { id: '1', topLeft: [1, 3], width: 4, height: 90 }
            ]);
        });

        it('parses many claims', () => {
            const input = '#1 @ 1,3: 4x4\n#2 @ 3,1: 4x4\n#3 @ 5,5: 2x2';
            expect(parseInput(input)).toEqual([
                { id: '1', topLeft: [1, 3], width: 4, height: 4 },
                { id: '2', topLeft: [3, 1], width: 4, height: 4 },
                { id: '3', topLeft: [5, 5], width: 2, height: 2 }
            ]);
        });
        it('handles trailing newlines', () => {
            const input = '#1 @ 1,3: 4x4\n';
            expect(parseInput(input)).toEqual([
                { id: '1', topLeft: [1, 3], width: 4, height: 4 },
            ]);
        });
    });

    describe('overlappingSquares', () => {
        it('given a new fabric, has no overlap', () => {
            const fabric = new Fabric();
            expect(fabric.overlappingSquares()).toEqual(0);
        });

        it('given a fabric with identical claims, finds overlap', () => {
            const fabric = new Fabric();
            const claim1 = claimOf({ id: 1, topLeft: [0, 0], width: 1, height: 1 });
            const claim2 = claimOf({ ...claim1, id: 2 });
            const claimedFabric = fabric.claimAll([claim1, claim2]);
            expect(claimedFabric.overlappingSquares()).toEqual(1);
        });

        it('given a fabric with overlapping claims, finds overlap', () => {
            const fabric = new Fabric();
            const claim1 = claimOf({ id: 1, topLeft: [1, 3], width: 4, height: 4 });
            const claim2 = claimOf({ id: 2, topLeft: [3, 1], width: 4, height: 4 });
            const claimedFabric = fabric.claimAll([claim1, claim2]);
            expect(claimedFabric.overlappingSquares()).toEqual(4);
        });
    });

    describe('Claim.coordinates()', () => {
        const coordinatesClaimedBy = ({ topLeft, width, height }) => {
            return claimOf({
                id: 1,
                topLeft,
                width,
                height
            }).coordinates().map(c=>[c.x,c.y]);
        };

        it('returns single coordinate for 1x1 square', () => {
            expect(coordinatesClaimedBy({ topLeft: [0, 0], width: 1, height: 1 }))
                .toEqual([[0, 0]]);
        });

        it('returns two coordinates for a 2x1 area', () => {
            expect(
                coordinatesClaimedBy({ topLeft: [0, 0], width: 2, height: 1 }))
                .toEqual([[0, 0], [1, 0]]);
        });

        it('returns two coordinates for a 1x2 area', () => {
            expect(
                coordinatesClaimedBy({ topLeft: [0, 0], width: 1, height: 2 }))
                .toEqual([[0, 0], [0, 1]]);
        });

        it('moves claimed area to the right', () => {
            expect(
                coordinatesClaimedBy({ topLeft: [1, 0], width: 2, height: 1 }))
                .toEqual([[1, 0], [2, 0]]);
        });

        it('moves claimed area up', () => {
            expect(
                coordinatesClaimedBy({ topLeft: [0, 1], width: 2, height: 1 }))
                .toEqual([[0, 1], [1, 1]]);
        })

        it('returns many coords for a wide area', () => {
            expect(
                coordinatesClaimedBy({ topLeft: [0, 0], width: 400, height: 1 }).length
            ).toEqual(400);
        });

        it('returns many coords for a wide and high area', () => {
            expect(
                coordinatesClaimedBy({ topLeft: [0, 0], width: 10, height: 10 }).length
            ).toEqual(100);
        });
    });

    describe('claimArea', () => {
        const claimsAt = (fabric, [x,y]) => fabric.claimsForSquare(coordinateOf(x,y));

        it('given a fabric and a claim, claims a single square', () => {
            const claim: Claim = claimOf({ id: 123, topLeft: [0, 0], width: 1, height: 1 });
            const fabric: Fabric = new Fabric().claimArea(claim);

            expect(claimsAt(fabric, [0,0])).toEqual([claim]);
        });

        it('given two claims for the same square, records both', () => {
            const claim1: Claim = claimOf({ id: 1, topLeft: [0, 0], width: 1, height: 1 });
            const claim2: Claim = claimOf({ ...claim1, id: 2 });
            const fabric: Fabric = new Fabric().claimArea(claim1).claimArea(claim2);

            const claims = claimsAt(fabric, [0, 0]);

            expect(claims).toEqual([claim1, claim2]);
        });

        it('given a fabric and a claim for 2x1 area, claims two squares', () => {
            const claim: Claim = claimOf({
                id: 123,
                topLeft: [0, 0],
                width: 2,
                height: 1
            });
            const fabric: Fabric = new Fabric();

            const claimedFabric = fabric.claimArea(claim);

            expect(claimsAt(claimedFabric, [0, 0])).toEqual([claim]);
            expect(claimsAt(claimedFabric, [1, 0])).toEqual([claim]);
        });

        it('given a fabric and a claim for 1x2 area, claims two squares', () => {
            const claim: Claim = claimOf({
                id: 123,
                topLeft: [0, 0],
                width: 1,
                height: 2
            });
            const fabric: Fabric = new Fabric().claimArea(claim);

            expect(claimsAt(fabric, [0, 0])).toEqual([claim]);
            expect(claimsAt(fabric, [0, 1])).toEqual([claim]);
        });
    });
});
