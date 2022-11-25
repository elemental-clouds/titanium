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
  }) {
    return {
      urn: args.urn || this.generateRandomUrn(),
      attributes: args.attributes || this.generateRandomAttributes(),
    } as CommonInventoryItem;
  }

  generatePartialMatch() {
    const subset = this.generateSubset();
    const item = this.generateItem({});

    item.attributes = { ...item.attributes, ...subset };

    return {
      item,
      subset: { attributes: subset },
    };
  }

  generateCompoundMatch() {
    const subset1 = this.generateSubset();
    const subset2 = this.generateSubset();
    const item = this.generateItem({});

    item.attributes = { ...item.attributes, ...subset1, ...subset2 };

    return {
      item,
      subset1: { attributes: subset1 },
      subset2: { attributes: subset2 },
    };
  }

  generateCompoundMismatch() {
    const subset1 = this.generateSubset();
    const subset2 = this.generateSubset();
    const item = this.generateItem({});

    item.attributes = { ...item.attributes, ...subset1 };

    return {
      item,
      subset1: { attributes: subset1 },
      subset2: { attributes: subset2 },
    };
  }

  generateMismatch() {
    const item = this.generateItem({});
    const misMatchedItem = this.generateItem({});

    return {
      item,
      misMatchedItem,
    };
  }

  generateSubset() {
    const subset: { [key: string]: unknown } = {};
    const keys = faker.random.words(5).split(' ');
    for (const key of keys) {
      subset[`a_${key}`] = this.generateRandomArray();
      subset[`b_${key}`] = faker.datatype.boolean();
      subset[`n_${key}`] = faker.datatype.number();
      subset[`s_${key}`] = faker.datatype.uuid();
    }

    return subset;
  }

  static getControlProcedure(procedure: unknown) {
    return {
      procedure,
      name: faker.random.word(),
      description: faker.random.words(5),
    } as ControlProcedure;
  }
}

