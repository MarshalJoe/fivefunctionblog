const fs = require('fs');
const util = require('util');

/*
    Wrapping promise supported fs functions into async fs helper functions for easier async await syntax.
*/

const readFilePromise = util.promisify(fs.readFile);
const readdirPromise = util.promisify(fs.readdir);

module.exports.readFileAsync = async function readFileAsync(path, encoding) {
    return await readFilePromise(path, encoding);
}

module.exports.readdirAsync = async function readdir(path) {
    return await readdirPromise(path);
}
