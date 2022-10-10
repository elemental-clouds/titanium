import { isMatch } from 'lodash';
import { CommonInventoryItem } from '@elemental-clouds/hydrogen/Common';
import { Control } from './types/Control';
import assert from 'assert';

export default function (item: CommonInventoryItem, control: Control) {
  const decision: boolean[] = [];
  if (control.$includes) {
    decision.push(isMatch(item, control.$includes));
  }

  // if (control.$excludes) {
  //   decision.push(!isMatch(item, control.$excludes));
  // }

  assert(decision.length > 0, new Error('invalid control syntax'));
}
