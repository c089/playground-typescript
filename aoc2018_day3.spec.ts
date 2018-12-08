import {flatten} from 'fp-ts/lib/Array';
import {Map as MapI, Set as SetI, ValueObject, Range} from 'immutable';
import {readFileSync} from 'fs';

const claimedFabric = (claims) => claims.reduce(
    (fabric, claim) => claimArea(fabric, claim),
    (new Fabric())
);

const parseInput = (input: string) => {
    const lines = input.split('\n');
    return lines
        .filter(x => x.length > 0)
        .map(line => {
            let current, rest;

            [current, rest] = line.split(' @ ');
            const id = current.slice(1);

            [current, rest] = rest.split(',');
            const topLeftX = parseInt(current, 10);

            [current, rest] = rest.split(': ');
            const topLeftY = parseInt(current, 10);

            [current, rest] = rest.split('x');
            const width = parseInt(current, 10);

            [current, rest] = rest.split('\n');
            const height = parseInt(current, 10);

            const claim = { id, topLeft: [topLeftX, topLeftY], width, height };

            return claim;
        });
}


class Claim implements ValueObject {
    id: number;
    topLeft: [number, number];
    width: number;
    height: number;

    constructor({id, topLeft, width, height}) {
        this.id = id;
        this.topLeft = topLeft;
        this.width = width;
        this.height = height;
    }

    equals(other: any) {
        return this.id === other.id;
    }

    hashCode() {
        return this.id;
    }
};

type Coordinate = [number, number];

type CoordinateToClaims = MapI<string, SetI<Claim>>;

class Fabric {

    private map: CoordinateToClaims;

    constructor(map: CoordinateToClaims = MapI()) {
        this.map = map;
    }

    private keyFor([x, y]: Coordinate) {
        return `${x},${y}`;
    }

    private claimsForSquare_(x: [number, number]): SetI<Claim> {
        return this.map.get(this.keyFor(x), SetI());
    }

    claimsForSquare(x: [number, number]): Array<Claim> {
        return this.claimsForSquare_(x).toJS();
    }

    squaresWithConflicts(): CoordinateToClaims {
        return this.map.filter(x => x.size >= 2);
    }

    overlappingSquares(): number {
        return this.squaresWithConflicts().count();
    }

    intactClaims(): Array<Claim> {
        const uniqueValues = s => s.reduce((a,b) => a.union(b));
        const allClaims: SetI<Claim> = uniqueValues(this.map);
        const conflicitingClaims: SetI<Claim> = uniqueValues(this.squaresWithConflicts());
        return allClaims.subtract(conflicitingClaims).toJS();
    }

    claimSquare(coordinate: [number, number], claim): Fabric {
        const key = this.keyFor(coordinate);
        const claims = this.claimsForSquare_(coordinate);
        const newMap =  this.map.set(key, claims.add(claim));
        return new Fabric(newMap);
    }
}

const claimCoordinates = (claim: Claim): Array<Coordinate> => {
    const topLeftX = claim.topLeft[0];
    const topLeftY = claim.topLeft[1];

    const xs = Range(topLeftX, topLeftX + claim.width);
    const ys = Range(topLeftY, topLeftY + claim.height);

    return xs.flatMap((x) => (ys.map(y => [x,y]))).toJS();
};

const claimArea = (fabric: Fabric, claim): Fabric => {
    return claimCoordinates(claim).reduce(
        (fabric, coordinate) => fabric.claimSquare(coordinate, claim),
        fabric);
};

