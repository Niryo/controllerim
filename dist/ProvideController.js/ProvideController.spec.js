'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var React = _interopRequireWildcard(_react);

var _enzyme = require('enzyme');

var _ProvideController = require('./ProvideController');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ChildComponent = function (_React$Component) {
  _inherits(ChildComponent, _React$Component);

  function ChildComponent() {
    _classCallCheck(this, ChildComponent);

    return _possibleConstructorReturn(this, (ChildComponent.__proto__ || Object.getPrototypeOf(ChildComponent)).apply(this, arguments));
  }

  _createClass(ChildComponent, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { 'data-hook': 'controllerName' },
        this.context.controllers.testController.name
      );
    }
  }]);

  return ChildComponent;
}(React.Component);

ChildComponent.contextTypes = {
  controllers: _propTypes2.default.object
};

describe('ProviderController', function () {
  it('should put the given controller in the context', function () {
    var component = (0, _enzyme.mount)(React.createElement(
      _ProvideController.ProvideController,
      { controller: { name: 'testController' } },
      React.createElement(ChildComponent, null)
    ));
    console.log(component.html());
    expect(component.find('[data-hook="controllerName"]').text()).toEqual('testController');
  });
});