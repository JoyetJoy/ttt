 // transport Tab
	$(function () {
		$('.transport-type ul li').click('click', function () {
			$('.transport-type ul li').removeClass('active');
            var adultPrice = $(this).data('adult');
            var childPrice = $(this).data('child');
            var adult_price = $(this).closest('.purchase-form').find('.adult_price');
            var atotal = $(this).closest('.purchase-form').find('.atotal');
            var child_price = $(this).closest('.purchase-form').find('.child_price');
            var ctotal = $(this).closest('.purchase-form').find('.ctotal');
            var adult_unit_price = $(this).closest('.purchase-form').find('.adult_unit_price');
            var adult_total_price = $(this).closest('.purchase-form').find('.adult_total_price');
            var child_unit_price = $(this).closest('.purchase-form').find('.child_unit_price');
            var child_total_price = $(this).closest('.purchase-form').find('.child_total_price');
            var adult_quantity = $(this).closest('.purchase-form').find('.adult_quantity');
            var child_quantity = $(this).closest('.purchase-form').find('.child_quantity');
            var total_amount_show = $(this).closest('.purchase-form').find('.total_amount_show');
            var total_amount = $(this).closest('.purchase-form').find('.total_amount');

            adult_price.text(adultPrice);
            atotal.text(adultPrice);
            adult_unit_price.val(adultPrice);
            adult_total_price.val(adultPrice);
            adult_quantity.val(1);
            child_unit_price.val(childPrice);
            child_total_price.val(0);
            child_quantity.val(0);
            total_amount_show.text(adultPrice);
            total_amount.text(adultPrice);
            if(childPrice > 0){
                child_price.text(childPrice);
                ctotal.text(0);
                $('.show_child').show();
            }else{
                child_price.text(childPrice);
                ctotal.text(0);
                $('.show_child').hide();
            }
			if ($(this).hasClass('hascar')) {
				$('#forCar').show();
				$('#forTrain').hide();
				$('#forBus').hide();
				$('#forBoat').hide();
			} else if ($(this).hasClass('hastrain')) {
				$('#forTrain').show();
				$('#forCar').hide();
				$('#forBus').hide();
				$('#forBoat').hide();
			} else if ($(this).hasClass('hasbus')) {
				$('#forBus').show();
				$('#forBoat').hide();
				$('#forTrain').hide();
				$('#forCar').hide();
			} else if ($(this).hasClass('hasboat')) {
				$('#forBoat').show();
				$('#forTrain').hide();
				$('#forCar').hide();
				$('#forBus').hide();
			}
 
		});
	});
    $(".transport_date").on("change", function (e) {
        var dateString = $(this).val();
        var start_date = formatDate(dateString);
        $('.start_date').val(start_date);
    });
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



    	//Quantity Increment
	$(".quantity__minus_transport").on("click", function (e) {
		let type = $(this).data('type');
		e.preventDefault();
		var input = $(this).siblings(".quantity__input");
		var adult_qty = $(this).closest('.purchase-form').find('.adult_qty');
		var child_qty = $(this).closest('.purchase-form').find('.child_qty');
		var value = parseInt(input.val());

		if (type == 'adult') {
			if (value > 1) {
				value--;
				input.val(value.toString().padStart(2, "0"));
				adult_qty.text(value.toString().padStart(2, "0"));
				$('.adult_quantity').val(value.toString().padStart(2, "0"));
			}
			var adult_unit_price = $(this).closest('.purchase-form').find('.adult_unit_price').val();
			var adult_total_price = $(this).closest('.purchase-form').find('.adult_total_price');
			var atotal = $(this).closest('.purchase-form').find('.atotal');
            var main_price = (adult_unit_price * value);
            adult_total_price.val(main_price);
            atotal.text(main_price);
		} else if (type == 'child') {
			if (value > 0) {
				value--;
				input.val(value.toString().padStart(2, "0"));
				child_qty.text(value.toString().padStart(2, "0"));
				$('.child_quantity').val(value.toString().padStart(2, "0"));

				var child_unit_price = $(this).closest('.purchase-form').find('.child_unit_price').val();
			    var child_total_price = $(this).closest('.purchase-form').find('.child_total_price');
			    var ctotal = $(this).closest('.purchase-form').find('.ctotal');

				var main_price = (child_unit_price * value);
                child_total_price.val(main_price);
                ctotal.text(main_price);
			}
		}
		total_amount();
	});


	$(".quantity__plus_transport").on("click", function (e) {
		let type = $(this).data('type');
		e.preventDefault();
		var input = $(this).siblings(".quantity__input");

		var adult_qty = $(this).closest('.purchase-form').find('.adult_qty');
		var child_qty = $(this).closest('.purchase-form').find('.child_qty');

		var value = parseInt(input.val());

		if (type == 'adult') {
			value++;
			input.val(value.toString().padStart(2, "0"));
			adult_qty.text(value.toString().padStart(2, "0"));
			$('.adult_quantity').val(value.toString().padStart(2, "0"));

			var adult_unit_price = $(this).closest('.purchase-form').find('.adult_unit_price').val();
			var adult_total_price = $(this).closest('.purchase-form').find('.adult_total_price');
			var atotal = $(this).closest('.purchase-form').find('.atotal');
            var main_price = (adult_unit_price * value);
            adult_total_price.val(main_price);
            atotal.text(main_price);
			
		} else if (type == 'child') {
			value++;
			input.val(value.toString().padStart(2, "0"));
				child_qty.text(value.toString().padStart(2, "0"));
				$('.child_quantity').val(value.toString().padStart(2, "0"));

				var child_unit_price = $(this).closest('.purchase-form').find('.child_unit_price').val();
			    var child_total_price = $(this).closest('.purchase-form').find('.child_total_price');
			    var ctotal = $(this).closest('.purchase-form').find('.ctotal');

				var main_price = (child_unit_price * value);
                child_total_price.val(main_price);
                ctotal.text(main_price);

		}
		total_amount();
	});
	$(".services_check").on("click", function (e) {

		total_amount();
	});


	function total_amount() {
		var adult_unit_price = $('.adult_unit_price').val();
        var adult_total_price = $('.adult_total_price').val();
		var adult_quantity = $('.adult_quantity').val();
		var child_unit_price = $('.child_unit_price').val();
        var child_total_price = $('.child_total_price').val();
		var child_quantity = $('.child_quantity').val();

		var tqty = parseInt(adult_quantity) + parseInt(child_quantity);

		var check_price = 0;
		$(".services_check:checked").each(function () {
			var type = $(this).data('type');
			var unit = $(this).data('unit');
			if (unit == 'fixed') {
				if (type == 'per_person') {
					check_price += $(this).data('price') * tqty;
				} else {
					check_price += $(this).data('price');
				}

			} else {
				if (type == 'per_person') {
					var aprice = (($(this).data('price') / 100) * adult_unit_price) * adult_quantity;
					var cprice = (($(this).data('price') / 100) * child_unit_price) * child_quantity;

					check_price += aprice + cprice;
				} else {

					var aprice = (($(this).data('price') / 100) * adult_unit_price);
					var cprice = (($(this).data('price') / 100) * child_unit_price);

					check_price += aprice + cprice;
				}
			}

		});

		var total_amount = parseInt(adult_total_price) + parseInt(child_total_price) + parseInt(check_price);
		$('.total_amount').val(total_amount);
		$('.total_amount_show').text(total_amount);
	}