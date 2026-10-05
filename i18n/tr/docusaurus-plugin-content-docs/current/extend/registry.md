# Export Registry

## Export/Import formats

The following scenarios are not supported:

### Exports that will not be added to the registry

When using an unnamed export, the module cannot be added to the registry, unless that is a wanted behavior on your part, make sure to have names on exports. Examples:

```ts
// Will not be added to the registry
export default function () {
    return 'anonymous';
};

// Will be added
export default function acme() {
    return 'anonymous';
};
```

```ts
// Will not be added to the registry
import Model from './Model';
import PostTypes from './PostTypes';
import Routes from './Routes';
import Store from './Store';

export default {
  Model,
  PostTypes,
  Routes,
  Store,
};

// Will be added
import Model from './Model';
import PostTypes from './PostTypes';
import Routes from './Routes';
import Store from './Store';

const extenders = {
  Model,
  PostTypes,
  Routes,
  Store,
};

export default extenders;
```

### Supported Exports/Imports across extensions

There are 3 ways you can export modules to be imported from other extensions

#### Module file with a default export only

```ts
// Extension A: vendor/extension-a
// Filename: moduleA.ts
// Export
export default ...;

// Extension B: vendor/extension-b
// Import
import moduleA from 'ext:vendor/extension-a/.../moduleA';
```

#### Module with exports only (no default export)

```ts
// Extension A: vendor/extension-a
// Filename: moduleA.ts
// Export
export function acme() {}
export class Test {}
const foo = 'foo';
export { foo };

// Extension B: vendor/extension-b
// Import
import { acme, Test, foo } from 'ext:vendor/extension-a/.../moduleA';
```

#### Directory with modules and an `index.js`

See core for an example [`extenders`](https://github.com/flarum/framework/tree/b003736d751e4d0ec6d24c647e02826634e7e2b5/framework/core/js/src/common/extenders).

```ts
// Can import as
import Routes from 'flarum/common/extenders/Routes';
// Or
import { Model, PostTypes } from 'flarum/common/extenders';
// Or
import Extend from 'flarum/common/extenders';
```