describe('AoC 2018 Day 3: No Matter How You Slice It', () => {
    describe('part1: number of overlapping squares', () => {
        const solvePuzzle = (input) => {
            return claimedFabric(parseInput(input)).overlappingSquares();
        };

        it('given a single claim, there is no overlap', () => {
            expect(solvePuzzle('123 @ 3,2: 5x4')).toEqual(0);
        });

        it('given two identical claims, all squares overlap', () => {
            expect(solvePuzzle('1 @ 3,2: 5x4\n2 @ 3,2: 5x4')).toEqual(20);
        });
    });

    describe('part2: finding the only non overlapping claim', () =>{
        const solvePuzzle = input => {
            const fabric = claimedFabric(parseInput(input));
            const intactClaims = fabric.intactClaims();
            expect(intactClaims.length).toBe(1);
            return intactClaims[0];
        }

        it('works for the example', () => {
            const input =  '#1 @ 1,3: 4x4\n#2 @ 3,1: 4x4\n#3 @ 5,5: 2x2';
            expect(solvePuzzle(input).id).toEqual('3');
        });

        it.skip('solves the puzzle', () => {
            const puzzleInput = readFileSync('./input_day3.txt').toString();
            expect(solvePuzzle(puzzleInput).id).toBe('632');
        });

    });

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
            const claim1 = new Claim( { id: 1, topLeft: [0, 0], width: 1, height: 1 } );
            const claim2 = new Claim( { ...claim1, id: 2 } );
            const claimedFabric = claimArea(claimArea(fabric, claim1), claim2);
            expect(claimedFabric.overlappingSquares()).toEqual(1);
        });

        it('given a fabric with overlapping claims, finds overlap', () => {
            const fabric = new Fabric();
            const claim1 = new Claim( { id: 1, topLeft: [1, 3], width: 4, height: 4 } );
            const claim2 = new Claim( { id: 2, topLeft: [3, 1], width: 4, height: 4 } );
            const claimedFabric = claimArea(claimArea(fabric, claim1), claim2);
            expect(claimedFabric.overlappingSquares()).toEqual(4);
        });
    });

    describe('claimCoordinates', () => {
        it('returns single coordinate for 1x1 square', () => {
            expect(
                claimCoordinates(new Claim( { id: 1, topLeft: [0, 0], width: 1, height: 1 } )))
                .toEqual([[0, 0]]);
        });

        it('returns two coordinates for a 2x1 area', () => {
            expect(
                claimCoordinates(new Claim( { id: 1, topLeft: [0, 0], width: 2, height: 1 } )))
                .toEqual([[0, 0], [1, 0]]);
        });

        it('returns two coordinates for a 1x2 area', () => {
            expect(
                claimCoordinates(new Claim( { id: 1, topLeft: [0, 0], width: 1, height: 2 } )))
                .toEqual([[0, 0], [0, 1]]);
        });

        it('moves claimed area to the right', () => {
            expect(
                claimCoordinates(new Claim( { id: 1, topLeft: [1, 0], width: 2, height: 1 } )))
                .toEqual([[1, 0], [2, 0]]);
        });

        it('moves claimed area up', () => {
            expect(
                claimCoordinates(new Claim( { id: 1, topLeft: [0, 1], width: 2, height: 1 } )))
                .toEqual([[0, 1], [1, 1]]);
        })

        it('returns many coords for a wide area', () => {
            expect(
                claimCoordinates(new Claim( { id: 1, topLeft: [0, 0], width: 400, height: 1 } )).length
            ).toEqual(400);
        });

        it('returns many coords for a wide and high area', () => {
            expect(
                claimCoordinates(new Claim( { id: 1, topLeft: [0, 0], width: 10, height: 10 } )).length
            ).toEqual(100);
        });
    });

    describe('claimArea', () => {
        it('given a fabric and a claim, claims a single square', () => {
            const claim: Claim = new Claim( { id: 123, topLeft: [0, 0], width: 1, height: 1 } );
            const fabric: Fabric = new Fabric();

            expect(claimArea(fabric, claim).claimsForSquare([0, 0])).toEqual([claim]);
        });

        it('given two claims for the same square, records both', () => {
            const claim1: Claim = new Claim( { id: 1, topLeft: [0, 0], width: 1, height: 1 } );
            const claim2: Claim = new Claim( { ...claim1, id: 2 } );
            const fabric: Fabric = new Fabric();

            const claims = claimArea(claimArea(fabric, claim1), claim2)
                .claimsForSquare([0, 0])

            expect(claims).toEqual([claim1, claim2]);
        });

        it('given a fabric and a claim for 2x1 area, claims two squares', () => {
            const claim: Claim = new Claim( {
                id: 123,
                topLeft: [0, 0],
                width: 2,
                height: 1
            } );
            const fabric: Fabric = new Fabric();

            const claimedFabric = claimArea(fabric, claim);

            expect(claimedFabric.claimsForSquare([0, 0])).toEqual([claim]);
            expect(claimedFabric.claimsForSquare([1, 0])).toEqual([claim]);
        });

        it('given a fabric and a claim for 1x2 area, claims two squares', () => {
            const claim: Claim = new Claim( {
                id: 123,
                topLeft: [0, 0],
                width: 1,
                height: 2
            } );
            const fabric: Fabric = new Fabric();

            const claimedFabric = claimArea(fabric, claim);

            expect(claimedFabric.claimsForSquare([0, 0])).toEqual([claim]);
            expect(claimedFabric.claimsForSquare([0, 1])).toEqual([claim]);
        });
    });
});
