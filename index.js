requirejs.config({
  paths: {
    ramda: "https://cdnjs.cloudflare.com/ajax/libs/ramda/0.25.0/ramda.min",
    jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min"
  }
});

require(["ramda", "jquery"], function(_, $) {
  // Utils
  const getJSON = _.curry(function(callback, error, url) {
    $.getJSON(url, callback).error(error);
  });

  const createButton = _.curry(function(onClick, text) {
    return $("<button/>")
      .text(text)
      .click(onClick);
  });

  const getApiUrl = function() {
    const DEFAULT_RATE = "USD";
    const SYMBOLS = [DEFAULT_RATE, "RUB", "EUR", "JPY", "GBP"];

    return (
      "https://api.exchangeratesapi.io/latest?base=" +
      DEFAULT_RATE +
      "&symbols=" +
      SYMBOLS.join(",")
    );
  };

  const success = response => {
    const goods = {
      apple: 10,
      pear: 45,
      lemon: 67,
      coco: 1305
    };

    const selectedCart = [
      {
        price: 10
      },
      {
        price: 45
      },
      {
        price: 67
      },
      {
        price: 1305
      }
    ];

    const calc = (rates, cart) => {
      const getPrice = _.prop("price");
      const getCartSum = _.compose(
        _.sum,
        _.map(getPrice)
      );

      const multiplyOnCartSum = _.multiply(getCartSum(cart));
      const getPricesInCourse = _.compose(
        _.map(multiplyOnCartSum),
        _.values
      );

      return _.zipObj(_.keys(rates), getPricesInCourse(rates));
    };

    const rates = _.prop("rates", response);

    const renderControls = goods => {
      _.map(key => {
        const createGoodButton = createButton(() => {
          selectedCart.push({
            price: goods[key]
          });

          renderSum(calc(rates, selectedCart));
        });
        $("#controls").append(createGoodButton(key));
      }, _.keys(goods));
    };

    const renderSum = courcesSum => {
      const list = $("<ul/>");
      _.map(key => {
        list.append(
          $("<li/>").html("<b>" + key + "</b>" + parseInt(courcesSum[key], 10))
        );
      }, _.keys(courcesSum));

      $("#sum").html(list);
    };

    const init = () => {
      renderControls(goods);
      renderSum(calc(rates, selectedCart));
      $("#app").show();
    };

    init();
  };

  const fail = () => {
    console.error("request failed!");
  };

  const app = _.compose(
    getJSON(success, fail),
    getApiUrl
  );

  app();
});
