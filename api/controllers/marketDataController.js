'use strict';


var pg = require('pg');
var escape = require('pg-escape');

var conString = process.env.CONNECTION_STRING;


function getOrderByStatement(option) {
    if(option == "Volume Change") {
        
        return "order by rp.volume_usd_24h / fp.volume_usd_24h desc";
    }
    else {        
        return "order by rp.marketcap_usd / fp.marketcap_usd desc";
    }
}

exports.get_coins = function(req, resp) {
    var client = new pg.Client(conString);
    client.connect();
    
    client.query(escape(`drop table if exists first_prices;
                    drop table if exists most_recent_prices;

                    create temp table first_prices (id int, coin_market_cap_id text, rank int, price_usd double precision, volume_usd_24h double precision, marketcap_usd double precision, timestamp timestamp without time zone);
                    create temp table most_recent_prices (id int, coin_market_cap_id text, rank int, price_usd double precision, volume_usd_24h double precision, available_supply double precision, total_supply double precision, marketcap_usd double precision, name text, timestamp timestamp without time zone, symbol text);

                    insert into first_prices
                    select id, coin_market_cap_id, rank, price_usd, volume_usd_24h, marketcap_usd, timestamp from prices
                    where timestamp = (select min(p.timestamp) from prices p where p.timestamp > %L);

                    insert into most_recent_prices
                    select id, coin_market_cap_id, rank, price_usd, volume_usd_24h, available_supply, total_supply, marketcap_usd, name, timestamp, symbol from prices
                    where timestamp = (select max(timestamp) from prices limit 1);`, req.query.date))
    .then(res => client.query("  select row_number() OVER (" + getOrderByStatement(req.query.orderBy) + `) as position, rp.coin_market_cap_id, rp.marketcap_usd / fp.marketcap_usd * 100 as market_cap_increase, rp.volume_usd_24h / rp.marketcap_usd as volume_ratio, rp.name, rp.rank as current_rank, fp.rank as prior_rank, rp.volume_usd_24h as current_volume, fp.volume_usd_24h as prior_volume, rp.available_supply, rp.total_supply, fp.timestamp as start_date, rp.timestamp as end_date, rp.symbol
                            from most_recent_prices rp
                            join first_prices fp on fp.coin_market_cap_id = rp.coin_market_cap_id
                            where fp.marketcap_usd is not null and rp.marketcap_usd is not null
                            and rp.available_supply / rp.total_supply >= $2
                            and rp.rank <= $3
                            and (LOWER(rp.name) like '%' || LOWER($4) || '%' or LOWER(rp.symbol) like '%' || LOWER($4) || '%')`
                            + getOrderByStatement(req.query.orderBy) +
                            " limit $1;", [req.query.numResults, req.query.minSupplyRatio, req.query.minRank, req.query.nameSymbol])
                .then(res => resp.json(res.rows))
                .catch(e => console.error(e.stack)))
    .then(res => client.end())
    .catch(e => console.error(e.stack));
        
    
};

 