import React from 'react';
import ReactDom from 'react-dom';
import { hot } from 'react-hot-loader/root';

import MineSearch from './MineSearch';

const Hot = hot(MineSearch);

ReactDom.render(<Hot />, document.querySelector('#root'));