$(function () {
    "use strict";

    /*------------------------------------------
    --------------------------------------------
    Stripe Payment Code
    --------------------------------------------
    --------------------------------------------*/

    var $form = $(".modal-require-validation");



    $('form.modal-require-validation').bind('submit', function (e) {
        var stripe_token = $('.payment-option .custom-radio input[name="payment_method"]:checked').val();
        if (stripe_token == 'stripe') {
            var $form = $(".modal-require-validation"),
                inputSelector = ['input[type=email]', 'input[type=password]',
                    'input[type=text]', 'input[type=file]',
                    'textarea'
                ].join(', '),
                $inputs = $form.find('.required').find(inputSelector),
                $errorMessage = $form.find('div.error'),
                valid = true;
            $errorMessage.addClass('hide');

            $('.has-error').removeClass('has-error');
            $inputs.each(function (i, el) {
                var $input = $(el);
                if ($input.val() === '') {
                    $input.parent().addClass('has-error');
                    $errorMessage.removeClass('hide');
                    e.preventDefault();
                }
            });

            if (!$form.data('cc-on-file-modal')) {
                var card_date = $('.modal_stripe_card_expiry').val();
                var card_dates = card_date.split("/");
                e.preventDefault();
                Stripe.setPublishableKey($form.data('modal-stripe-publishable-key'));
                Stripe.createToken({
                    number: $('.modal_stripe_card_number').val(),
                    cvc: $('.modal_stripe_cvc').val(),
                    exp_month: card_dates[0],
                    exp_year: card_dates[1],
                }, stripeResponseHandler);
            }
        }
    });

    /*------------------------------------------
    --------------------------------------------
    Stripe Response Handler
    --------------------------------------------
    --------------------------------------------*/
    function stripeResponseHandler(status, response) {
        if (response.error) {
            $('.modal-error')
                .removeClass('d-none')
                .find('.alert')
                .text(response.error.message);
        } else {
            /* token contains id, last4, and card type */
            var token = response['id'];

            $form.find('input[type=text][name=stripeToken]').empty();
            if (token != null) {
                $form.append("<input type='hidden' name='stripeToken' value='" + token + "'/>");
                $form.get(0).submit();
            }
        }
    }

});
