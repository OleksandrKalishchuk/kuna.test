enum ConfigModeType {
  Lock,
  Read,
  Write,
}

enum ConfigValueType {
  String,
  Number,
  Boolean,
}

type ConfigRuleValidator = (value: string) => boolean;

interface ConfigRule {
  value: string | number | boolean;
  type: ConfigValueType;
  mode: ConfigModeType;
  validate?: ConfigRuleValidator;
}

interface ConfigRules {
  [key: string]: ConfigRule;
}

type ConfigValues<T extends ConfigRules> = {
  [K in keyof T]: T[K]['value'];
};

class Config<T extends ConfigRules> {
  private rules: T;
  private values: ConfigValues<T>;

  constructor(rules: T) {
    this.rules = rules;
    this.values = {} as ConfigValues<T>;

    this.loadValues();
  }

  private loadValues(): void {
    for (const key in this.rules) {
      const rule = this.rules[key];

      const envValue = this.getEnvValue(key);
      if (!envValue) {
        this.values[key] = rule.value;
        continue;
      }

      if (rule.validate && !rule.validate(envValue)) {
        throw new Error(`Error value validate (${key}: ${envValue})`);
      }

      this.values[key] = this.parseEnvValue(envValue, rule.type);
    }
  }

  private getEnvValue<K extends keyof T>(key: K): string | undefined {
    return process.env[key];
  }

  private parseEnvValue(
    value: string,
    type: ConfigValueType
  ): string | number | boolean {
    switch (type) {
      case ConfigValueType.Number:
        return +value;
      case ConfigValueType.Boolean:
        return !!value;
      case ConfigValueType.String:
        return `${value}`;
    }
  }

  get<K extends keyof T>(key: K): T[K]['value'] {
    if (this.rules[key].mode < ConfigModeType.Read) {
      throw new Error('Error getting unreadable value');
    }

    return this.values[key];
  }

  set<K extends keyof T>(key: K, value: T[K]['value']): void {
    if (this.rules[key].mode < ConfigModeType.Write) {
      throw new Error('Error setting unwritable value');
    }

    this.values[key] = value;
  }

  tag(template: string): string {
    let result = template;
    for (const key in this.values) {
      result = result.replace(new RegExp(key, 'g'), String(this.values[key]));
    }

    return result;
  }
}

const RABBITMQ = {
  RABBITMQ_HOST: {
    value: 'localhost',
    type: ConfigValueType.String,
    mode: ConfigModeType.Read | ConfigModeType.Write,
    validate: (value: string): boolean => /[a-z]/.test(value),
  },
  RABBITMQ_PORT: {
    value: undefined as unknown as number,
    type: ConfigValueType.Number,
    mode: ConfigModeType.Read,
  },
  RABBITMQ_USER: {
    value: undefined as unknown as string,
    type: ConfigValueType.String,
    mode: ConfigModeType.Write,
  },
  RABBITMQ_PASSWORD: {
    value: undefined as unknown as string,
    type: ConfigValueType.String,
    mode: ConfigModeType.Lock,
  },
};

const config = new Config<typeof RABBITMQ>(RABBITMQ);

console.log(config.get('RABBITMQ_HOST'));

config.set('RABBITMQ_USER', 'username');
console.log(config.get('RABBITMQ_USER'));

console.log(config.tag(`${'RABBITMQ_HOST'}:${'RABBITMQ_PORT'}:${String(12)}`));

// config.set('RABBITMQ_PORT', 'pass'); //Unwritable config error
// config.get('RABBITMQ_PASSWORD', 'pass'); //Unreadable config error
