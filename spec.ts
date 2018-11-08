describe('The Template Kata', () => {
    describe('Template',  () => {
        class Template {
            values;
            template;

            constructor(template) {
                this.values = {};
                this.template = template;
            }

            set(name, value) {
                this.values[name] = value;
            }

            render(): String {
                if (this.values.name) return 'Hello, ' + this.values.name;
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

        it('replaces a variable with a different value', () => {
            const template = new Template('Hello, {$name}');

            template.set('name', 'Nat');

            expect(template.render()).toBe('Hello, Nat');
        });
    });
});
