requirejs.config({
  paths: {
    ramda: "https://cdnjs.cloudflare.com/ajax/libs/ramda/0.25.0/ramda.min",
    jquery: "https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min"
  }
});

require(["ramda", "jquery"], (_, $) => {
  const getJSON = _.curry((callback, error, url) => {
    $.getJSON(url, callback).error(error);
  });

  const createButton = _.curry((onClick, text) => {
    return $("<button/>")
      .text(text)
      .click(onClick);
  });

  const getApiUrl = () => {
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

    let selectedCart = _.values(goods).map(price => {
      return {
        price: price
      };
    });

    const rates = _.prop("rates", response);

    const calc = (rates, cart) => {
      const getPrice = _.prop("price");
      const getCartSum = _.compose(
        _.sum,
        _.map(getPrice)
      );

      const multiplyOnCartSum = _.multiply(getCartSum(cart));
      const getPricesAtRate = _.compose(
        _.map(multiplyOnCartSum),
        _.values
      );

      return _.zipObj(_.keys(rates), getPricesAtRate(rates));
    };

    const renderControls = goods => {
      _.map(key => {
        const goodButtonOnClick = () => {
          selectedCart = selectedCart.slice();
          selectedCart.push({
            price: goods[key]
          });

          renderSum();
        };

        const createGoodButton = createButton(goodButtonOnClick);
        $("#controls").append(createGoodButton(key));
      }, _.keys(goods));
    };

    const renderSum = () => {
      const ratesSum = calc(rates, selectedCart);
      const list = $("<ul/>");
      _.map(key => {
        list.append(
          $("<li/>").html("<b>" + key + "</b>" + Math.round(ratesSum[key], 10))
        );
      }, _.keys(ratesSum));

      $("#sum").html(list);
    };

    const init = () => {
      renderControls(goods);
      renderSum();
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
