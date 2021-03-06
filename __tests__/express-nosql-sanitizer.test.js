const noSqlSanitizer = require('../src/lib/express-nosql-sanitizer');

function run({
  body, mode, onClean, query,
}) {
  const next = jest.fn();
  const req = { body, query };
  const middleware = noSqlSanitizer({
    mode,
    onClean,
  });

  middleware(req, {}, next);
  return { next, req };
}

describe('if the the normal mode is used', () => {
  it('should delete any props that start with $', async () => {
    const { req } = run({
      body: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
      mode: noSqlSanitizer.MODE_NORMAL,
      query: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
    });

    expect(req.body).toEqual({
      safe: 3,
    });

    expect(req.query).toEqual({
      safe: 3,
    });
  });
});

describe('if the strict mode is used', () => {
  it('should only remove props listed in lib/operators', async () => {
    const { req } = run({
      body: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
      mode: noSqlSanitizer.MODE_STRICT,
      query: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
    });

    expect(req.body).toEqual({
      $unsafe: 1,
      safe: 3,
    });

    expect(req.query).toEqual({
      $unsafe: 1,
      safe: 3,
    });
  });
});

describe('if the onClean callback is specified', () => {
  it('should invoke onClean every time a prop is deleted', async () => {
    const onClean = jest.fn();
    run({
      body: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
      mode: noSqlSanitizer.MODE_NORMAL,
      onClean,
      query: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
    });

    expect(onClean).toHaveBeenCalledTimes(4);
    expect(onClean).toHaveBeenCalledWith(
      'req.body.$unsafe',
      '$unsafe',
      1,
    );

    expect(onClean).toHaveBeenCalledWith(
      'req.body.$ne',
      '$ne',
      2,
    );

    expect(onClean).toHaveBeenCalledWith(
      'req.query.$unsafe',
      '$unsafe',
      1,
    );

    expect(onClean).toHaveBeenCalledWith(
      'req.query.$ne',
      '$ne',
      2,
    );
  });

  it('should support inner objects', async () => {
    const onClean = jest.fn();
    run({
      body: {
        unsafeObject: {
          $unsafe: 1,
          $ne: 2,
          safe: 3,
        },
      },
      mode: noSqlSanitizer.MODE_NORMAL,
      onClean,
      query: {
        unsafeObject: {
          $unsafe: 1,
          $ne: 2,
          safe: 3,
        },
      },
    });

    expect(onClean).toHaveBeenCalledTimes(4);
    expect(onClean).toHaveBeenCalledWith(
      'req.body.unsafeObject.$unsafe',
      '$unsafe',
      1,
    );

    expect(onClean).toHaveBeenCalledWith(
      'req.body.unsafeObject.$ne',
      '$ne',
      2,
    );

    expect(onClean).toHaveBeenCalledWith(
      'req.query.unsafeObject.$unsafe',
      '$unsafe',
      1,
    );

    expect(onClean).toHaveBeenCalledWith(
      'req.query.unsafeObject.$ne',
      '$ne',
      2,
    );
  });
});

describe('if the mode is not specified', () => {
  it('should default to using normal mode', async () => {
    const { req } = run({
      body: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
      query: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
    });

    expect(req.body).toEqual({
      safe: 3,
    });

    expect(req.query).toEqual({
      safe: 3,
    });
  });
});

describe('if the request body is not an object', () => {
  it('should not alter the body', async () => {
    const stringBody = JSON.stringify({
      $unsafe: 1,
      $ne: 2,
      safe: 3,
    });

    const { req } = run({
      body: stringBody,
      mode: noSqlSanitizer.MODE_NORMAL,
    });

    expect(req.body).toEqual(stringBody);
  });
});

describe('if no options are specified', () => {
  it('should default to using normal mode', async () => {
    const middleware = noSqlSanitizer();
    const req = {
      body: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
      query: {
        $unsafe: 1,
        $ne: 2,
        safe: 3,
      },
    };

    middleware(req, {}, jest.fn());
    expect(req.body).toEqual({
      safe: 3,
    });

    expect(req.query).toEqual({
      safe: 3,
    });
  });
});

it('should invoke next', async () => {
  const { next } = run({
    body: '',
  });

  expect(next).toHaveBeenCalledTimes(1);
});
