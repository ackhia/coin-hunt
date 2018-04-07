

Vue.component('coin-row', {
  props: ['coin'],
  template: '<tr> \
              <th scope="row">{{coin.position}}</th> \
              <td>{{coin.name}} ({{coin.symbol}})</td> \
              <td>{{coin.market_cap_increase.toLocaleString(undefined, {maximumFractionDigits: 0})}}% ({{ coin.prior_rank }} <i class="fa fa-arrow-right" aria-hidden="true"></i> {{ coin.current_rank }})</td> \
              <td>${{coin.current_volume.toLocaleString(undefined, {maximumFractionDigits: 0})}} ({{(coin.current_volume / coin.prior_volume * 100).toLocaleString(undefined, {maximumFractionDigits: 0})}}%)</td> \
              <td>{{(coin.available_supply / coin.total_supply).toFixed(2)}}</td> \
              <td><a target="_blank" v-bind:href="\'https://coinmarketcap.com/currencies/\' + coin.coin_market_cap_id">Coin Market Cap</a></td> \
            </tr>'
})


function refreshCoins(app) {
    $.ajax({ dataType: "json",
        url: '/ws/getCoins',
        data: { date: app.date, minRank: app.minRank, minSupplyRatio: app.minSupplyRatio, numResults: app.numResults, nameSymbol: app.nameSymbol, orderBy: app.orderBy },
        success: function(data){
            app.coins = data;    
            var options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            app.startDate = new Date(Date.parse(data[0]['start_date'])).toLocaleString(undefined, options)
            app.endDate = new Date(Date.parse(data[0]['end_date'])).toLocaleString(undefined, options)            
        }
    });
}

function setMaxDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
     if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 

    today = yyyy+'-'+mm+'-'+dd;
    document.getElementById("date").setAttribute("max", today);
}


var app = new Vue({
    el: '#app',
    data: {
        coins: [],
        startDate: null,
        endDate: null,
        date: "2017-12-27",
        minRank: 300,
        minSupplyRatio: 0.7,
        numResults: 50,
        nameSymbol: "",
        orderBy: "Market Cap Change"
    },
    beforeMount() {        
        refreshCoins(this);
    },
    mounted() {
        setMaxDate();
        $("#nameSymbol").keyup(
            _.debounce(function() { 
                refreshCoins(app); 
        }, 500));
    }
})
