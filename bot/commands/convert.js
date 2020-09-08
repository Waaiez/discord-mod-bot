// Converts from one currency to another based on this API: http://exchangeratesapi.io/

const {Command} = require('yuuko');
const fetch = require('node-fetch');
const convert = require('convert-units');

function convertUnits (msg, baseValue, baseType, targetType) {
	const conversion = convert(baseValue).from(baseType).to(targetType);
	msg.channel.createMessage(`${baseValue}${baseType} is equal to ${conversion}${targetType}`);
}

async function convertCurrency (msg, baseValue, baseType, targetType, prefix) {
	baseType = baseType.toUpperCase();
	targetType = targetType.toUpperCase();
	try {
		const res = await fetch(`https://api.exchangeratesapi.io/latest?base=${baseType}&symbols=${targetType}`);
		if (res.status !== 200) {
			throw new Error(`Error fetching from API or you introduced the wrong units. Type \`${prefix}convert\` to see every unit code.`);
		}
		const conversions = await res.json();
		const result = conversions.rates[targetType] * baseValue;
		msg.channel.createMessage(`${baseValue}${baseType} is roughly equal to ${result.toFixed(2)}${targetType}`);
	} catch (err) {
		msg.channel.createMessage(err.message).catch(() => {});
	}
}

module.exports = new Command('convert', (msg, args, context) => {
	if (args.length === 0) {
		msg.channel.createMessage(`For currency codes visit: <https://www.xe.com/en/iso4217.php>
		\rFor units visit: <https://www.npmjs.com/package/convert-units>
		\rCommand can be used with: \`${context.prefix}convert [amount] [baseUnit] [targetUnit]\``);
		return;
	}

	const baseValue = args[0].replace(/,/g, '.'); // replace commas with dots since some people use those for decimals
	const baseType = args[1];
	const targetType = args[2];
	const prefix = context.prefix;
	try {
		// see if it can convert it normally first
		convertUnits(msg, baseValue, baseType, targetType);
	} catch (err) {
		// if it can't convert it normally, try to find it as a currency, throws if it can't find a currency either
		convertCurrency(msg, baseValue, baseType, targetType, prefix);
	}
});
// TODO: add args
module.exports.help = {
	args: '',
	desc: 'Converts units and currency, the latter being based on this API: <http://exchangeratesapi.io/>',
};