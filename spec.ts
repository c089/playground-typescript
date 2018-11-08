import { Template } from './Template';

describe('The Template Kata', () => {
    describe('Template',  () => {
        it('renders a plain text template', () => {
            const template = new Template('plain text');

            expect(template.render()).toBe('plain text');
        });

        it('replaces a variable', () => {
            const template = new Template('Hello, ${name}');

            template.set('name', 'Chris');

            expect(template.render()).toBe('Hello, Chris');
        });

        it('replaces a variable with a different value', () => {
            const template = new Template('Hello, ${name}');

            template.set('name', 'Nat');

            expect(template.render()).toBe('Hello, Nat');
        });

        it('replaces a different variable', () => {
            const template = new Template('Hello, ${firstName}');

            template.set('firstName', 'John');

            expect(template.render()).toBe('Hello, John');
        });

        it.skip('replaces multiple variables', () => {
            const template = new Template('Hello, ${a} and {b} and {c}');

            template.set('a', 'Mr. A');
            template.set('b', 'Ms. B');
            template.set('c', 'Mx. C');

            expect(template.render()).toBe('Hello, Mr. A and Ms. B and Mx. C');
        });
    });
});
