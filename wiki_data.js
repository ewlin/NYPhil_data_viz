$.ajax({
  url: '//en.wikipedia.org/w/api.php',
  data: { action: 'opensearch', search: 'Richard Feynman', format: 'json' },
  dataType: 'jsonp',
  success: function (x) {
    console.log(x);
  }
});