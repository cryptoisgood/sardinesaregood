export const JSON_BIGINT = (error) => JSON.stringify(error, (_, v) => typeof v === 'bigint' ? `${v}n` : v)