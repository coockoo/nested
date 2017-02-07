const Promise = require('bluebird');
const _ = require('lodash');
const debug = require('debug')('nested');

module.exports = nested;

function nested (options) {

	const primaryKey = _.get(options, 'primaryKey', 'id');
	const foreignKey = _.get(options, 'foreignKey');
	const query = _.get(options, 'methods.query', () => Promise.resolve([]));
	const create = _.get(options, 'methods.create', (params) => Promise.resolve(params));
	const update = _.get(options, 'methods.update', (params) => Promise.resolve(params));
	const remove = _.get(options, 'methods.remove', (params) => Promise.resolve(params));

	return handler;

	function handler (key, items, params) {
		return Promise.resolve(query(key, params))
			.then((existingItems) => {

				const existingKeys = existingItems
					.map(getItemPrimaryKey);
				const newKeys = items
					.map(getItemPrimaryKey)
					.filter(Boolean);
				const updateKeys = _.intersection(existingKeys, newKeys);
				const removeKeys = _.difference(existingKeys, newKeys);

				const createItems = items
					.filter((item) => !getItemPrimaryKey(item))
					.map((item) => setItemForeignKey(item, key));
				const updateItems = items
					.filter((item) => _.includes(updateKeys, getItemPrimaryKey(item)));
				const removeItems = existingItems
					.filter((item) => _.includes(removeKeys, getItemPrimaryKey(item)));

				debug('Create items: ', createItems);
				debug('Update items: ', updateItems);
				debug('Remove items: ', removeItems);

				return Promise.all([
					Promise.map(removeItems, (item) => remove(item, params)),
					Promise.map(updateItems, (item) => update(item, params)),
					Promise.map(createItems, (item) => create(item, params)),
				]).spread((removed, updated, created) => {
					return [].concat(created, updated);
				});

			});
	}

	function setItemForeignKey (item, key) {
		if ( foreignKey ) {
			return Object.assign({}, item, { [foreignKey]: key });
		}
		return item;
	}
	function getItemPrimaryKey (item) {
		return item[primaryKey] ? String(item[primaryKey]) : null;
	}

}
