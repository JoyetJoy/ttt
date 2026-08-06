    //Quantity Increment
	$(".quantity__minus").on("click", function (e) {
		let type = $(this).data('type');
		e.preventDefault();
		var input = $(this).siblings(".quantity__input");
		var adult_qty = $(this).closest('.purchase-form').find('.adult_qty');
		var children_qty = $(this).closest('.purchase-form').find('.children_qty');
		var value = parseInt(input.val());
		
		// Get min value from input attribute
		var minValue = parseInt(input.attr('min')) || 1;

		if (type == 'adult') {
			if (value > minValue) {
				value--;
				input.val(value.toString().padStart(2, "0"));
				adult_qty.text(value.toString().padStart(2, "0"));
				$('.aqty').val(value.toString().padStart(2, "0"));
			}
			var pregular = $(this).closest('.purchase-form').find('.pregular_price').val();
			var psale = $(this).closest('.purchase-form').find('.psale_price').val();
			var mainPrice = $(this).closest('.purchase-form').find('.mainPrice');
			var sprice = $(this).closest('.purchase-form').find('.sprice');
			var rprice = $(this).closest('.purchase-form').find('.rprice');



			if (psale > 0) {
				var mprice = (psale * value);
				mainPrice.val(mprice);

				var ssprice = (psale * value);
				sprice.text(ssprice);

				var rrprice = (pregular * value);
				rprice.text(rrprice);

				$('.atotal').text(ssprice);
			} else {
				var mprice = (pregular * value);
				mainPrice.val(mprice);

				$('.atotal').text(mprice);
			}
		} else if (type == 'child') {
			if (value > 0) {
				value--;
				input.val(value.toString().padStart(2, "0"));
				children_qty.text(value.toString().padStart(2, "0"));
				$('.cqty').val(value.toString().padStart(2, "0"));

				var pprice = $(this).closest('.purchase-form').find('.pprice').val();
				var cprice = $(this).closest('.purchase-form').find('.cprice');
				var child_price = $(this).closest('.purchase-form').find('.child_price');

				if (pprice) {
					var main_price = (pprice * value);
					cprice.text(main_price);
					child_price.val(main_price);

					$('.btotal').text(main_price);
				}

				if(value>0){
				$('.single-total-child').removeClass('d-none');
				}else{
				$('.single-total-child').addClass('d-none');
				}
			}
		}
		total_amount();
	});


	$(".quantity__plus").on("click", function (e) {
		let type = $(this).data('type');
		e.preventDefault();
		var input = $(this).siblings(".quantity__input");
		
		// Get max value from input attribute
		var maxValue = parseInt(input.attr('max')) || 10;

		var adult_qty = $(this).closest('.purchase-form').find('.adult_qty');
		var children_qty = $(this).closest('.purchase-form').find('.children_qty');

		var value = parseInt(input.val());

		if (type == 'adult') {
			if (value < maxValue) {
				value++;
				input.val(value.toString().padStart(2, "0"));
				adult_qty.text(value.toString().padStart(2, "0"));
				$('.aqty').val(value.toString().padStart(2, "0"));
				
				var pregular = $(this).closest('.purchase-form').find('.pregular_price').val();
				var psale = $(this).closest('.purchase-form').find('.psale_price').val();
				var mainPrice = $(this).closest('.purchase-form').find('.mainPrice');
				var sprice = $(this).closest('.purchase-form').find('.sprice');
				var rprice = $(this).closest('.purchase-form').find('.rprice');

				var totelPrice = $(this).closest('.purchase-form').find('.totelPrice');

				if (psale > 0) {
					var mprice = (psale * value);
					mainPrice.val(mprice);

					var ssprice = (psale * value);
					sprice.text(ssprice);

					var rrprice = (pregular * value);
					rprice.text(rrprice);

					var hPrice = (totelPrice * value);
					totelPrice.text(hPrice);

					$('.atotal').text(ssprice);
				} else {
					var mprice = (pregular * value);
					mainPrice.val(mprice);

					$('.atotal').text(mprice);
				}
			}
		} else if (type == 'child') {
			value++;
			input.val(value.toString().padStart(2, "0"));
			children_qty.text(value.toString().padStart(2, "0"));
			$('.cqty').val(value.toString().padStart(2, "0"));

			var pprice = $(this).closest('.purchase-form').find('.pprice').val();
			var cprice = $(this).closest('.purchase-form').find('.cprice');
			var child_price = $(this).closest('.purchase-form').find('.child_price');

			if (pprice) {
				var main_price = (pprice * value);
				cprice.text(main_price);
				child_price.val(main_price);

				$('.btotal').text(main_price);
			}
			if(value > 0){
				$('.single-total-child').removeClass('d-none');
			}

		}
		total_amount();
	});
	$(".services_check").on("click", function (e) {

		total_amount();
	});


	function total_amount() {
		var main_price = $('.mainPrice').val();
		var child_price = $('.child_price').val();
		var main_pprice = $('.pregular_price').val();
		var main_psprice = $('.psale_price').val();
		var child_pprice = $('.pprice').val();
		var aqty = $('.aqty').val();
		var cqty = $('.cqty').val();

		var tqty = parseInt(aqty) + parseInt(cqty);

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
					if (main_psprice) {
						var aprice = (($(this).data('price') / 100) * main_psprice) * aqty;
					} else {
						var aprice = (($(this).data('price') / 100) * main_pprice) * aqty;
					}
					var cprice = (($(this).data('price') / 100) * child_pprice) * cqty;

					check_price += aprice + cprice;
				} else {
					if (main_psprice) {
						var aprice = (($(this).data('price') / 100) * main_psprice);
					} else {
						var aprice = (($(this).data('price') / 100) * main_pprice);
					}
					var cprice = (($(this).data('price') / 100) * child_pprice);

					check_price += aprice + cprice;
				}
			}

		});
		var total_amount = parseInt(main_price) + parseInt(child_price) + parseInt(check_price);
		$('.total_amount').val(total_amount);
		$('.total_amount_show').text(total_amount);
	}


    $(".tour_date").on("change", function (e) {
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
    
    // Initialize values on page load
    $(document).ready(function() {
        // Set initial adult quantity in the display
        var adultInput = $('.quantity__input[min]').first();
        var initialValue = adultInput.val();
        $('.adult_qty').text(initialValue);
        $('.aqty').val(initialValue);
        
        // Calculate initial total
        total_amount();
    });
