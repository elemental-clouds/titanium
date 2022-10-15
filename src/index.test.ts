import { CommonInventoryItem } from '@elemental-clouds/hydrogen/Common';
import { ControlProcedure } from './types/Control';
import engine from './index';
import { faker } from '@faker-js/faker';

class Test {
  procedure: ControlProcedure[] = [];
  items: CommonInventoryItem[] = [];

  generateRandomUrn() {
    return faker.random.words(8).split(' ').join(':');
  }

  generateRandomArray() {
    return faker.datatype.array(faker.datatype.number({ min: 5, max: 20 }));
  }

  generateRandomAttributes() {
    const attributes = JSON.parse(faker.datatype.json());
    attributes[faker.datatype.uuid()] = this.generateRandomArray();

    return attributes;
  }

  generateItem(args: {
    urn?: string;
    attributes?: { [key: string]: unknown };
  }): CommonInventoryItem {
    return {
      urn: args.urn || this.generateRandomUrn(),
      attributes: args.attributes || this.generateRandomAttributes(),
    };
  }

  generatePartialMatch() {
    const subset: { [key: string]: unknown } = {};
    const keys = faker.random.words(5).split(' ');
    for (const key of keys) {
      subset[`a_${key}`] = this.generateRandomArray();
      subset[`b_${key}`] = faker.datatype.boolean();
      subset[`n_${key}`] = faker.datatype.number();
      subset[`s_${key}`] = faker.datatype.uuid();
    }

    const item = this.generateItem({});
    const base = JSON.parse(JSON.stringify(item));
    item.attributes = { ...item.attributes, ...subset };
    return {
      base,
      item,
      subset: { attributes: subset },
    };
  }
}

describe('#index.ts', () => {
  it('should return compliant if given an empty check', () => {
    const item = new Test().generateItem({});

    const check = engine(item, [{}]);

    expect(check.result).toBe('COMPLIANT');
  });

  it('should return compliant if given an exact match', () => {
    const item = new Test().generateItem({});

    const check = engine(item, [{ $includes: [item] }]);

    expect(check.result).toBe('COMPLIANT');
  });

  it('should return compliant if given a partial match', () => {
    const data = new Test().generatePartialMatch();

    const check = engine(data.item, [{ $includes: [data.subset] }]);

    expect(check.result).toBe('COMPLIANT');
  });
});
