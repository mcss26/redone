/**
 * Utility to fetch all rows for a given Supabase query builder, bypassing the 1000 row limit.
 * 
 * @param {Object} queryBuilder - A Supabase query builder (e.g. `supabase.from('table').select('*').eq('x', 1)`)
 * @param {number} limit - Chunk size (default 1000)
 * @returns {Promise<{data: any[], error: any}>} - Returns a single combined data array or the first error encountered.
 */
export async function fetchAll(queryBuilder, limit = 1000) {
    let allData = [];
    let from = 0;
    let fetchMore = true;

    while (fetchMore) {
        const { data, error } = await queryBuilder.range(from, from + limit - 1);
        
        if (error) {
            return { data: null, error };
        }

        if (data && data.length > 0) {
            allData = [...allData, ...data];
            from += limit;
            if (data.length < limit) {
                fetchMore = false;
            }
        } else {
            fetchMore = false;
        }
    }

    return { data: allData, error: null };
}
