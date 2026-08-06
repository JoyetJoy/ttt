(function ($) {
    "use strict";
    
    // Csrf Token Loaded
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

    // Get State by dropdown
    $('.country_id').on('change', function () {
        var country_id = this.value;
        if (country_id) {
            $(".state_id").empty();
            $.ajax({
                url: "/location/get/state",
                type: "POST",
                data: {
                    country_id: country_id,
                },
                dataType: 'json',
                success: function (res) {
                    console.log(res);
                    $('.state_id').append('<option value="">' + res.option + '</option>');
                    $.each(res.states, function (key, value) {
                        $(".state_id").append('<option value="' + value
                            .id + '">' + value.name + '</option>');
                    });
                    $('.state_id').niceSelect('update');
                }
            });
        }
    });

    // Get City by dropdown
    $('.state_id').on('change', function () {
        var state_id = this.value;
        if (state_id) {
            $(".city_id").empty();
            $.ajax({
                url: "/location/get/city",
                type: "POST",
                data: {
                    state_id: state_id,
                },
                dataType: 'json',
                success: function (res) {
                    $('.city_id').html('<option value="">' + res.option + '</option>');
                    $.each(res.city, function (key, value) {
                        $(".city_id").append('<option value="' + value
                            .id + '">' + value.name + '</option>');
                    });
                    $('.city_id').niceSelect('update');
                }
            });
        }
    });

    $(document).ready(function () {
        $(".commnt-reply").click(function (e) {
            var comId = $(this).data('comment_id');
            $('#replyModal').modal("show");
            $('#replyModal #parent_id').val(comId);
        });
    });

    $(function () {
        $('.payment-methods .payment-list li').on('click', function () {
            $('.payment-methods .payment-list li').removeClass('active'); // Remove active class from all list items
            if ($(this).hasClass('wallet-payment')) {
                if (!$("#strip-payment").hasClass('d-none')) {
                    $("#strip-payment").addClass("d-none");
                }
                $(this).addClass('active'); // Add active class to the clicked list item
            } else if ($(this).hasClass('razorpay')) {
                if (!$("#strip-payment").hasClass('d-none')) {
                    $("#strip-payment").addClass("d-none");
                }
                $(this).addClass('active'); // Add active class to the clicked list item
            }
            else if ($(this).hasClass('FlutterWave')) {
                if (!$("#FlutterWave-payment").hasClass('d-none')) {
                    $("#FlutterWave-payment").addClass("d-none");
                }
                $(this).addClass('active'); // Add active class to the clicked list item
            }
            else if ($(this).hasClass('paypal')) {
                if (!$("#strip-payment").hasClass('d-none')) {
                    $("#strip-payment").addClass("d-none");
                }
                $(this).addClass('active'); // Add active class to the clicked list item
            }
            else if ($(this).hasClass('stripe')) {
                if ($("#strip-payment").hasClass('d-none')) {
                    $("#strip-payment").removeClass("d-none");
                }
                $(this).addClass('active'); // Add active class to the clicked list item
            }
            else {
                if ($("#strip-payment").hasClass('d-none')) {
                    $("#strip-payment").removeClass("d-none");
                }
            }
        });
    });



    // For Service Select
    $('.select-wrap').on('click', function () {
        $(this).addClass('selected').siblings().removeClass('selected');
    })
    //===== Add ballance


    $(function () {
        $('.choose-payment-mathord .payment-method-section .custom-radio').on('click', function () {
            $('.choose-payment-mathord .payment-method-section .custom-radio').removeClass('active'); // Remove active class from all list items
            if ($(this).hasClass('stripe')) {
                $('#StripePayment').show();
                $('#OfflinePayment').hide();
                $(this).addClass('active'); // Add active class to the clicked list item
            }
            else if ($(this).hasClass('paypal')) {
                $('#OfflinePayment').hide();
                $('#StripePayment').hide();
                $(this).addClass('active'); // Add active class to the clicked list item
            }
            else if ($(this).hasClass('razorpay')) {
                $('#OfflinePayment').hide();
                $('#StripePayment').hide();
                $(this).addClass('active'); // Add active class to the clicked list item
            }
            else if ($(this).hasClass('pay-with-card')) {
                $('#OfflinePayment').hide();
                $('#StripePayment').hide();
                $(this).addClass('active'); // Add active class to the clicked list item
            }
            else if ($(this).hasClass('offline')) {
                $('#OfflinePayment').hide();
                $('#StripePayment').hide();
                $(this).addClass('active'); // Add active class to the clicked list item
            }
            else {
                $('#StripePayment').hide();
                $('#OfflinePayment').hide();
            }
        });
    });

    $("input:radio[name=fixed_price]").click(function () {
        var fixed_price = $(this).val();
        if (fixed_price == 'other_amount') {
            $('#OtherPrice').show();
            $('#OtherPrice #modal_other_amount').prop('required', true);
        } else {
            $('#OtherPrice #modal_other_amount').prop('required', false);
            $('#OtherPrice').hide();
            $('.modal_amount_main').text(fixed_price);
            $('.modal_amount_main_val').val(fixed_price);
            
            $('.modal_tax_amount').text(0);
            $('.modal_tax_amount_val').val(0);
            var total_amount = (parseFloat(fixed_price) + parseFloat(0));
            $('.modal_total_amount').text(total_amount);
            $('.modal_total_amount_val').val(total_amount);
        }

        $("#modal_other_amount").bind('keyup', function () {
            var fixed_price = $(this).val();
            $('.modal_amount_main').text(fixed_price);
            $('.modal_amount_main_val').val(fixed_price);
            $('.modal_tax_amount').text(0);
            $('.modal_tax_amount_val').val(0);
            if (fixed_price) {
                var total_amount = (parseFloat(fixed_price) + parseFloat(0));
                $('.modal_total_amount').text(total_amount);
                $('.modal_total_amount_val').val(total_amount);
            } else {
                $('.modal_total_amount').text(0);
                $('.modal_total_amount_val').val(0);
            }
        });

    });
    // Auto slash of Expiry Date
    var card_date = document.getElementById('stripe_card_expiry');
    var card_date_modal = document.getElementById('modal_stripe_card_expiry');

    function checkValue(str, max) {
        if (str.charAt(0) !== '0' || str == '00') {
            var num = parseInt(str);
            if (isNaN(num) || num <= 0 || num > max) num = 1;
            str = num > parseInt(max.toString().charAt(0))
                && num.toString().length == 1 ? '0' + num : num.toString();
        };
        return str;
    };
    if (card_date) {
        card_date.addEventListener('input', function (e) {
            this.type = 'text';
            var input = this.value;
            if (/\D\/$/.test(input)) input = input.substr(0, input.length - 1);
            var values = input.split('/').map(function (v) {
                return v.replace(/\D/g, '')
            });
            if (values[0]) values[0] = checkValue(values[0], 12);
            if (values[1]) values[1] = checkValue(values[1], 50);
            var output = values.map(function (v, i) {
                return v.length == 2 && i < 2 ? v + '/' : v;
            });
            this.value = output.join('').substr(0, 5);
        });
    }
    if (card_date_modal) {
        card_date_modal.addEventListener('input', function (e) {
            this.type = 'text';
            var input = this.value;
            if (/\D\/$/.test(input)) input = input.substr(0, input.length - 1);
            var values = input.split('/').map(function (v) {
                return v.replace(/\D/g, '')
            });
            if (values[0]) values[0] = checkValue(values[0], 12);
            if (values[1]) values[1] = checkValue(values[1], 50);
            var output = values.map(function (v, i) {
                return v.length == 2 && i < 2 ? v + '/' : v;
            });
            this.value = output.join('').substr(0, 5);
        });
    }

    // language change
    if ($('#lang-change').length > 0) {
        $('#lang-change .dropdown-menu li a').each(function () {
            $(this).on('click', function (e) {
                e.preventDefault();
                var $this = $(this);
                var locale = $this.data('flag');
                $.post('/home/changelanguage', { locale: locale }, function (res) {
                    console.log(res);
                    location.reload();
                    if (res.output == 'success') {
                    var successAlertImage = "{{ asset('backend/libraries/cutealert/img/success.svg') }}";
                        cuteToast({
                            type: "success",
                            message: res.message,
                            img: successAlertImage,
                            timer: 1500
                        });

                    }
                });

            });
        });
    }

}(jQuery));