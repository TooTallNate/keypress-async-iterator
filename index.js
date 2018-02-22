const once = require('event-to-promise');
const { emitKeypressEvents } = require('readline');

module.exports = createKeypressIterator;

function createKeypressIterator(stream) {
  emitKeypressEvents(stream);
  let ended = false;
  const keys = [];

  function onKeypress(s, key) {
    keys.push(key);
  }

  function onEnd() {
    ended = true;
  }

  async function next() {
    if (keys.length === 0) {
      await Promise.race([once(stream, 'keypress'), endPromise]);
    }
    return { done: ended && keys.length === 1, value: keys.shift() };
  }

  const endPromise = once(stream, 'end').then(onEnd);
  stream.on('keypress', onKeypress);

  return { next };
}
