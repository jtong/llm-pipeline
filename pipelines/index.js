class PipelineComponent {
    async run(input) {
        throw new Error('Run method must be implemented');
    }
}

class Pipe extends PipelineComponent {
    constructor(func) {
        super();
        this.func = func;
        this.context = {};
    }

    async run(input) {
        try {
            return await this.func(input, this.context);
        } catch (error) {
            throw error;
        }
    }

    // 设置闭包变量
    setContext(key, value) {
        this.context[key] = value;
        return this;
    }

    // 克隆 Pipe 对象,并清空闭包变量
    clone() {
        const clonedPipe = new Pipe(this.func);
        clonedPipe.context = {}; // 确保克隆后的 Pipe 有一个全新的 context
        return clonedPipe;
    }
}


class Pipeline extends PipelineComponent {
    constructor() {
        super();
        this.components = [];
    }

    add(component) {
        if (component instanceof PipelineComponent) {
            this.components.push(component);
        } else {
            throw new Error('Component must be a Pipe or Pipeline');
        }
        return this;
    }

    async run(input) {
        let result = input;
        for (let component of this.components) {
            result = await component.run(result);
        }
        return result;
    }
}

const empty_pipe = new Pipe(async(input) => input )

class ConditionalPipe extends PipelineComponent {
    constructor(conditionFunc) {
        super();
        this.conditionFunc = conditionFunc; // 为什么要用function，而不用pipe，因为pipe有个职责是要维护input这个context持续向后传，而我们希望这个function不要有赋值动作，不要有这个义务，返回true/false
        this.trueComponent = empty_pipe;
        this.falseComponent = empty_pipe;
    }

    setTrueComponent(component) {
        if (component instanceof PipelineComponent) {
            this.trueComponent = component;
        } else {
            throw new Error('True component must be a Pipe or Pipeline');
        }
        return this;
    }

    setFalseComponent(component) {
        if (component instanceof PipelineComponent) {
            this.falseComponent = component;
        } else {
            throw new Error('False component must be a Pipe or Pipeline');
        }
        return this;
    }

    async run(input) {
        if (!this.trueComponent || !this.falseComponent) {
            throw new Error('Conditional pipe requires both true and false components');
        }

        try {
            const conditionResult = await this.conditionFunc(input);
            if (conditionResult) {
                return await this.trueComponent.run(input);
            } else {
                return await this.falseComponent.run(input);
            }
        } catch (error) {
            throw error;
        }
    }
}

class LoopPipe extends PipelineComponent {
    constructor(conditionFunc) {
        super();
        this.conditionFunc = conditionFunc; // 设置循环条件
        this.loopComponent = null;
    }

    setLoopComponent(component) {
        if (!(component instanceof PipelineComponent)) {
            throw new Error('Loop component must be a Pipe or Pipeline');
        }
        this.loopComponent = component;
        return this;
    }

    async run(input) {
        if (!this.loopComponent) {
            throw new Error('Loop component is not set');
        }

        let result = input;
        while (await this.conditionFunc(result)) {
            result = await this.loopComponent.run(result);
        }
        return result;
    }
}

module.exports = {
    Pipeline,
    Pipe,
    ConditionalPipe,
    LoopPipe
};
