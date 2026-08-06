$(".quantity__plus_hotel").on("click", function (e) {
    let type = $(this).data('type');
    e.preventDefault();
    var input = $(this).siblings(".quantity__input");

    var adult_qty = $(this).closest('.purchase-form').find('.adult_qty');
    var guest_qty = $(this).closest('.purchase-form').find('.guest_qty').val();
    var guest_capability = $(this).closest('.purchase-form').find('.guest_capability');
    var room_qty = $(this).closest('.purchase-form').find('.room_qty');
    

    var value = parseInt(input.val());

    if (type == 'room') {
        value++;
        input.val(value.toString().padStart(2, "0"));

        adult_qty.text(value.toString().padStart(2, "0"));
        $('.aqty').val(value.toString().padStart(2, "0"));
        room_qty.text(value.toString().padStart(2, "0"));

        var unitPrice = $(this).closest('.purchase-form').find('.unitPrice').val();
        var mainPrice = $(this).closest('.purchase-form').find('.mainPrice');
        var atotal = $(this).closest('.purchase-form').find('.atotal');
        var total_days = $(this).closest('.purchase-form').find('.total_days').val();

        if (unitPrice) {
            var mprice = (unitPrice * value);
            mainPrice.val(mprice);
            atotal.text(mprice.toFixed(2));
        }
    } else if (type == 'guest') {
        value++;

        if(guest_qty > (value - 1)){
            input.val(value.toString().padStart(2, "0"));
        
            guest_capability.val(value.toString().padStart(2, "0"));
        }else{
            alert('Maximum Guest Capability is ' + guest_qty);
        }
    }
    total_amount();
});

$(".quantity__minus_hotel").on("click", function (e) {
    let type = $(this).data('type');
    e.preventDefault();
    var input = $(this).siblings(".quantity__input");
    var adult_qty = $(this).closest('.purchase-form').find('.adult_qty');
    var guest_qty = $(this).closest('.purchase-form').find('.guest_qty').val();
    var guest_capability = $(this).closest('.purchase-form').find('.guest_capability');
    var room_qty = $(this).closest('.purchase-form').find('.room_qty');
    var value = parseInt(input.val());

    if (type == 'room') {
        if (value > 1) {
            value--;
            input.val(value.toString().padStart(2, "0"));
            adult_qty.text(value.toString().padStart(2, "0"));
            $('.aqty').val(value.toString().padStart(2, "0"));
            room_qty.text(value.toString().padStart(2, "0"));
        }
        var unitPrice = $(this).closest('.purchase-form').find('.unitPrice').val();
        var mainPrice = $(this).closest('.purchase-form').find('.mainPrice');
        var atotal = $(this).closest('.purchase-form').find('.atotal');
        var total_days = $(this).closest('.purchase-form').find('.total_days').val();

        if (unitPrice) {
            var mprice = (unitPrice * value);
            mainPrice.val(mprice);
            atotal.text(mprice.toFixed(2));
        }
        
    } else if (type == 'guest') {
        if (value > 0) {
            value--;
            input.val(value.toString().padStart(2, "0"));
            guest_capability.val(value.toString().padStart(2, "0"));
        }
    }
    total_amount();
});
$(".services_check").on("change", function (e) {
    total_amount();
});
$(".guest-quantity__minus").on("click", function (e) {
    total_amount();
});
$(".guest-quantity__plus").on("click", function (e) {
    total_amount();
});
$(".hotel_date").on("change", function (e) {
    var dateString = $(this).val();
    var startDate = dateString.split(' - ')[0]; 
    var endDate = dateString.split(' - ')[1];
    var start_date = formatDate(startDate);
    var end_date = formatDate(endDate);
    var days = daysdifference(start_date, end_date);
    if(days > 0){
            var tdays = days;
        }else{
            var tdays = 1;
        }
    $('.start_date').val(start_date);
    $('.end_date').val(end_date);
    $('.total_days').val(tdays);
    $('.days_show').text(tdays);
    total_amount();
});


function total_amount() {
    var main_price = $('.mainPrice').val();
    var unit_price = $('.unitPrice').val();
    var aqty = $('.aqty').val();
    var gqty = $('.guest_capability').val();
    var total_days = $('.total_days').val();
    var atotal = $(this).closest('.purchase-form').find('.atotal');

    var check_price = 0;
    $(".services_check:checked").each(function () {
        var type = $(this).data('type');
        var unit = $(this).data('unit');
        var tqty = aqty * gqty;
        if (unit == 'fixed') {
            if (type == 'per_person') {
                check_price += $(this).data('price') * tqty;
            } else {
                check_price += $(this).data('price');
            }

        } else {
            if (type == 'per_person') {

                var cprice = (($(this).data('price') / 100) * unit_price) * tqty;

                check_price += cprice;
            } else {

                var cprice = (($(this).data('price') / 100) * unit_price);

                check_price += cprice;
            }
        }

    });

    var days_price = main_price * total_days;
    var total_amount = days_price + check_price;
    $('.total_amount').val(total_amount.toFixed(2));
    $('.total_amount_show').text(total_amount.toFixed(2));
    $('.atotal').text(days_price.toFixed(2));
    
}

function formatDate(date) {
var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

if (month.length < 2) 
    month = '0' + month;
if (day.length < 2) 
    day = '0' + day;

return [year, month, day].join('-');
}

function daysdifference(firstDate, secondDate){

var startDay = new Date(firstDate);

var endDay = new Date(secondDate);



var millisBetween = startDay.getTime() - endDay.getTime();

var days = millisBetween / (1000 * 3600 * 24);



return Math.round(Math.abs(days));

}
