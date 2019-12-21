import {immutableProxy} from '../src/ImmutableProxy/immutableProxy';

describe('ImmutableProxy', () => {
  let obj;
  let immutableObj;
  beforeEach(()=>{
    obj = {basicProp: 'hello', complexProp: {bla: 'bla'}};
    immutableObj = immutableProxy(obj);
  });
  it('should not allow changing basic props', () => {
    immutableObj.basicProp = 'world';
    expect(immutableObj.basicProp).toEqual('hello');
  });

  it('should not allow changing complex prop', () => {
    immutableObj.complexProp = {not: 'allow'};
    expect(immutableObj.complexProp).toEqual({bla:'bla'});
  });

  it('should not allow changing nested prop', () => {
    immutableObj.complexProp.bla = 'changed';
    expect(immutableObj.complexProp.bla).toEqual('bla');
  });

  it('nested object should be immutable too', () => {
    const nested = immutableObj.complexProp;
    nested.bla= 'changed!';
    expect(nested.bla).toEqual('bla');
  });

  it('should throw warnong when tryig to change prop', () => {
    console.warn = jest.fn();
    immutableObj.basicProp = 'world';
    expect(console.warn).toHaveBeenCalledWith(`Warning: Cannot set prop of immutable object. property "basicProp" will not be set with "world"`);
  });
});