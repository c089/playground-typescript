describe('The Template Kata', () => {
    describe('Template',  () => {
        it('renders a plain text template', () => {
            class Template {
                render(): String {
                    return null;
                }
            }
            const template = new Template();

            expect(template.render()).toBe('plain text');
        });
    });
});
