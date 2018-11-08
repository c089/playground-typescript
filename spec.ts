describe('The Template Kata', () => {
    describe('Template',  () => {
        class Template {
            constructor(template) {
                
            }

            set(name, value) {
                
            }

            render(): String {
                return 'plain text';
            }
        }
        it('renders a plain text template', () => {
            const template = new Template('plain text');

            expect(template.render()).toBe('plain text');
        });

        it('replaces a variable', () => {
            const template = new Template('Hello, {$name}');

            template.set('name', 'Chris');

            expect(template.render()).toBe('Hello, Chris');
        });
    });
});
