
export function isNumOnly(v: any)
{
	if (typeof v === 'number' || typeof v === 'string')
	{
		return /^\d+$/.test(v.toString())
	}

	return false
}
