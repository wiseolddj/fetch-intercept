const FetchIntercept = require('../src/index');

const intercept = new FetchIntercept();

intercept.mock('http://URL1', {body: 'hello 1'});
intercept.mock('http://URL2', {body: 'hello 2'});
intercept.mock('http://URL3', {body: 'hello 3'});

