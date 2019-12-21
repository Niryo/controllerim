import * as React from 'react';
import { Controller, observer } from '../../src/index';

class Acon extends Controller { constructor(comp) { super(comp); this.state = { a: 'a' }; } }
class Bcon extends Controller { constructor(comp) { super(comp); this.state = { b: 'b' }; } }
class Ccon extends Controller { constructor(comp) { super(comp); this.state = { c: 'c' }; } }
Acon.controllerName = 'Acon';
Bcon.controllerName = 'Bcon';
Ccon.controllerName = 'Ccon';
export const BasicStateTree = observer(class extends React.Component { componentWillMount() { this.controller = new Acon(this); } render() { return (<div><B /><C /></div>); } });
const B = observer(class extends React.Component { componentWillMount() { this.controller = new Bcon(this); } render() { return (<div><C /></div>); } });
const C = observer(class extends React.Component { componentWillMount() { this.controller = new Ccon(this); } render() { return (<div></div>); } });