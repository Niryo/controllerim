class Base {
  test(){
    console.log(Object.keys(Object.getPrototypeOf(this)));
    console.log(Reflect.ownKeys(Reflect.getPrototypeOf(this)));
  }
  s(){
    const proto = Reflect.getPrototypeOf(this);
    proto['apply'] = () => {
      console.log('swizzeld')
      return 'wtf'
    };
  }
}

class Test extends Base {
  apply() {
    this.test();
  }
}

const test = new Test();
console.log(test.apply());
test.s();
console.log(test.apply());
