import { createStore } from './store';
import { closeTicket, supportQueue, supportView } from './support';

// Operator commands for support. Reading an application requires the applicant's active grant;
// every read is recorded in the applicant's activity.
//   npm run support -- list
//   npm run support -- view <reference> --operator <name>
//   npm run support -- close <reference> --operator <name>
const [command, reference] = process.argv.slice(2);
const operator = (() => {
  const i = process.argv.indexOf('--operator');
  return i < 0 ? '' : process.argv[i + 1] || '';
})();
const store = createStore(process.env.DATA_DIR || '.data');
try {
  if (command === 'list') console.log(JSON.stringify(supportQueue(store), null, 2));
  else if (command === 'view' && reference)
    console.log(JSON.stringify(supportView(store, reference, operator), null, 2));
  else if (command === 'close' && reference)
    console.log(JSON.stringify(closeTicket(store, reference, operator), null, 2));
  else
    throw Error(
      'Use list, view <reference> --operator <name> or close <reference> --operator <name>.',
    );
} finally {
  store.db.close();
}
