import sell from '../../../common/script/ops/sell';
import i18n from '../../../common/script/i18n';
import {
  generateUser,
} from '../../helpers/common.helper';
import {
  NotAuthorized,
  BadRequest,
  NotFound,
} from '../../../common/script/libs/errors';
import content from '../../../common/script/content/index';

describe('shared.ops.sell', () => {
  let user;
  let type = 'eggs';
  let key = 'Wolf';
  let acceptedTypes = ['eggs', 'hatchingPotions', 'food'];

  beforeEach(() => {
    user = generateUser();
    user.items[type][key] = 1;
  });

  it('returns an error when type is not provided', (done) => {
    try {
      sell(user);
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('typeRequired'));
      done();
    }
  });

  it('returns an error when key is not provided', (done) => {
    try {
      sell(user, {params: { type } });
    } catch (err) {
      expect(err).to.be.an.instanceof(BadRequest);
      expect(err.message).to.equal(i18n.t('keyRequired'));
      done();
    }
  });

  it('returns an error when non-sellable type is provided', (done) => {
    let nonSellableType = 'nonSellableType';

    try {
      sell(user, {params: { type: nonSellableType, key } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotAuthorized);
      expect(err.message).to.equal(i18n.t('typeNotSellable', {acceptedTypes: acceptedTypes.join(', ')}));
      done();
    }
  });

  it('returns an error when key is not found with type provided', (done) => {
    let fakeKey = 'fakeKey';

    try {
      sell(user, {params: { type, key: fakeKey } });
    } catch (err) {
      expect(err).to.be.an.instanceof(NotFound);
      expect(err.message).to.equal(i18n.t('userItemsKeyNotFound', {type}));
      done();
    }
  });

  it('reduces item count from user', () => {
    let [, message] = sell(user, {params: { type, key } });

    expect(message).to.equal(i18n.t('sold', {type, key}));
    expect(user.items[type][key]).to.equal(0);
  });

  it('increases user\'s gold', () => {
    let [, message] = sell(user, {params: { type, key } });

    expect(message).to.equal(i18n.t('sold', {type, key}));
    expect(user.stats.gp).to.equal(content[type][key].value);
  });
});
