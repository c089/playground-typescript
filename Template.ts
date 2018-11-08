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
        if (this.values.name) return 'Hello, ' + this.values.name;
        return 'plain text';
    }
}
