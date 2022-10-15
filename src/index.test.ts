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
    const subset = this.generateSubset();
    const item = this.generateItem({});

    item.attributes = { ...item.attributes, ...subset };

    return {
      item,
      subset: { attributes: subset },
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
}

describe('#index.ts', () => {
  describe('#general', () => {
    it('should return compliant if given an empty check', () => {
      const item = new Test().generateItem({});

      const check = engine(item, [{}]);

      expect(check.result).toBe('COMPLIANT');
    });
  });

  describe('#includes', () => {
    it('should return COMPLIANT if given an empty check', () => {
      const item = new Test().generateItem({});

      const check = engine(item, [{ $includes: [] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given an exact match', () => {
      const item = new Test().generateItem({});

      const check = engine(item, [{ $includes: [item] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given a partial match', () => {
      const data = new Test().generatePartialMatch();

      const check = engine(data.item, [{ $includes: [data.subset] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return NON_COMPLIANT if given a mismatch', () => {
      const data = new Test().generateMismatch();

      const check = engine(data.item, [{ $includes: [data.misMatchedItem] }]);

      expect(check.result).toBe('NON_COMPLIANT');
    });
  });

  describe('#excludes', () => {
    it('should return compliant if given an empty check', () => {
      const item = new Test().generateItem({});

      const check = engine(item, [{ $excludes: [] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given an exact mismatch', () => {
      const { item, misMatchedItem } = new Test().generateMismatch();

      const check = engine(item, [{ $excludes: [misMatchedItem] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return NON_COMPLIANT if given an partial mismatch', () => {
      const { item, subset } = new Test().generatePartialMatch();

      const check = engine(item, [{ $excludes: [subset] }]);

      expect(check.result).toBe('NON_COMPLIANT');
    });
  });

  describe('#if_includes', () => {
    it('should return COMPLIANT if given an empty check', () => {
      const item = new Test().generateItem({});

      const check = engine(item, [{ $if_includes: [] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given an exact match', () => {
      const item = new Test().generateItem({});

      const check = engine(item, [{ $if_includes: [item] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given a partial match', () => {
      const data = new Test().generatePartialMatch();

      const check = engine(data.item, [{ $if_includes: [data.subset] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return SKIPPED if given a mismatch', () => {
      const data = new Test().generateMismatch();

      const check = engine(data.item, [
        { $if_includes: [data.misMatchedItem] },
      ]);

      expect(check.result).toBe('SKIPPED');
    });
  });

  describe('#if_excludes', () => {
    it('should return compliant if given an empty check', () => {
      const item = new Test().generateItem({});

      const check = engine(item, [{ $if_excludes: [] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return COMPLIANT if given an exact mismatch', () => {
      const { item, misMatchedItem } = new Test().generateMismatch();

      const check = engine(item, [{ $if_excludes: [misMatchedItem] }]);

      expect(check.result).toBe('COMPLIANT');
    });

    it('should return SKIPPED if given an partial mismatch', () => {
      const { item, subset } = new Test().generatePartialMatch();

      const check = engine(item, [{ $if_excludes: [subset] }]);

      expect(check.result).toBe('SKIPPED');
    });
  });
});