describe('#index.ts', () => {
  describe('#general', () => {
    it('should return COMPLIANT if given an empty check', () => {
      const item = new Test().generateItem({});
      const procedure = Test.getControlProcedure([{}]);
      const check = engine(item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });

    it('should throw if given an unknown keyword', () => {
      const item = new Test().generateItem({});
      const procedure = Test.getControlProcedure([
        { [faker.random.word()]: true },
      ]);
      expect(() => engine(item, procedure)).toThrow(
        'Error: data/procedure/0 must NOT have additional properties'
      );
    });
  });

  describe('#includes', () => {
    it('should return COMPLIANT if given an empty check', () => {
      const item = new Test().generateItem({});
      const procedure = Test.getControlProcedure([{ $includes: [] }]);
      const check = engine(item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given an exact match', () => {
      const item = new Test().generateItem({});
      const procedure = Test.getControlProcedure([{ $includes: [item] }]);
      const check = engine(item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given a partial match', () => {
      const data = new Test().generatePartialMatch();
      const procedure = Test.getControlProcedure([
        { $includes: [data.subset] },
      ]);
      const check = engine(data.item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });

    it('should return NON_COMPLIANT if given a mismatch', () => {
      const data = new Test().generateMismatch();
      const procedure = Test.getControlProcedure([
        { $includes: [data.misMatchedItem] },
      ]);
      const check = engine(data.item, procedure);
      expect(check.result).toBe('NON_COMPLIANT');
    });
  });

  describe('#excludes', () => {
    it('should return COMPLIANT if given an empty check', () => {
      const item = new Test().generateItem({});
      const procedure = Test.getControlProcedure([{ $excludes: [] }]);
      const check = engine(item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given an exact mismatch', () => {
      const { item, misMatchedItem } = new Test().generateMismatch();
      const procedure = Test.getControlProcedure([
        { $excludes: [misMatchedItem] },
      ]);
      const check = engine(item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });

    it('should return NON_COMPLIANT if given an partial mismatch', () => {
      const { item, subset } = new Test().generatePartialMatch();
      const procedure = Test.getControlProcedure([{ $excludes: [subset] }]);
      const check = engine(item, procedure);
      expect(check.result).toBe('NON_COMPLIANT');
    });
  });

  describe('#if_includes', () => {
    it('should return COMPLIANT if given an empty check', () => {
      const item = new Test().generateItem({});
      const procedure = Test.getControlProcedure([{ $if_includes: [] }]);
      const check = engine(item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given an exact match', () => {
      const item = new Test().generateItem({});
      const procedure = Test.getControlProcedure([{ $if_includes: [item] }]);
      const check = engine(item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given a partial match', () => {
      const data = new Test().generatePartialMatch();
      const procedure = Test.getControlProcedure([
        { $if_includes: [data.subset] },
      ]);
      const check = engine(data.item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });

    it('should return SKIPPED if given a mismatch', () => {
      const data = new Test().generateMismatch();
      const procedure = Test.getControlProcedure([
        { $if_includes: [data.misMatchedItem] },
      ]);
      const check = engine(data.item, procedure);
      expect(check.result).toBe('SKIPPED');
    });
  });

  describe('#if_excludes', () => {
    it('should return COMPLIANT if given an empty check', () => {
      const item = new Test().generateItem({});
      const procedure = Test.getControlProcedure([{ $if_excludes: [] }]);
      const check = engine(item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });
    it('should return COMPLIANT if given an exact mismatch', () => {
      const { item, misMatchedItem } = new Test().generateMismatch();
      const procedure = Test.getControlProcedure([
        { $if_excludes: [misMatchedItem] },
      ]);
      const check = engine(item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });
    it('should return SKIPPED if given an partial mismatch', () => {
      const { item, subset } = new Test().generatePartialMatch();
      const procedure = Test.getControlProcedure([{ $if_excludes: [subset] }]);
      const check = engine(item, procedure);
      expect(check.result).toBe('SKIPPED');
    });
  });

  describe('#shape', () => {
    [
      'compliant',
      'controlProcedure',
      'item',
      'nonCompliant',
      'result',
      'skipped',
    ].forEach(key => {
      it(`should have a(n) ${key} attribute`, () => {
        const item = new Test().generateItem({});
        const procedure = Test.getControlProcedure([{ $includes: [item] }]);
        const check = engine(item, procedure);
        expect(Object.keys(check).includes(key)).toBe(true);
      });
    });

    ['compliant', 'nonCompliant', 'skipped'].forEach(key => {
      it(`should see ${key} as an array`, () => {
        const item = new Test().generateItem({});
        const procedure = Test.getControlProcedure([{ $includes: [item] }]);
        const check = engine(item, procedure) as never;
        expect(Array.isArray(check[key])).toBe(true);
      });
    });
  });

  describe('#multiples', () => {
    it('should return COMPLIANT for matched compound includes', () => {
      const data = new Test().generateCompoundMatch();
      const procedure = Test.getControlProcedure([
        { $includes: [data.subset1] },
        { $includes: [data.subset2] },
      ]);
      const check = engine(data.item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });
    it('should return NON_COMPLIANT for mismatched compound includes', () => {
      const data = new Test().generateCompoundMismatch();
      const procedure = Test.getControlProcedure([
        { $includes: [data.subset1] },
        { $includes: [data.subset2] },
      ]);
      const check = engine(data.item, procedure);
      expect(check.result).toBe('NON_COMPLIANT');
    });
    it('should return COMPLIANT for mismatched compound excludes', () => {
      const data = new Test().generateCompoundMismatch();
      const procedure = Test.getControlProcedure([
        { $excludes: [data.subset2] },
        { $excludes: [data.subset2] },
      ]);
      const check = engine(data.item, procedure);
      expect(check.result).toBe('COMPLIANT');
    });
    it('should return NON_COMPLIANT for matched compound excludes', () => {
      const data = new Test().generateCompoundMatch();
      const procedure = Test.getControlProcedure([
        { $excludes: [data.subset1] },
        { $excludes: [data.subset2] },
      ]);
      const check = engine(data.item, procedure);
      expect(check.result).toBe('NON_COMPLIANT');
    });
  });
});
