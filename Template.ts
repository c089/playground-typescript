export class Template {
    values;
    template;

    constructor(template) {
        this.values = {};
        this.template = template;
    }

    set(name, value) {
        this.values[name] = value;
    }

    private replaceVariable(variableName) {
        return this.template.replace('${' + variableName + '}', this.values[variableName]);
    }

    render(): String {
        if (this.values.name) return this.replaceVariable('name');
        if (this.values.firstName) return this.replaceVariable('firstName');
        return 'plain text';
    }
}
