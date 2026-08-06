(function ($) {
    "use strict";

    let requestUrl = window.location.origin;

    var rangeSlider = document.getElementById('slider-range');

    if (rangeSlider != null) {

        let highest_price = parseFloat($("#highest_price").val());
        highest_price = highest_price ? highest_price : 5000;
        var moneyFormat = wNumb({
            decimals: 0,
            thousand: ',',
            prefix: '$'
        });
        noUiSlider.create(rangeSlider, {
            start: [1, highest_price],
            step: 1,
            range: {
                'min': [1],
                'max': [highest_price]
            },
            format: moneyFormat,
            connect: true
        });

        rangeSlider.noUiSlider.on('update', function (values, handle) {
            document.getElementById('slider-range-value1').innerHTML = values[0];
            document.getElementById('slider-range-value2').innerHTML = values[1];
            document.getElementById('min_value').value = moneyFormat.from(values[0]);
            document.getElementById('max_value').value = moneyFormat.from(values[1]);
        });
    }


    $(document).on("change", '.price_order_by', function () {
        filterSearchJob();

    });

    $(document).on('click', '.destination_id li', function () {
        let destination = $(this).data('destination-id');
        filterSearchJob(null, destination);
    });

    $(document).on('click', '.priceRange', function () {
        filterSearchJob();
    })

    $(document).on('click', '.keyword-search', function () {
        filterSearchJob();
    })

    $(document).on("change", '.filter-option', function (e) {
        filterSearchJob();
    })


    $(document).on('click', '.page-item .page-link', function (e) {
        e.preventDefault();
        var page = $(this).attr('href').split('page=')[1];
        filterSearchJob(page);
    });

    $(document).on("click", "#refreshPage", function () {
        location.reload();
    })


    function filterSearchJob(page = null, destination = '') {

        $('.list-grid-product-wrap').addClass('search-loading');
        let min_value = $("#min_value").val();
        let max_value = $("#max_value").val();

        min_value = min_value ? min_value : "";
        max_value = max_value ? max_value : "";

        let keyword = $(".keyword").val();
        keyword = keyword ? keyword : "";
        let product_type = $("#productType").val();
        let widget_name = $("#widget_name").val();
        let item_show = $("#item_show").val();
        let price_order_by = $("#price_order_by").val();

        let url = window.location.origin + "" + window.location.pathname;

        let action = url + "?page=" + page + "&price_order_by=" + price_order_by + "&destinations=" + destination + "&keyword=" + keyword + "&min_value=" + min_value + "&max_value=" + max_value + "&product_type=" + product_type + "&widget_name=" + widget_name + "&item_show=" + item_show;
        $.ajax({
            url: action,
            type: "GET",
            dataType: "json",
            cache: false,
            success: function (data) {
                if (data.status == true) {
                    $("#loadProducts").html(data.products);
                    $(".show_count").html(data.total);
                }
                $('.list-grid-product-wrap').removeClass('search-loading');
            },
            error: function (data) {
                console.log(data);
                alert("Something went wrong, please try again later.");
            }

        })
    }

    function getFilterData(className) {
        var filter = [];
        $('.' + className + ':checked').each(function () {
            filter.push($(this).val());
        });
        return filter;
    }


}(jQuery));

