describe('The Template Kata', () => {
    describe('Template',  () => {
        class Template {
            render(): String {
                return 'plain text';
            }
        }
        it('renders a plain text template', () => {
            const template = new Template();

            expect(template.render()).toBe('plain text');
        });
    });
});
