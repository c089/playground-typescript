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

    render(): String {
        if (this.values.name) return this.template.replace('${name}', this.values.name);
        if (this.values.firstName) return this.template.replace('${firstName}', this.values.firstName);
        return 'plain text';
    }
}
