describe('inverse captcha', () => {
    const digitSum = (a,b) => a === b ? a : 0;

    const inverseCaptcha = (characters: string) => {
        const digits = Array.from(characters)
            .map((c: string) => parseInt(c, 10));

        return [...digits, digits[0]]
            .reduce(
                (acc, cur, idx, src) => acc + digitSum(cur, src[idx+1]),
                0);
    }

    it('should be 1 for singe digit 1', () => {
        expect(inverseCaptcha('1')).toEqual(1);
    });

    it('should be 2 for single digit 2', () => {
        expect(inverseCaptcha('2')).toEqual(2);
    });

    it('should be 0 for 12', () => {
        expect(inverseCaptcha('12')).toEqual(0);
    });

    it('should be 0 for 21', () => {
        expect(inverseCaptcha('21')).toEqual(0);
    });

    it('should be 2 for 11', () => {
        expect(inverseCaptcha('11')).toEqual(2);
    });

    it('should be 4 for 22', () => {
        expect(inverseCaptcha('22')).toEqual(4);
    });

    it('should be 6 for 33', () => {
        expect(inverseCaptcha('33')).toEqual(6);
    });

    it('should be 3 for 111', () => {
        expect(inverseCaptcha('111')).toEqual(3);
    });

    it('should be 6 for 222', () => {
        expect(inverseCaptcha('222')).toEqual(6);
    });

    it('should be 1 for 112', () => {
        expect(inverseCaptcha('112')).toEqual(1);
    });

    it('should be 0 for 123', () => {
        expect(inverseCaptcha('123')).toEqual(0);
    });

    it('should be 2 for 122', () => {
        expect(inverseCaptcha('122')).toEqual(2);
    });

    it('should be 9 for 91212129', () => {
        expect(inverseCaptcha('91212129')).toEqual(9);
    });

    it('should be 0 for 1234', () => {
        expect(inverseCaptcha('1234')).toBe(0);
    });

    it('should be 4 for 1111', () => {
        expect(inverseCaptcha('1111')).toBe(4);
    });

});
