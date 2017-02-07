# nested

Update nested entities

## Builder options

|    option        | type     | default value  |
|:---------------- | -------- |:-------------- |
| `primaryKey`     | String   | `"id"`         |
| `foreignKey`     | String   | `null`         |
| `methods`        | Object   | `{}`           |
| `methods.query`  | Function | `() => []`     |
| `methods.create` | Function | `_.identity`   |
| `methods.update` | Function | `_.identity`   |
| `methods.remove` | Function | `_.identity`   |

### Methods

`methods.query`

```javascript
...
methods: {
    query: (key, params) => {
        // Return values here by key
        return [];
    }
}
...
```

`methods.create`, `methods.update`, `methods.remove`

```javascript
methods: {
    // same for update and remove
    create: (item, params) => {
        // Actual creation/update/removal here
        return item;
    }
}
```



## Call options
`const createOrUpdate = nested({ ... });`

`createOrUpdate(foreignKeyValue:<String|Number>, items:<Array>, params:<any>)`

## Example

```javascript
const _ = require('lodash');
const nested = require('nested');

let items = [
	{ id: 1, ref_id: 1, name: 'Kappa' },
	{ id: 2, ref_id: 1, name: 'KappaPride' },
	{ id: 3, ref_id: 1, name: 'Jebaited' },
	{ id: 4, ref_id: 1, name: 'PogChamp' },
	{ id: 5, ref_id: 2, name: 'KKona' }
];
let maxId = 4;

const createOrUpdate = nested({
	foreignKey: 'ref_id',
	methods: {
		query: (refId) => _.filter(items, { ref_id: refId }),
		create: (params) => {
			// Persistent storage imitation
			const item = {
				id: ++maxId,
				ref_id: params.ref_id,
				name: params.name
			};
			items.push(item);
			return item;
		},
		// Update method is omitted
		remove: (params) => {
			items = _.filter(items, (item) => item.id !== params.id)
		}
	}
})


createOrUpdate(1, [
	{ id: 1, ref_id: 1, name: 'Kappa' },
	{ id: 2, ref_id: 1, name: 'KappaPride' },
	{ id: 3, ref_id: 1, name: 'Jebaited' },
	{ name: 'NotLikeThis' }
]).then(function (res) {
	console.log(res);
});

```

## Debug

`DEBUG=nested node <path/to/your/app.js>`
