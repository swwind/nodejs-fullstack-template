import Router from 'koa-router';
import { Errors } from './errors';
import { Users } from './modules/user';
import { getStatus } from './utils';

import user from './routes/user';

export type State = {
  username: string;
}

export type Tools = {
  end<T extends {}>(status: number, data: T): void;
  fail(error: Errors): void;
  getBody<T>(defaults: T): T;
}

const router = new Router<State, Tools>();

router.use('/', async (ctx, next) => {
  ctx.state.username = '';

  const auth = ctx.cookies.get('auth');
  if (typeof auth === 'string') {
    const username = await Users.findCookie(auth);
    if (typeof username === 'string') {
      ctx.state.username = username;
    }
  }

  ctx.end = <T> (status: number, data: T) => {
    ctx.response.status = status;
    ctx.response.set('Content-Type', 'application/json');
    ctx.response.body = JSON.stringify(data);
  }

  ctx.fail = (error: Errors) => {
    ctx.response.status = getStatus(error);
    ctx.response.set('Content-Type', 'text/plain');
    ctx.response.body = error;
  }

  ctx.getBody = <T> (defaults: T): T => {
    const applyDefault = <T> (a: any, b: T): T => {
      if (typeof a === 'undefined') return b;
      let v = {} as any;
      for (const key in b) {
        const type = typeof b[key];
        if (typeof a[key] === type) {
          v[key] = type === 'object' ? applyDefault(a[key], b[key]) : a[key];
        } else {
          v[key] = b[key];
        }
      }
      return v;
    }
    return applyDefault((ctx.request as any).body, defaults);
  }

  await next();
});

router.use('/api',
  user.routes(),
  user.allowedMethods(),
);

export default router;
