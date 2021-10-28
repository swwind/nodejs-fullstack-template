import { expect } from "chai";

describe('Basic components', () => {
  it('A + B testing', () => {
    expect(0.1 + 0.2).to.not.equal(0.3);
    expect(1 + 2).to.equal(3);
  });
  it('A - B testing', () => {
    expect(1 - 2).to.equal(-1);
  });
});
