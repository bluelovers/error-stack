
export function isUnset(v: any): v is undefined | null
{
	return typeof v === 'undefined' || v === null
}
